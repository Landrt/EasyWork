from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class CheckoutRequest(BaseModel):
    tier: str  # FREE / SPRINT / ACTIVE / FOUNDER
    provider_reference: Optional[str] = "manual"  # Stripe payment ID in production

class SubscriptionResponse(BaseModel):
    id: int
    user_id: int
    plan_id: int
    status: str
    started_at: datetime
    expires_at: Optional[datetime]
    provider_reference: Optional[str]
    class Config:
        from_attributes = True

class EntitlementCheckResponse(BaseModel):
    feature_key: str
    allowed: bool
