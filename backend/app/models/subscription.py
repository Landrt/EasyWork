from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Float, Boolean, UniqueConstraint
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base


class Plan(Base):
    """
    Pricing plans — no prices hardcoded in business logic.
    Values come from this table and plan_entitlements.
    """
    __tablename__ = "plans"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)  # FREE / SPRINT / ACTIVE / FOUNDER
    display_name = Column(String, nullable=True)
    price = Column(Float, nullable=False, default=0.0)
    currency = Column(String, default="EUR")
    duration_days = Column(Integer, nullable=True)  # None = recurring; 14 = SPRINT; None = lifetime for FOUNDER
    is_recurring = Column(Boolean, default=False)
    # Founder quota — tracked in DB, not cosmetic
    max_slots = Column(Integer, nullable=True)   # NULL = unlimited; 200 for FOUNDER
    slots_taken = Column(Integer, default=0)     # Atomically incremented via SELECT FOR UPDATE
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    entitlements = relationship("PlanEntitlement", back_populates="plan", cascade="all, delete-orphan")


class PlanEntitlement(Base):
    """
    user.can("advanced_ats") resolves through this table.
    No `if plan == "PRO"` anywhere in business logic.
    """
    __tablename__ = "plan_entitlements"

    id = Column(Integer, primary_key=True, index=True)
    plan_id = Column(Integer, ForeignKey("plans.id", ondelete="CASCADE"), nullable=False)
    feature_key = Column(String, nullable=False, index=True)
    value = Column(String, nullable=True)  # "true" / "5" / "unlimited"

    plan = relationship("Plan", back_populates="entitlements")
    __table_args__ = (UniqueConstraint("plan_id", "feature_key", name="uq_plan_feature"),)


class Subscription(Base):
    """
    Entitlements derive from plan + expires_at (not a binary flag).
    Sprint expires after 14 days automatically.
    """
    __tablename__ = "subscriptions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, nullable=False, index=True)
    plan_id = Column(Integer, ForeignKey("plans.id"), nullable=False)
    status = Column(String, default="active")  # active / cancelled / expired
    started_at = Column(DateTime(timezone=True), server_default=func.now())
    expires_at = Column(DateTime(timezone=True), nullable=True)  # NULL = perpetual (FOUNDER)
    provider_reference = Column(String, nullable=True)  # Stripe payment ID etc.
    created_at = Column(DateTime(timezone=True), server_default=func.now())
