from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, Boolean
from sqlalchemy.sql import func
from app.core.database import Base


class AuditLog(Base):
    """
    Append-only audit log — lives in PostgreSQL for the MVP.
    Decision rationale: keeping in Postgres avoids extra infrastructure cost at this scale.
    If volume grows, can be streamed to a dedicated store (OpenSearch, etc.) later.

    IMPORTANT: audit logs are RETAINED after ACCOUNT.delete — they are anonymised
    (user_id set to NULL, user_email stored as-is for legal accountability).
    This is the retention decision for §8 (RGPD).
    """
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, nullable=True, index=True)
    user_email_snapshot = Column(String, nullable=True)  # Retained post-deletion for legal traceability
    action = Column(String, nullable=False, index=True)  # e.g. "user.register", "cv.delete", "subscription.checkout"
    resource_type = Column(String, nullable=True)        # e.g. "cv", "subscription", "account"
    resource_id = Column(String, nullable=True)
    ip_hash = Column(String, nullable=True)              # Hashed for GDPR
    detail = Column(Text, nullable=True)                 # JSON-serialised context
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class Notification(Base):
    """
    In-app notifications (§9): import completed, subscription event, affiliate commission generated.
    """
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, nullable=False, index=True)
    type = Column(String, nullable=False)    # "import_complete" / "subscription_event" / "commission_generated"
    payload = Column(Text, nullable=True)    # JSON string with event detail
    read_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
