"""
Subscription & Entitlement Service
- Resolves user permissions via plan_entitlements (never hardcoded plan names)
- Handles Founder quota with SELECT FOR UPDATE (atomic, prevents double-booking)
- Checks expiry on every entitlement lookup (not a static flag)
"""
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from sqlalchemy import select
from fastapi import HTTPException

from app.models.subscription import Plan, PlanEntitlement, Subscription


def get_active_subscription(user_id: str, db: Session) -> Subscription | None:
    """Returns the active, non-expired subscription for a user."""
    now = datetime.now(timezone.utc)
    return db.query(Subscription).filter(
        Subscription.user_id == user_id,
        Subscription.status == "active",
        (Subscription.expires_at == None) | (Subscription.expires_at > now),
    ).first()


def user_can(user_id: str, feature_key: str, db: Session) -> bool:
    """
    Checks if a user has a specific feature entitlement.
    Resolution: user → active subscription → plan → plan_entitlements[feature_key]
    This is the ONLY way permissions are checked — never `if plan_name == "PRO"`.
    """
    sub = get_active_subscription(user_id, db)
    if not sub:
        # Fall back to FREE plan entitlements
        free_plan = db.query(Plan).filter(Plan.name == "FREE").first()
        if not free_plan:
            return False
        plan_id = free_plan.id
    else:
        plan_id = sub.plan_id

    entitlement = db.query(PlanEntitlement).filter(
        PlanEntitlement.plan_id == plan_id,
        PlanEntitlement.feature_key == feature_key,
    ).first()

    if not entitlement:
        return False
    return entitlement.value not in (None, "false", "0")


def checkout(user_id: str, plan_name: str, provider_reference: str, db: Session) -> Subscription:
    """
    Creates a subscription.
    For the FOUNDER plan: uses SELECT FOR UPDATE to atomically claim a slot.
    Two simultaneous buyers of the last slot will never both succeed.
    """
    plan = db.query(Plan).filter(Plan.name == plan_name, Plan.is_active == True).with_for_update().first()
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found or inactive")

    # Atomic Founder quota check (correction: SELECT FOR UPDATE prevents race conditions)
    if plan.max_slots is not None:
        if plan.slots_taken >= plan.max_slots:
            raise HTTPException(status_code=409, detail="Accès Fondateur complet — quota atteint")
        plan.slots_taken += 1

    # Compute expiry
    expires_at = None
    if plan.duration_days:
        from datetime import timedelta
        expires_at = datetime.now(timezone.utc) + timedelta(days=plan.duration_days)

    # Cancel previous active subscription if any
    old_sub = get_active_subscription(user_id, db)
    if old_sub:
        old_sub.status = "cancelled"

    sub = Subscription(
        user_id=user_id,
        plan_id=plan.id,
        status="active",
        expires_at=expires_at,
        provider_reference=provider_reference,
    )
    db.add(sub)
    db.commit()
    db.refresh(sub)
    return sub
