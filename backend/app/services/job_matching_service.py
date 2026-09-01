"""
Job Intelligence Service
Stub: In production the analysis pipeline is a Celery task (async, never blocking HTTP).
The logic here represents the data flow; the LLM integration is wired in Phase 5.
"""
from sqlalchemy.orm import Session
from app.models.job_matching import Job, JobRequirement, JobKeyword
from app.models.candidate_intelligence import Skill, Experience
from app.models.cv import CVVersion
from app.models.job_matching import MatchAnalysis

ALGORITHM_VERSION = "v1"


def extract_job_data_stub(job: Job, db: Session):
    """
    Stub for async job analysis pipeline.
    In production: dispatched as a Celery task after POST /jobs.
    Produces JobRequirement and JobKeyword rows from raw_description.
    """
    # Simulate basic keyword extraction from raw text
    words = set(job.raw_description.lower().split())
    tech_keywords = ["python", "sql", "react", "management", "agile", "marketing",
                     "hubspot", "salesforce", "data", "analytics", "b2b", "seo"]
    for kw in tech_keywords:
        if kw in words:
            db.add(JobKeyword(job_id=job.id, keyword=kw, frequency=1, is_ats_critical=True))

    # Simulate extracting one generic requirement
    db.add(JobRequirement(
        job_id=job.id,
        requirement="Expérience requise dans le domaine",
        category="experience",
        importance="high",
        mandatory=True,
        extracted_by="ai",
    ))
    job.status = "analyzed"
    db.commit()


def compute_match(profile_id: int, cv_version_id: int, job_id: int, db: Session) -> MatchAnalysis:
    """
    Matching Engine: four statuses per element — confirmed / partial / unconfirmed / missing.
    Computes skill overlap, keyword density, etc.
    Scores are hybrid, never a raw LLM value (ATS Engine principle).
    """
    cv_version = db.query(CVVersion).filter(CVVersion.id == cv_version_id).first()
    job = db.query(Job).filter(Job.id == job_id).first()
    if not cv_version or not job:
        return None

    candidate_skills = {s.name.lower() for s in db.query(Skill).filter(Skill.profile_id == profile_id).all()}
    job_keywords = {k.keyword.lower() for k in job.keywords}

    matched_keywords = candidate_skills & job_keywords
    keyword_score = round(len(matched_keywords) / max(len(job_keywords), 1) * 100, 1)

    strengths = [{"item": kw, "status": "confirmed"} for kw in matched_keywords]
    gaps = [{"item": kw, "status": "missing"} for kw in (job_keywords - candidate_skills)]

    analysis = MatchAnalysis(
        profile_id=profile_id,
        cv_version_id=cv_version_id,
        job_id=job_id,
        overall_score=keyword_score,
        skills_score=keyword_score,
        experience_score=None,  # Requires deeper NLP (Phase 5)
        keyword_score=keyword_score,
        education_score=None,
        strengths=strengths,
        gaps=gaps,
        recommendations=[{"tip": "Add missing keywords to your skills section."}],
        algorithm_version=ALGORITHM_VERSION,
    )
    db.add(analysis)
    db.commit()
    db.refresh(analysis)
    return analysis
