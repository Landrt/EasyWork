from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
from pydantic import BaseModel
from typing import Optional

from app.core.database import get_db
from app.api.deps import get_current_user
from app.api.deps import AuthUser
from app.models.cv import CV, UploadedDocument
from app.models.profile import CandidateProfile
from app.models.candidate_intelligence import Experience, Skill, Education, Project, Certification, Language
from app.models.evidence_qro import QROSession
from app.models.job_matching import Job
from app.models.subscription import Subscription
from app.models.affiliate import Affiliate, Commission
from app.models.audit_notification import Notification
from app.services.audit_service import log_action

router = APIRouter()


class NotificationResponse(BaseModel):
    id: int
    type: str
    payload: Optional[str]
    read_at: Optional[datetime]
    created_at: datetime
    class Config:
        from_attributes = True


class ProfileUpdateRequest(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    headline: Optional[str] = None
    professional_summary: Optional[str] = None


class ProfileResponse(BaseModel):
    headline: Optional[str]
    professional_summary: Optional[str]
    class Config:
        from_attributes = True


@router.get("/notifications", response_model=List[NotificationResponse])
def get_notifications(
    current_user: AuthUser = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return db.query(Notification).filter(
        Notification.user_id == current_user.id
    ).order_by(Notification.created_at.desc()).limit(50).all()


@router.get("/export")
def export_account_data(
    current_user: AuthUser = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    ACCOUNT.exportData — RGPD structured export of all personal data.
    Returns a complete JSON snapshot of everything we hold about the user.
    """
    profile = db.query(CandidateProfile).filter(CandidateProfile.user_id == current_user.id).first()

    data = {
        "user": {
            "id": current_user.id,
            "email": current_user.email,
        },
        "profile": {
            "headline": profile.headline if profile else None,
            "professional_summary": profile.professional_summary if profile else None,
        } if profile else None,
        "experiences": [
            {"company": e.company, "position": e.position, "start_date": str(e.start_date), "end_date": str(e.end_date)}
            for e in db.query(Experience).filter(Experience.profile_id == (profile.id if profile else -1)).all()
        ],
        "skills": [s.name for s in db.query(Skill).filter(Skill.profile_id == (profile.id if profile else -1)).all()],
        "educations": [
            {"institution": ed.institution, "degree": ed.degree}
            for ed in db.query(Education).filter(Education.profile_id == (profile.id if profile else -1)).all()
        ],
        "cvs": [{"id": cv.id, "title": cv.title, "status": cv.status} for cv in db.query(CV).filter(CV.user_id == current_user.id).all()],
        "jobs": [{"id": j.id, "title": j.title, "company": j.company} for j in db.query(Job).filter(Job.user_id == current_user.id).all()],
        "subscriptions": [
            {"plan_id": s.plan_id, "status": s.status, "started_at": str(s.started_at), "expires_at": str(s.expires_at)}
            for s in db.query(Subscription).filter(Subscription.user_id == current_user.id).all()
        ],
        "exported_at": str(datetime.utcnow()),
    }

    log_action(db, "account.export_data", user_id=current_user.id, user_email=current_user.email)
    return JSONResponse(content=data)


@router.patch("/profile")
def update_profile(
    body: ProfileUpdateRequest,
    current_user: AuthUser = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    ACCOUNT.updateProfile — Update first name, last name, headline or summary.
    Creates the profile if it doesn't exist yet.
    """
    profile = db.query(CandidateProfile).filter(CandidateProfile.user_id == current_user.id).first()
    if not profile:
        profile = CandidateProfile(user_id=current_user.id)
        db.add(profile)

    if body.headline is not None:
        profile.headline = body.headline
    if body.professional_summary is not None:
        profile.professional_summary = body.professional_summary

    db.commit()
    db.refresh(profile)
    log_action(db, "account.update_profile", user_id=current_user.id, user_email=current_user.email)
    return {"message": "Profil mis à jour avec succès"}


@router.delete("/delete", status_code=204)
def delete_account(
    current_user: AuthUser = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    ACCOUNT.delete — Complete account deletion (RGPD).

    Because user_id is managed by Neon Auth (String, no local users table), 
    we must manually delete the root entities. Cascading deletes will handle their children.
    """
    # Log the deletion (audit record survives, anonymised)
    log_action(
        db,
        action="account.delete",
        user_id=current_user.id,
        user_email=current_user.email,
        detail={"status": "manual_cascade_deletion"},
    )

    # 1. Delete root entities. Their children (CVVersion, Experience, etc.) 
    # will be deleted via ON DELETE CASCADE in the DB if configured, 
    # or we just delete them explicitly.
    db.query(UploadedDocument).filter(UploadedDocument.user_id == current_user.id).delete()
    db.query(CV).filter(CV.user_id == current_user.id).delete()
    db.query(Job).filter(Job.user_id == current_user.id).delete()
    db.query(Subscription).filter(Subscription.user_id == current_user.id).delete()
    db.query(Affiliate).filter(Affiliate.user_id == current_user.id).delete()
    db.query(Notification).filter(Notification.user_id == current_user.id).delete()
    
    # Profile deletion (cascades to skills, experiences, etc.)
    db.query(CandidateProfile).filter(CandidateProfile.user_id == current_user.id).delete()
    
    db.commit()
