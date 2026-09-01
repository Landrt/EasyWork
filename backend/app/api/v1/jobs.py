from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.api.deps import get_current_user
from app.api.deps import AuthUser
from app.models.job_matching import Job, MatchAnalysis
from app.models.profile import CandidateProfile
from app.models.cv import CV, CVVersion
from app.schemas.job_matching import JobCreate, JobResponse, MatchAnalysisResponse
from app.services import job_matching_service

router = APIRouter()


# -----------------------------------------------------------------------
# Job Intelligence — JOB.analyze
# -----------------------------------------------------------------------

@router.post("", response_model=JobResponse, status_code=202)
def analyze_job(
    body: JobCreate,
    background_tasks: BackgroundTasks,
    current_user: AuthUser = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    JOB.analyze — Stores raw description, queues async extraction pipeline.
    Returns 202 immediately; client polls job status.
    """
    job = Job(
        user_id=current_user.id,
        title=body.title,
        company=body.company,
        raw_description=body.raw_description,
        status="pending",
    )
    db.add(job)
    db.commit()
    db.refresh(job)

    # Non-blocking: extraction runs in background
    background_tasks.add_task(job_matching_service.extract_job_data_stub, job, db)

    return job


@router.get("", response_model=List[JobResponse])
def list_jobs(
    skip: int = 0, limit: int = 20,
    current_user: AuthUser = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return db.query(Job).filter(Job.user_id == current_user.id).offset(skip).limit(limit).all()


@router.get("/{job_id}", response_model=JobResponse)
def get_job(job_id: int, current_user: AuthUser = Depends(get_current_user), db: Session = Depends(get_db)):
    job = db.query(Job).filter(Job.id == job_id, Job.user_id == current_user.id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return job


# -----------------------------------------------------------------------
# Matching Engine — MATCH.get
# -----------------------------------------------------------------------

@router.post("/{job_id}/match", response_model=MatchAnalysisResponse, status_code=201)
def create_match(
    job_id: int,
    cv_version_id: int,
    current_user: AuthUser = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Triggers a matching analysis between the candidate profile and the job."""
    job = db.query(Job).filter(Job.id == job_id, Job.user_id == current_user.id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    profile = db.query(CandidateProfile).filter(CandidateProfile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(status_code=400, detail="Candidate profile not found")

    # Enforce CV Version ownership check (IDOR mitigation)
    version = db.query(CVVersion).join(CV, CV.id == CVVersion.cv_id).filter(
        CVVersion.id == cv_version_id,
        CV.user_id == current_user.id
    ).first()
    if not version:
        raise HTTPException(status_code=404, detail="CV version not found or access denied")

    analysis = job_matching_service.compute_match(
        profile_id=profile.id,
        cv_version_id=cv_version_id,
        job_id=job_id,
        db=db,
    )
    if not analysis:
        raise HTTPException(status_code=400, detail="Could not compute match — check cv_version_id")
    return analysis


@router.get("/matches/{match_id}", response_model=MatchAnalysisResponse)
def get_match(match_id: int, current_user: AuthUser = Depends(get_current_user), db: Session = Depends(get_db)):
    """MATCH.get"""
    profile = db.query(CandidateProfile).filter(CandidateProfile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    match = db.query(MatchAnalysis).filter(
        MatchAnalysis.id == match_id,
        MatchAnalysis.profile_id == profile.id,
    ).first()
    if not match:
        raise HTTPException(status_code=404, detail="Match analysis not found")
    return match
