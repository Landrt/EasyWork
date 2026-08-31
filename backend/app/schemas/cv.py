from pydantic import BaseModel, model_validator
from typing import Optional, Any, List
from datetime import datetime


# --- CV ---
class CVCreate(BaseModel):
    title: str = "Mon CV"
    template_id: Optional[int] = None

class CVUpdate(BaseModel):
    title: Optional[str] = None
    template_id: Optional[int] = None
    status: Optional[str] = None

class CVResponse(BaseModel):
    id: int
    user_id: int
    profile_id: int
    title: str
    template_id: Optional[int]
    status: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# --- CV Version ---
class CVVersionResponse(BaseModel):
    id: int
    cv_id: int
    version_number: int
    content: Optional[Any]
    row_version: int
    created_by: str
    created_at: datetime

    class Config:
        from_attributes = True


# --- Section management ---
class SectionAddRequest(BaseModel):
    section_type: str   # e.g. "experience", "skills", "education"
    title: Optional[str] = None
    content: Optional[Any] = None

class SectionReorderRequest(BaseModel):
    section_ids: List[int]  # ordered list of section IDs

class SectionUpdateRequest(BaseModel):
    """
    Must include the current row_version for optimistic locking.
    If stale, endpoint returns HTTP 409.
    """
    row_version: int
    content: Any


# --- Template ---
class TemplateResponse(BaseModel):
    id: int
    name: str
    description: Optional[str]
    preview_url: Optional[str]
    is_active: bool

    class Config:
        from_attributes = True


# --- Upload ---
class UploadedDocumentResponse(BaseModel):
    id: int
    user_id: int
    original_filename: str
    mime_type: str
    size_bytes: int
    purpose: str
    status: str
    created_at: datetime

    class Config:
        from_attributes = True
