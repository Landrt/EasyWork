from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.api.deps import get_current_user
from app.api.deps import AuthUser
from app.models.ats_ai import ATSAnalysis, ATSIssue, AISuggestion
from app.models.profile import CandidateProfile
from app.models.cv import CVVersion
from app.models.job_matching import Job, JobKeyword
from app.schemas.ats_ai import (
    ATSAnalysisResponse, AISuggestionResponse,
    SuggestionEditRequest, OptimizeRequest,
)
from app.services import truth_guard

router = APIRouter()

ALGORITHM_VERSION = "v1"


def _verify_cv_version_ownership(cv_version_id: int, user: AuthUser, db: Session) -> CVVersion:
    """Ensure the CV version belongs to the authenticated user."""
    version = db.query(CVVersion).filter(CVVersion.id == cv_version_id).first()
    if not version:
        raise HTTPException(status_code=404, detail="CV version not found")
    # Join up to CV to check user ownership
    from app.models.cv import CV
    cv = db.query(CV).filter(CV.id == version.cv_id, CV.user_id == user.id).first()
    if not cv:
        raise HTTPException(status_code=403, detail="Access denied")
    return version


# -----------------------------------------------------------------------
# ATS Engine
# -----------------------------------------------------------------------

@router.post("/ats", response_model=ATSAnalysisResponse, status_code=201)
def run_ats_analysis(
    body: OptimizeRequest,
    current_user: AuthUser = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Runs ATS scoring on a cv_version against a job.
    Score is deterministic/hybrid — not a raw LLM output.
    """
    version = _verify_cv_version_ownership(body.cv_version_id, current_user, db)
    job = db.query(Job).filter(Job.id == body.job_id, Job.user_id == current_user.id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    # Compute hybrid scores
    cv_sections = (version.content or {}).get("sections", [])
    section_count = len(cv_sections)
    formatting_score = min(100.0, section_count * 20.0)  # Basic heuristic

    job_keywords = {k.keyword.lower() for k in job.keywords}
    cv_text = str(version.content).lower()
    keyword_hits = sum(1 for kw in job_keywords if kw in cv_text)
    keyword_score = round(keyword_hits / max(len(job_keywords), 1) * 100, 1)

    overall_score = round((formatting_score + keyword_score) / 2, 1)

    analysis = ATSAnalysis(
        cv_version_id=body.cv_version_id,
        job_id=body.job_id,
        overall_score=overall_score,
        formatting_score=formatting_score,
        keyword_score=keyword_score,
        readability_score=None,
        parsing_score=None,
        algorithm_version=ALGORITHM_VERSION,
    )
    db.add(analysis)
    db.flush()

    # Generate issues for missing keywords
    missing_keywords = [kw for kw in job_keywords if kw not in cv_text]
    for kw in missing_keywords[:5]:  # Cap at 5 issues per analysis
        db.add(ATSIssue(
            analysis_id=analysis.id,
            category="keyword",
            severity="warning",
            message=f"Mot-clé ATS manquant : '{kw}'",
            recommendation=f"Ajoutez '{kw}' dans la section Compétences ou Expérience.",
        ))

    db.commit()
    db.refresh(analysis)
    return analysis


# -----------------------------------------------------------------------
# AI Optimization Engine (gated by Truth Guard)
# -----------------------------------------------------------------------

@router.post("/optimize", response_model=List[AISuggestionResponse], status_code=201)
def optimize_cv(
    body: OptimizeRequest,
    current_user: AuthUser = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    AI.optimize — Generates suggestions, each passing through Truth Guard.
    Logs AI usage for budget monitoring (§9).
    """
    profile = db.query(CandidateProfile).filter(CandidateProfile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(status_code=400, detail="Profile not found")

    _verify_cv_version_ownership(body.cv_version_id, current_user, db)
    job = db.query(Job).filter(Job.id == body.job_id, Job.user_id == current_user.id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    # Log AI usage (§9 — budget monitoring)
    truth_guard.log_ai_usage(
        user_id=current_user.id,
        operation_type="optimize",
        tokens_or_cost=0.02,  # Stub cost — real value comes from LLM API response
        plan_id=None,
        db=db,
    )

    # Generate stub suggestions; each is validated by Truth Guard before creation
    stub_proposals = [
        {
            "section": "experience",
            "original": "Gestion de campagnes marketing",
            "suggestion": "Dirigé des campagnes marketing multicanales avec un ROI de +35%",
            "reason": "Verbe d'action fort + métrique quantifiable",
            "keywords": ["campagnes", "marketing", "roi"],
        },
    ]

    created = []
    for proposal in stub_proposals:
        result = truth_guard.create_suggestion_if_supported(
            cv_version_id=body.cv_version_id,
            profile_id=profile.id,
            target_section=proposal["section"],
            original_text=proposal["original"],
            suggested_text=proposal["suggestion"],
            reason=proposal["reason"],
            claim_keywords=proposal["keywords"],
            confidence=0.85,
            db=db,
        )
        if result:
            created.append(result)

    return created


# -----------------------------------------------------------------------
# Suggestion lifecycle (accept / reject / edit / explain)
# -----------------------------------------------------------------------

def _get_suggestion(suggestion_id: int, user: User, db: Session) -> AISuggestion:
    s = db.query(AISuggestion).filter(AISuggestion.id == suggestion_id).first()
    if not s:
        raise HTTPException(status_code=404, detail="Suggestion not found")
    # Verify ownership via cv_version → cv → user
    _verify_cv_version_ownership(s.cv_version_id, user, db)
    return s


@router.post("/suggestions/{suggestion_id}/accept", response_model=AISuggestionResponse)
def accept_suggestion(suggestion_id: int, current_user: AuthUser = Depends(get_current_user), db: Session = Depends(get_db)):
    """AI.suggestion.accept"""
    s = _get_suggestion(suggestion_id, current_user, db)
    s.status = "accepted"
    db.commit()
    db.refresh(s)
    return s


@router.post("/suggestions/{suggestion_id}/reject", response_model=AISuggestionResponse)
def reject_suggestion(suggestion_id: int, current_user: AuthUser = Depends(get_current_user), db: Session = Depends(get_db)):
    """AI.suggestion.reject"""
    s = _get_suggestion(suggestion_id, current_user, db)
    s.status = "rejected"
    db.commit()
    db.refresh(s)
    return s


@router.patch("/suggestions/{suggestion_id}", response_model=AISuggestionResponse)
def edit_suggestion(
    suggestion_id: int, body: SuggestionEditRequest,
    current_user: AuthUser = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """AI.suggestion.edit — User modifies the suggestion text before applying."""
    s = _get_suggestion(suggestion_id, current_user, db)
    s.suggested_text = body.suggested_text
    s.status = "edited"
    db.commit()
    db.refresh(s)
    return s


@router.get("/suggestions/{suggestion_id}/explanation", response_model=AISuggestionResponse)
def explain_suggestion(suggestion_id: int, current_user: AuthUser = Depends(get_current_user), db: Session = Depends(get_db)):
    """AI.suggestion.explain — Returns suggestion with linked evidence."""
    return _get_suggestion(suggestion_id, current_user, db)
