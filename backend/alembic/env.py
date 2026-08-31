from logging.config import fileConfig

from sqlalchemy import engine_from_config
from sqlalchemy import pool

from alembic import context

# Import your models here to make sure they are registered with Base.metadata
from app.core.database import Base
from app.models.profile import CandidateProfile
from app.models.entitlement import Plan, PlanEntitlement
from app.models.candidate_intelligence import Experience, Skill, Education, Project, Certification, Language
from app.models.evidence_qro import Evidence, QROSession, QROMessage, ai_suggestion_evidence
from app.models.cv import UploadedDocument, Template, CV, CVVersion
from app.models.job_matching import Job, JobRequirement, JobKeyword, MatchAnalysis
from app.models.ats_ai import ATSAnalysis, ATSIssue, AISuggestion, AIUsageLog
from app.models.subscription import Plan, PlanEntitlement, Subscription
from app.models.affiliate import Affiliate, AffiliateLink, AffiliateClick, AffiliateConversion, Commission, Payout
from app.models.audit_notification import AuditLog, Notification

# this is the Alembic Config object, which provides
# access to the values within the .ini file in use.
config = context.config

# Interpret the config file for Python logging.
# This line sets up loggers basically.
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# add your model's MetaData object here
# for 'autogenerate' support
target_metadata = Base.metadata

# other values from the config, defined by the needs of env.py,
# can be acquired:
# my_important_option = config.get_main_option("my_important_option")
# ... etc.


def run_migrations_offline() -> None:
    """Run migrations in 'offline' mode.

    This configures the context with just a URL
    and not an Engine, though an Engine is acceptable
    here as well.  By skipping the Engine creation
    we don't even need a DBAPI to be available.

    Calls to context.execute() here emit the given string to the
    script output.

    """
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    """Run migrations in 'online' mode.

    In this scenario we need to create an Engine
    and associate a connection with the context.

    """
    connectable = engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(
            connection=connection, target_metadata=target_metadata
        )

        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
