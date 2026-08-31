from pydantic import BaseModel
from typing import Optional, List, Any
from datetime import datetime


class JobCreate(BaseModel):
    raw_description: str
    title: Optional[str] = None
    company: Optional[str] = None


class JobRequirementResponse(BaseModel):
    id: int
    requirement: str
    category: Optional[str]
    importance: Optional[str]
    mandatory: bool
    extracted_by: str
    class Config:
        from_attributes = True


class JobKeywordResponse(BaseModel):
    id: int
    keyword: str
    frequency: int
    is_ats_critical: bool
    class Config:
        from_attributes = True


class JobResponse(BaseModel):
    id: int
    user_id: int
    title: Optional[str]
    company: Optional[str]
    status: str
    created_at: datetime
    requirements: List[JobRequirementResponse] = []
    keywords: List[JobKeywordResponse] = []
    class Config:
        from_attributes = True


class MatchAnalysisResponse(BaseModel):
    id: int
    profile_id: int
    cv_version_id: int
    job_id: int
    overall_score: Optional[float]
    skills_score: Optional[float]
    experience_score: Optional[float]
    keyword_score: Optional[float]
    education_score: Optional[float]
    strengths: Optional[Any]
    gaps: Optional[Any]
    recommendations: Optional[Any]
    algorithm_version: str
    created_at: datetime
    class Config:
        from_attributes = True
