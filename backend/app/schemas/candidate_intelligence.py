from pydantic import BaseModel
from typing import Optional, List
from datetime import date, datetime


# --- Experience ---
class ExperienceBase(BaseModel):
    company: str
    position: str
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    is_current: bool = False
    description: Optional[str] = None
    achievements: Optional[str] = None

class ExperienceCreate(ExperienceBase):
    pass

class Experience(ExperienceBase):
    id: int
    profile_id: int
    source: str
    created_at: datetime
    class Config:
        from_attributes = True


# --- Skill ---
class SkillBase(BaseModel):
    name: str
    category: Optional[str] = None
    proficiency: Optional[str] = None

class SkillCreate(SkillBase):
    pass

class Skill(SkillBase):
    id: int
    profile_id: int
    source: str
    verified: bool
    created_at: datetime
    class Config:
        from_attributes = True


# --- Education ---
class EducationBase(BaseModel):
    institution: str
    degree: Optional[str] = None
    field_of_study: Optional[str] = None
    start_year: Optional[int] = None
    end_year: Optional[int] = None
    is_current: bool = False

class EducationCreate(EducationBase):
    pass

class Education(EducationBase):
    id: int
    profile_id: int
    source: str
    created_at: datetime
    class Config:
        from_attributes = True


# --- Project ---
class ProjectBase(BaseModel):
    name: str
    description: Optional[str] = None
    url: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None

class ProjectCreate(ProjectBase):
    pass

class Project(ProjectBase):
    id: int
    profile_id: int
    source: str
    created_at: datetime
    class Config:
        from_attributes = True


# --- Certification ---
class CertificationBase(BaseModel):
    name: str
    issuing_organization: Optional[str] = None
    issue_date: Optional[date] = None
    expiry_date: Optional[date] = None
    credential_url: Optional[str] = None

class CertificationCreate(CertificationBase):
    pass

class Certification(CertificationBase):
    id: int
    profile_id: int
    source: str
    created_at: datetime
    class Config:
        from_attributes = True


# --- Language ---
class LanguageBase(BaseModel):
    name: str
    proficiency: Optional[str] = None

class LanguageCreate(LanguageBase):
    pass

class Language(LanguageBase):
    id: int
    profile_id: int
    source: str
    created_at: datetime
    class Config:
        from_attributes = True


# --- QRO ---
class QROSessionCreate(BaseModel):
    pass  # Session is created server-side; no user input needed to start

class QROSessionResponse(BaseModel):
    id: int
    status: str
    current_step: int
    progress: int
    class Config:
        from_attributes = True

class QROAnswerRequest(BaseModel):
    answer: str

class QROMessageResponse(BaseModel):
    id: int
    role: str
    content: str
    created_at: datetime
    class Config:
        from_attributes = True

class QROManualInfoRequest(BaseModel):
    content: str
