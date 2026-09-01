from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Boolean, Text, Table
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base

# N:N junction table between ai_suggestions and evidence
# (Correction applied: replaces the incorrect `evidence_ids` array field)
ai_suggestion_evidence = Table(
    "ai_suggestion_evidence",
    Base.metadata,
    Column("suggestion_id", Integer, ForeignKey("ai_suggestions.id", ondelete="CASCADE"), primary_key=True),
    Column("evidence_id", Integer, ForeignKey("evidence.id", ondelete="CASCADE"), primary_key=True),
)


class Evidence(Base):
    """
    Foundation of Truth Guard. Every piece of data the AI can cite must
    have a row here. source_type traces where the data came from.
    source_reference links to the originating record (e.g. uploaded_document.id, qro_message.id).
    """
    __tablename__ = "evidence"

    id = Column(Integer, primary_key=True, index=True)
    profile_id = Column(Integer, ForeignKey("candidate_profiles.id", ondelete="CASCADE"), nullable=False, index=True)
    source_type = Column(String, nullable=False)  # cv_import / qro / manual / user_confirmation
    source_reference = Column(String, nullable=True)  # e.g. "uploaded_document:42" or "qro_message:17"
    raw_content = Column(Text, nullable=True)
    verified = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class QROSession(Base):
    __tablename__ = "qro_sessions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, nullable=False, index=True)
    profile_id = Column(Integer, ForeignKey("candidate_profiles.id", ondelete="CASCADE"), nullable=False, index=True)
    status = Column(String, default="in_progress")  # in_progress / completed / abandoned
    current_step = Column(Integer, default=0)
    progress = Column(Integer, default=0)  # 0-100 percentage
    started_at = Column(DateTime(timezone=True), server_default=func.now())
    completed_at = Column(DateTime(timezone=True), nullable=True)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    messages = relationship("QROMessage", back_populates="session", cascade="all, delete-orphan")


class QROMessage(Base):
    __tablename__ = "qro_messages"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey("qro_sessions.id", ondelete="CASCADE"), nullable=False, index=True)
    role = Column(String, nullable=False)  # "assistant" or "user"
    content = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    session = relationship("QROSession", back_populates="messages")
