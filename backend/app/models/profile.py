from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, Float, Boolean
from sqlalchemy.sql import func
from app.core.database import Base

class CandidateProfile(Base):
    __tablename__ = "candidate_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, unique=True, nullable=False)
    
    headline = Column(String, nullable=True)
    professional_summary = Column(Text, nullable=True)
    career_goal = Column(Text, nullable=True)
    target_roles = Column(String, nullable=True) # Could be JSON or comma-separated
    
    profile_status = Column(String, default="incomplete")
    is_suspended = Column(Boolean, default=False, nullable=False)
    completeness_score = Column(Float, default=0.0)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
