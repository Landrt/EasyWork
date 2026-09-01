from pydantic import BaseModel
from typing import Optional, List, Any
from datetime import datetime


class ATSIssueResponse(BaseModel):
    id: int
    category: Optional[str]
    severity: Optional[str]
    message: str
    recommendation: Optional[str]
    class Config:
        from_attributes = True


class ATSAnalysisResponse(BaseModel):
    id: int
    cv_version_id: int
    job_id: int
    overall_score: Optional[float]
    formatting_score: Optional[float]
    keyword_score: Optional[float]
    readability_score: Optional[float]
    parsing_score: Optional[float]
    algorithm_version: str
    issues: List[ATSIssueResponse] = []
    created_at: datetime
    class Config:
        from_attributes = True


class AISuggestionResponse(BaseModel):
    id: int
    cv_version_id: int
    target_section: Optional[str]
    original_text: Optional[str]
    suggested_text: str
    reason: Optional[str]
    confidence: Optional[float]
    status: str
    created_at: datetime
    class Config:
        from_attributes = True


class SuggestionEditRequest(BaseModel):
    suggested_text: str

class OptimizeRequest(BaseModel):
    cv_version_id: int
    job_id: int
