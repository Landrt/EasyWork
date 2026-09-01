from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1 import candidate_intelligence, qro, cvs, jobs, ats_ai, subscription, affiliate, account, export
from app.core.config import settings

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="ResumePro Backend API — 12-domain SaaS CV x ATS platform",
    version="0.1.0",
)

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


@app.get("/health")
def health_check():
    return {"status": "ok", "version": "0.1.0"}
