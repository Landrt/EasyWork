from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, JSON, Boolean, LargeBinary
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base


class UploadedDocument(Base):
    """
    Traces every file stored on S3. Required for:
    - ACCOUNT.delete (secure file deletion)
    - evidence.source_reference for cv_import proofs
    """
    __tablename__ = "uploaded_documents"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, nullable=False, index=True)
    file_data = Column(LargeBinary, nullable=False)  # MVP: store files directly in PostgreSQL as BYTEA
    original_filename = Column(String, nullable=False)
    mime_type = Column(String, nullable=False)
    size_bytes = Column(Integer, nullable=False)
    purpose = Column(String, nullable=False)  # cv_import / export
    status = Column(String, default="uploaded")  # uploaded / processing / processed / failed
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class Template(Base):
    __tablename__ = "templates"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, unique=True)
    description = Column(Text, nullable=True)
    preview_url = Column(String, nullable=True)
    configuration = Column(JSON, nullable=True)  # Layout rules vary per template → JSON justified
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    cvs = relationship("CV", back_populates="template")


class CV(Base):
    """
    Correction applied: target_job_id removed from this table.
    The CV↔job link lives in match_analyses(cv_version_id, job_id) instead.
    """
    __tablename__ = "cvs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, nullable=False, index=True)
    profile_id = Column(Integer, ForeignKey("candidate_profiles.id", ondelete="CASCADE"), nullable=False)
    title = Column(String, nullable=False, default="Mon CV")
    template_id = Column(Integer, ForeignKey("templates.id"), nullable=True)
    status = Column(String, default="draft")  # draft / published / archived
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    template = relationship("Template", back_populates="cvs")
    versions = relationship("CVVersion", back_populates="cv", cascade="all, delete-orphan", order_by="CVVersion.version_number")


class CVVersion(Base):
    """
    JSON content is justified here: a CV is a presentation document whose
    structure varies by template. This is NOT the source of truth for candidate data.

    Optimistic locking: `row_version` is checked on every write to cv_sections
    (addSection / removeSection / reorderSections). If client sends a stale
    row_version, the endpoint returns HTTP 409 Conflict.
    """
    __tablename__ = "cv_versions"

    id = Column(Integer, primary_key=True, index=True)
    cv_id = Column(Integer, ForeignKey("cvs.id", ondelete="CASCADE"), nullable=False, index=True)
    version_number = Column(Integer, nullable=False, default=1)
    # content holds the full rendered sections structure
    content = Column(JSON, nullable=True)
    row_version = Column(Integer, nullable=False, default=1)  # Optimistic lock counter
    created_by = Column(String, default="user")  # user / ai / system
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    cv = relationship("CV", back_populates="versions")
