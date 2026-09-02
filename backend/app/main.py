from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1 import candidate_intelligence, qro, cvs, jobs, ats_ai, subscription, affiliate, account, export, admin
from app.core.config import settings

from app.core.database import Base, engine, SessionLocal
import app.models
from app.models.subscription import Plan

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="ResumePro Backend API — 12-domain SaaS CV x ATS platform",
    version="0.1.0",
)

@app.on_event("startup")
def init_database():
    try:
        Base.metadata.create_all(bind=engine)
        with SessionLocal() as db:
            if db.query(Plan).count() == 0:
                default_plans = [
                    Plan(name="FREE", display_name="Gratuit", price=0.0, is_recurring=False),
                    Plan(name="SPRINT", display_name="Sprint 14 jours", price=19.0, duration_days=14, is_recurring=False),
                    Plan(name="ACTIVE", display_name="Recherche Active", price=29.0, is_recurring=True),
                    Plan(name="FOUNDER", display_name="Accès Fondateur", price=99.0, is_recurring=False, max_slots=200, slots_taken=0),
                ]
                db.add_all(default_plans)
                db.commit()
    except Exception as e:
        print(f"[DB INIT WARNING] {e}")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(candidate_intelligence.router,  prefix=f"{settings.API_V1_STR}/profile",      tags=["candidate-intelligence"])
app.include_router(qro.router,                     prefix=f"{settings.API_V1_STR}/qro",          tags=["qro"])
app.include_router(cvs.router,                     prefix=f"{settings.API_V1_STR}/cvs",          tags=["cvs"])
app.include_router(jobs.router,                    prefix=f"{settings.API_V1_STR}/jobs",         tags=["jobs"])
app.include_router(ats_ai.router,                  prefix=f"{settings.API_V1_STR}",              tags=["ats-ai"])
app.include_router(subscription.router,            prefix=f"{settings.API_V1_STR}/subscription", tags=["subscription"])
app.include_router(affiliate.router,               prefix=f"{settings.API_V1_STR}/affiliate",    tags=["affiliate"])
app.include_router(account.router,                 prefix=f"{settings.API_V1_STR}/account",      tags=["account"])
app.include_router(export.router,                  prefix=f"{settings.API_V1_STR}/export",       tags=["export"])
app.include_router(admin.router,                   prefix=f"{settings.API_V1_STR}/admin",        tags=["admin"])


@app.get("/health")
def health_check():
    return {"status": "ok", "version": "0.1.0"}
