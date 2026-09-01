from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Float, Boolean
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base


class Affiliate(Base):
    """
    commission_rate stored in DB (not hardcoded) so individual rates can differ.
    Default 30% at launch — changeable per affiliate without code changes.
    """
    __tablename__ = "affiliates"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, unique=True, nullable=False)
    affiliate_code = Column(String, unique=True, nullable=False, index=True)
    commission_rate = Column(Float, default=0.30, nullable=False)  # 0.30 = 30%
    status = Column(String, default="active")  # active / suspended
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    links = relationship("AffiliateLink", back_populates="affiliate", cascade="all, delete-orphan")
    conversions = relationship("AffiliateConversion", back_populates="affiliate")


class AffiliateLink(Base):
    __tablename__ = "affiliate_links"

    id = Column(Integer, primary_key=True, index=True)
    affiliate_id = Column(Integer, ForeignKey("affiliates.id", ondelete="CASCADE"), nullable=False)
    url = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    affiliate = relationship("Affiliate", back_populates="links")
    clicks = relationship("AffiliateClick", back_populates="link", cascade="all, delete-orphan")


class AffiliateClick(Base):
    __tablename__ = "affiliate_clicks"

    id = Column(Integer, primary_key=True, index=True)
    link_id = Column(Integer, ForeignKey("affiliate_links.id", ondelete="CASCADE"), nullable=False)
    ip_hash = Column(String, nullable=True)  # Hashed for privacy (GDPR)
    user_agent = Column(String, nullable=True)
    clicked_at = Column(DateTime(timezone=True), server_default=func.now())

    link = relationship("AffiliateLink", back_populates="clicks")


class AffiliateConversion(Base):
    """Visitor → registration → subscription attribution chain."""
    __tablename__ = "affiliate_conversions"

    id = Column(Integer, primary_key=True, index=True)
    affiliate_id = Column(Integer, ForeignKey("affiliates.id"), nullable=False)
    referred_user_id = Column(String, nullable=True)
    subscription_id = Column(Integer, ForeignKey("subscriptions.id", ondelete="SET NULL"), nullable=True)
    status = Column(String, default="registered")  # registered / subscribed / paid
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    affiliate = relationship("Affiliate", back_populates="conversions")


class Commission(Base):
    """Generated when a referred user subscribes. Rate from affiliate.commission_rate."""
    __tablename__ = "commissions"

    id = Column(Integer, primary_key=True, index=True)
    affiliate_id = Column(Integer, ForeignKey("affiliates.id"), nullable=False)
    conversion_id = Column(Integer, ForeignKey("affiliate_conversions.id"), nullable=False)
    amount = Column(Float, nullable=False)
    rate_applied = Column(Float, nullable=False)  # Snapshot of rate at time of commission
    status = Column(String, default="pending")    # pending / paid / cancelled
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class Payout(Base):
    __tablename__ = "payouts"

    id = Column(Integer, primary_key=True, index=True)
    affiliate_id = Column(Integer, ForeignKey("affiliates.id"), nullable=False)
    amount = Column(Float, nullable=False)
    status = Column(String, default="pending")  # pending / processed / failed
    processed_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
