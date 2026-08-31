from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
from app.core.database import get_db
from app.api.deps import get_current_user
from app.api.deps import AuthUser
from app.models.evidence_qro import QROSession, QROMessage, Evidence
from app.models.profile import CandidateProfile
from app.schemas.candidate_intelligence import (
    QROSessionResponse, QROAnswerRequest, QROMessageResponse, QROManualInfoRequest
)

router = APIRouter()

QUESTIONS = [
    "Quel est votre objectif professionnel actuel ?",
    "Décrivez votre expérience professionnelle la plus récente.",
    "Quelles sont vos 5 compétences techniques principales ?",
    "Quel est votre niveau de formation le plus élevé ?",
    "Parlez-nous d'un accomplissement dont vous êtes particulièrement fier.",
]


@router.post("/sessions", response_model=QROSessionResponse, status_code=201)
def start_qro_session(
    current_user: AuthUser = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """QRO.start — Start a new QRO session for the current user."""
    profile = db.query(CandidateProfile).filter(CandidateProfile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(status_code=400, detail="Profile not found")

    # Limit to 1 active session
    existing = db.query(QROSession).filter(
        QROSession.profile_id == profile.id,
        QROSession.status == "active"
    ).first()
    if existing:
        return existing

    session = QROSession(
        profile_id=profile.id,
        status="active",
        current_step=0,
        progress=0,
    )
    db.add(session)
    db.commit()
    db.refresh(session)

    # Send the first question as the opening message
    first_question = QROMessage(
        session_id=session.id,
        role="assistant",
        content=QUESTIONS[0],
    )
    db.add(first_question)
    db.commit()

    return session


@router.post("/sessions/{session_id}/answer", response_model=QROMessageResponse)
def answer_qro(
    session_id: int,
    body: QROAnswerRequest,
    current_user: AuthUser = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """QRO.answer — Receive a user answer, store as evidence, and return the next question."""
    session = db.query(QROSession).filter(
        QROSession.id == session_id,
        QROSession.user_id == current_user.id
    ).first()
    if not session:
        raise HTTPException(status_code=404, detail="QRO Session not found")
    if session.status != "in_progress":
        raise HTTPException(status_code=400, detail="Session is already completed or abandoned")

    # Store user answer as a QROMessage
    user_msg = QROMessage(session_id=session.id, role="user", content=body.answer)
    db.add(user_msg)

    # Store user answer as Evidence (Truth Guard foundation)
    evidence = Evidence(
        profile_id=session.profile_id,
        source_type="qro",
        source_reference=f"qro_session:{session.id}",
        raw_content=body.answer,
        verified=True,
    )
    db.add(evidence)

    # Advance to the next step
    session.current_step += 1
    total_steps = len(QUESTIONS)
    session.progress = int((session.current_step / total_steps) * 100)

    # Determine next message (either next question or completion)
    if session.current_step < total_steps:
        next_content = QUESTIONS[session.current_step]
    else:
        next_content = "Merci ! Votre profil a été enrichi avec succès. Vous pouvez maintenant accéder à la vérification du profil."
        session.status = "completed"
        session.completed_at = datetime.utcnow()

    assistant_msg = QROMessage(session_id=session.id, role="assistant", content=next_content)
    db.add(assistant_msg)
    db.commit()
    db.refresh(assistant_msg)

    return assistant_msg


@router.post("/sessions/{session_id}/manual", response_model=QROMessageResponse, status_code=201)
def add_manual_info(
    session_id: int,
    body: QROManualInfoRequest,
    current_user: AuthUser = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """QRO.addManualInfo — Add a free-form detail, stored as evidence."""
    session = db.query(QROSession).filter(
        QROSession.id == session_id,
        QROSession.user_id == current_user.id
    ).first()
    if not session:
        raise HTTPException(status_code=404, detail="QRO Session not found")

    user_msg = QROMessage(session_id=session.id, role="user", content=body.content)
    db.add(user_msg)

    evidence = Evidence(
        profile_id=session.profile_id,
        source_type="manual",
        source_reference=f"qro_session:{session.id}",
        raw_content=body.content,
        verified=True,
    )
    db.add(evidence)
    db.commit()
    db.refresh(user_msg)
    return user_msg


@router.post("/sessions/{session_id}/complete", response_model=QROSessionResponse)
def complete_qro(
    session_id: int,
    current_user: AuthUser = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """QRO.complete — Forcefully close the session."""
    session = db.query(QROSession).filter(
        QROSession.id == session_id,
        QROSession.user_id == current_user.id
    ).first()
    if not session:
        raise HTTPException(status_code=404, detail="QRO Session not found")

    session.status = "completed"
    session.completed_at = datetime.utcnow()
    db.commit()
    db.refresh(session)
    return session
