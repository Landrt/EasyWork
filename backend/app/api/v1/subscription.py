from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.api.deps import get_current_user
from app.api.deps import AuthUser
from app.models.subscription import Subscription
from app.schemas.subscription import CheckoutRequest, SubscriptionResponse, EntitlementCheckResponse
from app.services import subscription_service

router = APIRouter()


@router.post("/checkout", response_model=SubscriptionResponse, status_code=201)
def checkout(
    body: CheckoutRequest,
    current_user: AuthUser = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    SUBSCRIPTION.checkout
    Validates plan, handles Founder atomic quota, sets expiry.
    In production: provider_reference comes from a validated Stripe webhook, not user input.
    """
    return subscription_service.checkout(
        user_id=current_user.id,
        plan_name=body.tier,
        provider_reference=body.provider_reference or "manual",
        db=db,
    )


@router.post("/cancel", response_model=SubscriptionResponse)
def cancel_subscription(
    current_user: AuthUser = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """SUBSCRIPTION.cancel"""
    sub = subscription_service.get_active_subscription(current_user.id, db)
    if not sub:
        raise HTTPException(status_code=404, detail="No active subscription found")
    sub.status = "cancelled"
    db.commit()
    db.refresh(sub)
    return sub


@router.get("/me", response_model=SubscriptionResponse)
def get_my_subscription(
    current_user: AuthUser = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    sub = subscription_service.get_active_subscription(current_user.id, db)
    if not sub:
        raise HTTPException(status_code=404, detail="No active subscription")
    return sub


@router.get("/can/{feature_key}", response_model=EntitlementCheckResponse)
def check_entitlement(
    feature_key: str,
    current_user: AuthUser = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Programmatic entitlement check — backend is the ONLY source of truth for permissions.
    Frontend may call this to adapt UI, but never trusts its own cached version.
    """
    allowed = subscription_service.user_can(current_user.id, feature_key, db)
    return {"feature_key": feature_key, "allowed": allowed}
