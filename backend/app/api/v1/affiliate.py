from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from typing import List
from pydantic import BaseModel
from datetime import datetime
import uuid, io, csv

from app.core.database import get_db
from app.api.deps import get_current_user
from app.api.deps import AuthUser
from app.models.affiliate import Affiliate, AffiliateLink, Commission, Payout

router = APIRouter()


class AffiliateResponse(BaseModel):
    id: int
    affiliate_code: str
    commission_rate: float
    status: str
    created_at: datetime
    class Config:
        from_attributes = True

class CommissionResponse(BaseModel):
    id: int
    amount: float
    rate_applied: float
    status: str
    created_at: datetime
    class Config:
        from_attributes = True

class ConversionItemResponse(BaseModel):
    id: int
    date: str
    referred_user: str
    plan: str
    commission: float
    status: str

class AffiliateDashboardResponse(BaseModel):
    affiliate_code: str
    referral_link: str
    commission_rate: float  # Dynamic from DB, e.g. 0.30
    commission_rate_display: str  # e.g. "30%"
    # 4 Counters
    total_clicks: int
    total_signups: int
    total_conversions: int
    conversion_rate: float
    # 3 Commission metrics
    commissions_generated: float
    commissions_pending: float
    commissions_paid: float
    # Conversion history
    conversions: List[ConversionItemResponse]


class AffiliateStatsResponse(BaseModel):
    affiliate_code: str
    commission_rate: float
    total_clicks: int
    total_conversions: int
    total_commissions_pending: float
    commissions: List[CommissionResponse]

def _get_or_create_affiliate(user: AuthUser, db: Session) -> Affiliate:
    aff = db.query(Affiliate).filter(Affiliate.user_id == user.id).first()
    if not aff:
        code = str(uuid.uuid4())[:8].upper()
        aff = Affiliate(user_id=user.id, affiliate_code=code, commission_rate=0.30)
        db.add(aff)

        link = AffiliateLink(affiliate=aff, url=f"https://resumepro.app/?ref={code}")
        db.add(link)
        db.commit()
        db.refresh(aff)
    return aff

@router.get("/dashboard", response_model=AffiliateDashboardResponse)
def get_affiliate_dashboard(
    current_user: AuthUser = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    AFFILIATE.dashboard — Enriched endpoint for the affiliate space.
    Calculates dynamic rates, 4 counters, 3 commission states, and conversion history.
    """
    aff = _get_or_create_affiliate(current_user, db)
    
    link = aff.links[0] if aff.links else None
    ref_url = link.url if link else f"https://resumepro.app/?ref={aff.affiliate_code}"

    total_clicks = sum(len(l.clicks) for l in aff.links) if aff.links else 0
    all_conversions = aff.conversions or []
    total_signups = len([c for c in all_conversions if c.status in ("registered", "subscribed", "paid")])
    paid_conversions = [c for c in all_conversions if c.status in ("subscribed", "paid")]
    total_conversions_count = len(paid_conversions)

    conv_rate = round((total_conversions_count / max(total_clicks, 1)) * 100, 2)

    commissions = db.query(Commission).filter(Commission.affiliate_id == aff.id).order_by(Commission.created_at.desc()).all()
    
    total_generated = sum(c.amount for c in commissions if c.status in ("pending", "paid"))
    pending_amount = sum(c.amount for c in commissions if c.status == "pending")
    paid_amount = sum(c.amount for c in commissions if c.status == "paid")

    # Format conversions history
    conversions_list = []
    for c in commissions:
        # Anonymise referred user for GDPR compliance
        user_anon = f"User-{str(c.conversion_id)[-4:]}"
        conversions_list.append(ConversionItemResponse(
            id=c.id,
            date=c.created_at.strftime("%Y-%m-%d") if c.created_at else "Récemment",
            referred_user=user_anon,
            plan="Recherche Active" if c.amount >= 8.0 else "Sprint",
            commission=round(c.amount, 2),
            status=c.status
        ))

    rate_percent = f"{int(aff.commission_rate * 100)}%"

    return {
        "affiliate_code": aff.affiliate_code,
        "referral_link": ref_url,
        "commission_rate": aff.commission_rate,
        "commission_rate_display": rate_percent,
        "total_clicks": total_clicks,
        "total_signups": total_signups,
        "total_conversions": total_conversions_count,
        "conversion_rate": conv_rate,
        "commissions_generated": round(total_generated, 2),
        "commissions_pending": round(pending_amount, 2),
        "commissions_paid": round(paid_amount, 2),
        "conversions": conversions_list
    }


@router.get("/stats", response_model=AffiliateStatsResponse)
def get_affiliate_stats(
    current_user: AuthUser = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """AFFILIATE.getStats — Paginated history of referrals and commissions."""
    aff = db.query(Affiliate).filter(Affiliate.user_id == current_user.id).first()
    if not aff:
        raise HTTPException(status_code=404, detail="No affiliate account found. Call GET /affiliate/link first.")

    total_clicks = sum(len(link.clicks) for link in aff.links)
    total_conversions = len(aff.conversions)
    commissions = db.query(Commission).filter(Commission.affiliate_id == aff.id).all()
    pending_total = sum(c.amount for c in commissions if c.status == "pending")

    return {
        "affiliate_code": aff.affiliate_code,
        "commission_rate": aff.commission_rate,
        "total_clicks": total_clicks,
        "total_conversions": total_conversions,
        "total_commissions_pending": pending_total,
        "commissions": commissions,
    }


@router.post("/payout", status_code=201)
def request_payout(
    current_user: AuthUser = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """AFFILIATE.requestPayout — Request a bank transfer of pending commissions."""
    aff = db.query(Affiliate).filter(Affiliate.user_id == current_user.id).first()
    if not aff:
        raise HTTPException(status_code=404, detail="No affiliate account found")

    pending_commissions = db.query(Commission).filter(
        Commission.affiliate_id == aff.id,
        Commission.status == "pending"
    ).all()

    if not pending_commissions:
        raise HTTPException(status_code=400, detail="No pending commissions to pay out")

    total = sum(c.amount for c in pending_commissions)

    payout = Payout(
        affiliate_id=aff.id,
        amount=total,
        status="requested",
    )
    db.add(payout)

    for c in pending_commissions:
        c.status = "paid"

    db.commit()
    db.refresh(payout)
    return {"message": "Demande de virement créée", "amount": total, "payout_id": payout.id}


@router.get("/export")
def export_commissions_csv(
    current_user: AuthUser = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """AFFILIATE.exportCSV — Download commission history as a CSV file."""
    aff = db.query(Affiliate).filter(Affiliate.user_id == current_user.id).first()
    if not aff:
        raise HTTPException(status_code=404, detail="No affiliate account found")

    commissions = db.query(Commission).filter(Commission.affiliate_id == aff.id).order_by(Commission.created_at.desc()).all()

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["ID", "Montant", "Taux appliqué", "Statut", "Date"])
    for c in commissions:
        writer.writerow([c.id, c.amount, c.rate_applied, c.status, c.created_at.isoformat()])

    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=commissions.csv"}
    )
