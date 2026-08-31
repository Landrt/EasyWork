from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Float, JSON, Text
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base
from app.models.evidence_qro import ai_suggestion_evidence


class ATSAnalysis(Base):
    """
    ATS score is a hybrid computation, never a raw LLM value.
    algorithm_version added per correction — ensures historical scores remain comparable.
    """
    __tablename__ = "ats_analyses"

    id = Column(Integer, primary_key=True, index=True)
    cv_version_id = Column(Integer, ForeignKey("cv_versions.id", ondelete="CASCADE"), nullable=False, index=True)
    job_id = Column(Integer, ForeignKey("jobs.id", ondelete="CASCADE"), nullable=False)

    overall_score = Column(Float, nullable=True)
    formatting_score = Column(Float, nullable=True)
    keyword_score = Column(Float, nullable=True)
    readability_score = Column(Float, nullable=True)
    parsing_score = Column(Float, nullable=True)

    algorithm_version = Column(String, nullable=False, default="v1")  # Correction applied

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    issues = relationship("ATSIssue", back_populates="analysis", cascade="all, delete-orphan")


class ATSIssue(Base):
    """Actionable, per-item ATS warning (relational to allow individual resolution tracking)."""
    __tablename__ = "ats_issues"

    id = Column(Integer, primary_key=True, index=True)
    analysis_id = Column(Integer, ForeignKey("ats_analyses.id", ondelete="CASCADE"), nullable=False, index=True)
    category = Column(String, nullable=True)    # e.g. "keyword", "formatting", "length"
    severity = Column(String, nullable=True)    # "critical", "warning", "info"
    message = Column(Text, nullable=False)
    recommendation = Column(Text, nullable=True)

    analysis = relationship("ATSAnalysis", back_populates="issues")


class AISuggestion(Base):
    """
    AI never modifies a CV directly.
    It produces a row here with status='pending'.
    Truth Guard validates evidence_ids before the suggestion reaches the user.
    evidence is linked via the ai_suggestion_evidence N:N junction table (correction applied).
    """
    __tablename__ = "ai_suggestions"

    id = Column(Integer, primary_key=True, index=True)
    cv_version_id = Column(Integer, ForeignKey("cv_versions.id", ondelete="CASCADE"), nullable=False, index=True)
    target_section = Column(String, nullable=True)
    original_text = Column(Text, nullable=True)
    suggested_text = Column(Text, nullable=False)
    reason = Column(Text, nullable=True)
    confidence = Column(Float, nullable=True)
    status = Column(String, default="pending")  # pending / accepted / rejected / edited

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # N:N to evidence via junction table
    evidence = relationship("Evidence", secondary=ai_suggestion_evidence, backref="suggestions")


class AIUsageLog(Base):
    """
    Per-call AI usage tracking. Required (§9) to monitor budget risk on free-tier users.
    Logged for every AI call: optimize, match, parse.
    """
    __tablename__ = "ai_usage_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, nullable=True)
    operation_type = Column(String, nullable=False)  # "optimize", "match", "parse"
    tokens_or_cost = Column(Float, nullable=True)    # estimated cost or token count
    plan_id_at_time = Column(Integer, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
