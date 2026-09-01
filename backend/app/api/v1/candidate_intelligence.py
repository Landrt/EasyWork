from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.api.deps import get_current_user
from app.api.deps import AuthUser
from app.models.profile import CandidateProfile
from app.models.candidate_intelligence import (
    Experience, Skill, Education, Project, Certification, Language
)
from app.schemas.candidate_intelligence import (
    ExperienceCreate, Experience as ExperienceSchema,
    SkillCreate, Skill as SkillSchema,
    EducationCreate, Education as EducationSchema,
    ProjectCreate, Project as ProjectSchema,
    CertificationCreate, Certification as CertificationSchema,
    LanguageCreate, Language as LanguageSchema,
)

router = APIRouter()

def _get_or_create_profile(user: AuthUser, db: Session) -> CandidateProfile:
    profile = db.query(CandidateProfile).filter(CandidateProfile.user_id == user.id).first()
    if not profile:
        profile = CandidateProfile(user_id=user.id)
        db.add(profile)
        db.commit()
        db.refresh(profile)
    return profile


# --- Experiences ---
@router.get("/experiences", response_model=List[ExperienceSchema])
def list_experiences(current_user: AuthUser = Depends(get_current_user), db: Session = Depends(get_db)):
    profile = _get_or_create_profile(current_user, db)
    return db.query(Experience).filter(Experience.profile_id == profile.id).all()

@router.post("/experiences", response_model=ExperienceSchema, status_code=201)
def add_experience(item: ExperienceCreate, current_user: AuthUser = Depends(get_current_user), db: Session = Depends(get_db)):
    profile = _get_or_create_profile(current_user, db)
    obj = Experience(**item.model_dump(), profile_id=profile.id, source="manual")
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj

@router.delete("/experiences/{experience_id}", status_code=204)
def delete_experience(experience_id: int, current_user: AuthUser = Depends(get_current_user), db: Session = Depends(get_db)):
    profile = _get_or_create_profile(current_user, db)
    obj = db.query(Experience).filter(Experience.id == experience_id, Experience.profile_id == profile.id).first()
    if not obj:
        raise HTTPException(status_code=404, detail="Experience not found")
    db.delete(obj)
    db.commit()


# --- Skills ---
@router.get("/skills", response_model=List[SkillSchema])
def list_skills(current_user: AuthUser = Depends(get_current_user), db: Session = Depends(get_db)):
    profile = _get_or_create_profile(current_user, db)
    return db.query(Skill).filter(Skill.profile_id == profile.id).all()

@router.post("/skills", response_model=SkillSchema, status_code=201)
def add_skill(item: SkillCreate, current_user: AuthUser = Depends(get_current_user), db: Session = Depends(get_db)):
    profile = _get_or_create_profile(current_user, db)
    obj = Skill(**item.model_dump(), profile_id=profile.id, source="manual")
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj

@router.delete("/skills/{skill_id}", status_code=204)
def delete_skill(skill_id: int, current_user: AuthUser = Depends(get_current_user), db: Session = Depends(get_db)):
    profile = _get_or_create_profile(current_user, db)
    obj = db.query(Skill).filter(Skill.id == skill_id, Skill.profile_id == profile.id).first()
    if not obj:
        raise HTTPException(status_code=404, detail="Skill not found")
    db.delete(obj)
    db.commit()


# --- Education ---
@router.get("/educations", response_model=List[EducationSchema])
def list_educations(current_user: AuthUser = Depends(get_current_user), db: Session = Depends(get_db)):
    profile = _get_or_create_profile(current_user, db)
    return db.query(Education).filter(Education.profile_id == profile.id).all()

@router.post("/educations", response_model=EducationSchema, status_code=201)
def add_education(item: EducationCreate, current_user: AuthUser = Depends(get_current_user), db: Session = Depends(get_db)):
    profile = _get_or_create_profile(current_user, db)
    obj = Education(**item.model_dump(), profile_id=profile.id, source="manual")
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj


# --- Projects ---
@router.get("/projects", response_model=List[ProjectSchema])
def list_projects(current_user: AuthUser = Depends(get_current_user), db: Session = Depends(get_db)):
    profile = _get_or_create_profile(current_user, db)
    return db.query(Project).filter(Project.profile_id == profile.id).all()

@router.post("/projects", response_model=ProjectSchema, status_code=201)
def add_project(item: ProjectCreate, current_user: AuthUser = Depends(get_current_user), db: Session = Depends(get_db)):
    profile = _get_or_create_profile(current_user, db)
    obj = Project(**item.model_dump(), profile_id=profile.id, source="manual")
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj


# --- Certifications ---
@router.get("/certifications", response_model=List[CertificationSchema])
def list_certifications(current_user: AuthUser = Depends(get_current_user), db: Session = Depends(get_db)):
    profile = _get_or_create_profile(current_user, db)
    return db.query(Certification).filter(Certification.profile_id == profile.id).all()

@router.post("/certifications", response_model=CertificationSchema, status_code=201)
def add_certification(item: CertificationCreate, current_user: AuthUser = Depends(get_current_user), db: Session = Depends(get_db)):
    profile = _get_or_create_profile(current_user, db)
    obj = Certification(**item.model_dump(), profile_id=profile.id, source="manual")
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj


# --- Languages ---
@router.get("/languages", response_model=List[LanguageSchema])
def list_languages(current_user: AuthUser = Depends(get_current_user), db: Session = Depends(get_db)):
    profile = _get_or_create_profile(current_user, db)
    return db.query(Language).filter(Language.profile_id == profile.id).all()

@router.post("/languages", response_model=LanguageSchema, status_code=201)
def add_language(item: LanguageCreate, current_user: AuthUser = Depends(get_current_user), db: Session = Depends(get_db)):
    profile = _get_or_create_profile(current_user, db)
    obj = Language(**item.model_dump(), profile_id=profile.id, source="manual")
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj
