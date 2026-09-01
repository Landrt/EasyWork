from sqlalchemy import Column, Integer, String, ForeignKey
from app.core.database import Base

# Note: Complete Subscription/Plan module will be fully fleshed out in Phase 6.
# This is a skeleton as requested in Phase 1 to prevent hardcoding permissions.

class Plan(Base):
    __tablename__ = "plans"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False) # e.g. 'FREE', 'SPRINT', 'ACTIVE', 'FOUNDER'

class PlanEntitlement(Base):
    __tablename__ = "plan_entitlements"
    
    id = Column(Integer, primary_key=True, index=True)
    plan_id = Column(Integer, ForeignKey("plans.id", ondelete="CASCADE"), nullable=False)
    feature_key = Column(String, nullable=False, index=True) # e.g. 'advanced_ats', 'export_docx'
    value = Column(String, nullable=True) # e.g. 'true', '5', 'unlimited'
