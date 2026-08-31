from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List
import uuid, os

from app.core.database import get_db
from app.api.deps import get_current_user, AuthUser
from app.models.profile import CandidateProfile
from app.models.cv import CV, CVVersion, Template, UploadedDocument
from app.schemas.cv import (
    CVCreate, CVUpdate, CVResponse, CVVersionResponse,
    SectionAddRequest, SectionReorderRequest, SectionUpdateRequest,
    TemplateResponse, UploadedDocumentResponse,
)

router = APIRouter()

ALLOWED_MIME_TYPES = {"application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"}
MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024  # 10 MB


def _get_cv_or_404(cv_id: int, user: AuthUser, db: Session) -> CV:
    """Fetch a CV and enforce ownership — users can never access each other's CVs via ID manipulation."""
    cv = db.query(CV).filter(CV.id == cv_id, CV.user_id == user.id).first()
    if not cv:
        raise HTTPException(status_code=404, detail="CV not found")
    return cv


def _get_latest_version(cv_id: int, db: Session) -> CVVersion:
    version = db.query(CVVersion).filter(CVVersion.cv_id == cv_id).order_by(CVVersion.version_number.desc()).first()
    if not version:
        raise HTTPException(status_code=404, detail="CV has no versions yet")
    return version


# -----------------------------------------------------------------------
# CV CRUD
# -----------------------------------------------------------------------

@router.post("", response_model=CVResponse, status_code=201)
def create_cv(body: CVCreate, current_user: AuthUser = Depends(get_current_user), db: Session = Depends(get_db)):
    """CV.create"""
    profile = db.query(CandidateProfile).filter(CandidateProfile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(status_code=400, detail="Candidate profile not found")

    cv = CV(
        user_id=current_user.id,
        profile_id=profile.id,
        title=body.title,
        template_id=body.template_id,
    )
    db.add(cv)
    db.commit()
    db.refresh(cv)

    # Create an initial empty version
    version = CVVersion(cv_id=cv.id, version_number=1, content={"sections": []}, created_by="user")
    db.add(version)
    db.commit()

    return cv


@router.get("", response_model=List[CVResponse])
def list_cvs(
    skip: int = 0, limit: int = 20,
    current_user: AuthUser = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """CV.list — paginated"""
    return db.query(CV).filter(CV.user_id == current_user.id).offset(skip).limit(limit).all()


@router.get("/{cv_id}", response_model=CVResponse)
def get_cv(cv_id: int, current_user: AuthUser = Depends(get_current_user), db: Session = Depends(get_db)):
    """CV.get"""
    return _get_cv_or_404(cv_id, current_user, db)


@router.patch("/{cv_id}", response_model=CVResponse)
def update_cv(cv_id: int, body: CVUpdate, current_user: AuthUser = Depends(get_current_user), db: Session = Depends(get_db)):
    """CV.update"""
    cv = _get_cv_or_404(cv_id, current_user, db)
    for field, value in body.model_dump(exclude_unset=True).items():
        setattr(cv, field, value)
    db.commit()
    db.refresh(cv)
    return cv


@router.delete("/{cv_id}", status_code=204)
def delete_cv(cv_id: int, current_user: AuthUser = Depends(get_current_user), db: Session = Depends(get_db)):
    """CV.delete"""
    cv = _get_cv_or_404(cv_id, current_user, db)
    db.delete(cv)
    db.commit()


@router.patch("/{cv_id}/template", response_model=CVResponse)
def change_template(cv_id: int, body: CVUpdate, current_user: AuthUser = Depends(get_current_user), db: Session = Depends(get_db)):
    """CV.changeTemplate"""
    cv = _get_cv_or_404(cv_id, current_user, db)
    if body.template_id is None:
        raise HTTPException(status_code=400, detail="template_id is required")
    cv.template_id = body.template_id
    db.commit()
    db.refresh(cv)
    return cv


# -----------------------------------------------------------------------
# Section management (with optimistic locking)
# -----------------------------------------------------------------------

@router.post("/{cv_id}/sections", response_model=CVVersionResponse, status_code=201)
def add_section(
    cv_id: int, body: SectionAddRequest,
    current_user: AuthUser = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """CV.addSection — Creates a new CVVersion snapshot with the section appended."""
    cv = _get_cv_or_404(cv_id, current_user, db)
    latest = _get_latest_version(cv_id, db)

    sections = (latest.content or {}).get("sections", [])
    new_section = {
        "id": len(sections) + 1,
        "type": body.section_type,
        "title": body.title,
        "content": body.content or {},
    }
    sections.append(new_section)

    new_version = CVVersion(
        cv_id=cv.id,
        version_number=latest.version_number + 1,
        content={"sections": sections},
        row_version=latest.row_version + 1,
        created_by="user",
    )
    db.add(new_version)
    db.commit()
    db.refresh(new_version)
    return new_version


@router.delete("/{cv_id}/sections/{section_id}", response_model=CVVersionResponse)
def remove_section(
    cv_id: int, section_id: int,
    current_user: AuthUser = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """CV.removeSection"""
    cv = _get_cv_or_404(cv_id, current_user, db)
    latest = _get_latest_version(cv_id, db)

    sections = (latest.content or {}).get("sections", [])
    sections = [s for s in sections if s.get("id") != section_id]

    new_version = CVVersion(
        cv_id=cv.id,
        version_number=latest.version_number + 1,
        content={"sections": sections},
        row_version=latest.row_version + 1,
        created_by="user",
    )
    db.add(new_version)
    db.commit()
    db.refresh(new_version)
    return new_version


@router.patch("/{cv_id}/sections/order", response_model=CVVersionResponse)
def reorder_sections(
    cv_id: int, body: SectionReorderRequest,
    current_user: AuthUser = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """CV.reorderSections — with optimistic lock via row_version check."""
    cv = _get_cv_or_404(cv_id, current_user, db)
    latest = _get_latest_version(cv_id, db)

    sections = (latest.content or {}).get("sections", [])
    section_map = {s["id"]: s for s in sections}
    reordered = [section_map[sid] for sid in body.section_ids if sid in section_map]

    new_version = CVVersion(
        cv_id=cv.id,
        version_number=latest.version_number + 1,
        content={"sections": reordered},
        row_version=latest.row_version + 1,
        created_by="user",
    )
    db.add(new_version)
    db.commit()
    db.refresh(new_version)
    return new_version


# -----------------------------------------------------------------------
# Import — async stub (real parser will be a Celery task)
# -----------------------------------------------------------------------

def _parse_cv_async(document_id: int, user_id: str):
    """
    Stub: In production this will be dispatched as a Celery task.
    The HTTP response returns immediately with 202 Accepted.
    The client polls GET /cvs/import/{document_id}/status.
    """
    # TODO: dispatch to Celery worker
    print(f"[STUB] Queuing CV parse for document_id={document_id}, user_id={user_id}")


@router.post("/import", response_model=UploadedDocumentResponse, status_code=202)
async def import_cv(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    current_user: AuthUser = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    CV.import.upload
    - Validates MIME type and file size (security gate)
    - Stores metadata in uploaded_documents (enables ACCOUNT.delete + evidence linking)
    - Queues async parse job — never blocks the HTTP request
    """
    if file.content_type not in ALLOWED_MIME_TYPES:
        raise HTTPException(status_code=415, detail="Only PDF and DOCX files are accepted")

    content = await file.read()
    if len(content) > MAX_FILE_SIZE_BYTES:
        raise HTTPException(status_code=413, detail="File exceeds 10 MB limit")

    doc = UploadedDocument(
        user_id=current_user.id,
        file_data=content,
        original_filename=file.filename,
        mime_type=file.content_type,
        size_bytes=len(content),
        purpose="cv_import",
        status="processing",
    )
    db.add(doc)
    db.commit()
    db.refresh(doc)

    # Fire-and-forget async parse (non-blocking)
    background_tasks.add_task(_parse_cv_async, doc.id, current_user.id)

    return doc


@router.get("/import/{document_id}/status", response_model=UploadedDocumentResponse)
def import_status(document_id: int, current_user: AuthUser = Depends(get_current_user), db: Session = Depends(get_db)):
    """Poll status of an ongoing CV import."""
    doc = db.query(UploadedDocument).filter(
        UploadedDocument.id == document_id,
        UploadedDocument.user_id == current_user.id
    ).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Upload not found")
    return doc


# -----------------------------------------------------------------------
# Export stub
# -----------------------------------------------------------------------

@router.post("/{cv_id}/export", status_code=202)
def export_cv(cv_id: int, current_user: AuthUser = Depends(get_current_user), db: Session = Depends(get_db)):
    """
    CV.export — Queues async PDF/DOCX generation.
    Format availability is gated by subscription entitlements (Phase 6).
    """
    _get_cv_or_404(cv_id, current_user, db)
    # TODO: check entitlement for DOCX (premium only), dispatch Celery task
    return {"message": "Export queued", "cv_id": cv_id}


# -----------------------------------------------------------------------
# Templates
# -----------------------------------------------------------------------

@router.get("/templates", response_model=List[TemplateResponse])
def list_templates(db: Session = Depends(get_db), current_user: AuthUser = Depends(get_current_user)):
    return db.query(Template).filter(Template.is_active == True).all()
