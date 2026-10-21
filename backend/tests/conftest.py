import os
from pathlib import Path

TEST_DB = Path(__file__).resolve().parents[1] / ".test_app.sqlite3"
os.environ.setdefault("DATABASE_URL", f"sqlite:///{TEST_DB}")
os.environ.setdefault("APP_ENV", "test")

try:
    TEST_DB.unlink()
except FileNotFoundError:
    pass

import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import sessionmaker

from app.config import settings
from app.database import Base, get_session, engine as app_engine
from app.main import app


@pytest.fixture()
def db_session():
    Base.metadata.drop_all(bind=app_engine)
    Base.metadata.create_all(bind=app_engine)
    SessionLocal = sessionmaker(bind=app_engine, autoflush=False, autocommit=False)
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()


@pytest.fixture()
def client(db_session):
    def override():
        yield db_session

    app.dependency_overrides[get_session] = override
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()
