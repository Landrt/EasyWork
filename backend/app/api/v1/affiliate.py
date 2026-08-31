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


@router.get("/link", response_model=AffiliateResponse)
def get_affiliate_link(
    current_user: AuthUser = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """AFFILIATE.getLink — Returns (or creates) affiliate account and referral link."""
    aff = _get_or_create_affiliate(current_user, db)
    return aff


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
