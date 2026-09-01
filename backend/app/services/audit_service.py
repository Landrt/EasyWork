"""
Audit Log Service
Centralises all audit writes so every sensitive action goes through the same path.
Called from endpoints — not from models — to maintain the service layer separation.
"""
import json
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from app.models.audit_notification import AuditLog, Notification


def log_action(
    db: Session,
    action: str,
    user_id: int | None = None,
    user_email: str | None = None,
    resource_type: str | None = None,
    resource_id: str | None = None,
    detail: dict | None = None,
    ip_hash: str | None = None,
):
    """Write an audit log entry. Called for every sensitive action in the system."""
    entry = AuditLog(
        user_id=user_id,
        user_email_snapshot=user_email,
        action=action,
        resource_type=resource_type,
        resource_id=str(resource_id) if resource_id else None,
        ip_hash=ip_hash,
        detail=json.dumps(detail) if detail else None,
    )
    db.add(entry)
    db.commit()


def notify(db: Session, user_id: int, notif_type: str, payload: dict | None = None):
    """Create an in-app notification. Called from background tasks (import, subscription, commission)."""
    n = Notification(
        user_id=user_id,
        type=notif_type,
        payload=json.dumps(payload) if payload else None,
    )
    db.add(n)
    db.commit()
