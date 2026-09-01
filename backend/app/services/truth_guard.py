"""
Truth Guard Service
Core invariant: no AI suggestion reaches the user without first passing through this service.
Flow: AI CLAIM → evidence_search → found? → allow / reject/mark for confirmation
"""
from sqlalchemy.orm import Session
from typing import List, Optional
from app.models.evidence_qro import Evidence
from app.models.ats_ai import AISuggestion, AIUsageLog


def check_claim_has_evidence(
    profile_id: int,
    claim_keywords: List[str],
    db: Session,
) -> List[Evidence]:
    """
    Searches the evidence table for any raw_content containing the claim keywords.
    Returns matching evidence rows. If empty list: claim is unsupported → block suggestion.
    """
    matches = []
    all_evidence = db.query(Evidence).filter(Evidence.profile_id == profile_id).all()
    for ev in all_evidence:
        content_lower = (ev.raw_content or "").lower()
        if any(kw.lower() in content_lower for kw in claim_keywords):
            matches.append(ev)
    return matches


def create_suggestion_if_supported(
    cv_version_id: int,
    profile_id: int,
    target_section: str,
    original_text: str,
    suggested_text: str,
    reason: str,
    claim_keywords: List[str],
    confidence: float,
    db: Session,
) -> Optional[AISuggestion]:
    """
    Creates an AISuggestion only if Truth Guard finds supporting evidence.
    If no evidence is found, returns None (suggestion blocked).
    """
    supporting_evidence = check_claim_has_evidence(profile_id, claim_keywords, db)

    if not supporting_evidence:
        # Blocked: no proof in candidate's own data
        return None

    suggestion = AISuggestion(
        cv_version_id=cv_version_id,
        target_section=target_section,
        original_text=original_text,
        suggested_text=suggested_text,
        reason=reason,
        confidence=confidence,
        status="pending",
    )
    suggestion.evidence = supporting_evidence  # Link via N:N junction
    db.add(suggestion)
    db.commit()
    db.refresh(suggestion)
    return suggestion


def log_ai_usage(user_id: int, operation_type: str, tokens_or_cost: float, plan_id: Optional[int], db: Session):
    """Write an AI usage log entry. Called for every AI operation."""
    log = AIUsageLog(
        user_id=user_id,
        operation_type=operation_type,
        tokens_or_cost=tokens_or_cost,
        plan_id_at_time=plan_id,
    )
    db.add(log)
    db.commit()
