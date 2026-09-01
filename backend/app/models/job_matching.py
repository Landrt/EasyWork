from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, Boolean, Float, JSON
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base


class Job(Base):
    """Stores a raw job offer and its parsed structured data."""
    __tablename__ = "jobs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, nullable=False, index=True)
    title = Column(String, nullable=True)
    company = Column(String, nullable=True)
    raw_description = Column(Text, nullable=False)
    status = Column(String, default="pending")  # pending / analyzed / failed
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    requirements = relationship("JobRequirement", back_populates="job", cascade="all, delete-orphan")
    keywords = relationship("JobKeyword", back_populates="job", cascade="all, delete-orphan")


class JobRequirement(Base):
    """
    A single extracted requirement from the job offer.
    Relational so Matching Engine can JOIN directly with candidate skills/experiences.
    """
    __tablename__ = "job_requirements"

    id = Column(Integer, primary_key=True, index=True)
    job_id = Column(Integer, ForeignKey("jobs.id", ondelete="CASCADE"), nullable=False, index=True)
    requirement = Column(Text, nullable=False)
    category = Column(String, nullable=True)   # e.g. "skill", "experience", "education"
    importance = Column(String, nullable=True)  # "high", "medium", "low"
    mandatory = Column(Boolean, default=False)
    extracted_by = Column(String, default="ai")  # ai / manual

    job = relationship("Job", back_populates="requirements")


class JobKeyword(Base):
    __tablename__ = "job_keywords"

    id = Column(Integer, primary_key=True, index=True)
    job_id = Column(Integer, ForeignKey("jobs.id", ondelete="CASCADE"), nullable=False, index=True)
    keyword = Column(String, nullable=False)
    frequency = Column(Integer, default=1)
    is_ats_critical = Column(Boolean, default=False)

    job = relationship("Job", back_populates="keywords")


class MatchAnalysis(Base):
    """
    Result of comparing a candidate profile against a job via a specific CV version.
    algorithm_version added per correction — scores from different algorithm versions are incomparable.
    """
    __tablename__ = "match_analyses"

    id = Column(Integer, primary_key=True, index=True)
    profile_id = Column(Integer, ForeignKey("candidate_profiles.id", ondelete="CASCADE"), nullable=False, index=True)
    cv_version_id = Column(Integer, ForeignKey("cv_versions.id", ondelete="CASCADE"), nullable=False)
    job_id = Column(Integer, ForeignKey("jobs.id", ondelete="CASCADE"), nullable=False)

    overall_score = Column(Float, nullable=True)
    skills_score = Column(Float, nullable=True)
    experience_score = Column(Float, nullable=True)
    keyword_score = Column(Float, nullable=True)
    education_score = Column(Float, nullable=True)

    # JSON justified: AI-generated structured detail, not source of truth
    strengths = Column(JSON, nullable=True)
    gaps = Column(JSON, nullable=True)
    recommendations = Column(JSON, nullable=True)

    algorithm_version = Column(String, nullable=False, default="v1")  # Correction: enables score comparability
    created_at = Column(DateTime(timezone=True), server_default=func.now())
