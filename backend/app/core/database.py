import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from app.core.config import settings

def get_engine():
    db_url = settings.DATABASE_URL
    if "neon.tech" in db_url and settings.ENVIRONMENT == "development":
        try:
            eng = create_engine(
                db_url,
                pool_pre_ping=True,
                connect_args={"connect_timeout": 1}
            )
            with eng.connect() as conn:
                return eng
        except Exception:
            print("[DB INFO] Remote Neon DB timed out. Using local SQLite database (resumepro_dev.db).")
            return create_engine("sqlite:///./resumepro_dev.db", connect_args={"check_same_thread": False})

    try:
        eng = create_engine(db_url, pool_pre_ping=True, connect_args={"connect_timeout": 2})
        with eng.connect() as conn:
            return eng
    except Exception as e:
        print(f"[DB WARNING] Database connection error ({e}). Using local SQLite database.")
        return create_engine("sqlite:///./resumepro_dev.db", connect_args={"check_same_thread": False})

engine = get_engine()
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
