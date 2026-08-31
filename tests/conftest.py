"""Shared fixtures for API tests.

The default database is an in-memory SQLite database so test runs cannot modify
the development MySQL database. Set TEST_DATABASE_URL to exercise the same
suite against a dedicated MySQL test database.
"""

import os
import sys
from pathlib import Path

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import StaticPool

PROJECT_ROOT = Path(__file__).resolve().parents[1]
BACKEND_DIR = PROJECT_ROOT / "backend"
sys.path.insert(0, str(BACKEND_DIR))

# These are only used while the application imports its normal configuration.
# All endpoint database sessions are overridden below.
os.environ["DB_HOST"] = "localhost"
os.environ["DB_PORT"] = "3306"
os.environ["DB_USER"] = "test_user"
os.environ["DB_PASSWORD"] = "test_password"
os.environ["DB_NAME"] = "trust_connect_test"
os.environ["JWT_SECRET_KEY"] = "test-only-secret-key-with-32-characters"

from app.database.base import Base
from app.database.session import get_db
import app.models  # Registers all models with Base.metadata.
from app.main import app as fastapi_app


def _test_engine():
    database_url = os.getenv("TEST_DATABASE_URL", "sqlite+pysqlite:///:memory:")
    options: dict = {}

    if database_url.startswith("sqlite"):
        options["connect_args"] = {"check_same_thread": False}
        if ":memory:" in database_url:
            options["poolclass"] = StaticPool

    return create_engine(database_url, **options)


@pytest.fixture()
def db_session() -> Session:
    """Provide a fresh schema for each test."""
    engine = _test_engine()
    Base.metadata.create_all(bind=engine)
    session = sessionmaker(autocommit=False, autoflush=False, bind=engine)()

    try:
        yield session
    finally:
        session.close()
        Base.metadata.drop_all(bind=engine)
        engine.dispose()


@pytest.fixture()
def client(db_session: Session):
    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    fastapi_app.dependency_overrides[get_db] = override_get_db
    with TestClient(fastapi_app) as test_client:
        yield test_client
    fastapi_app.dependency_overrides.clear()


@pytest.fixture()
def customer_payload() -> dict:
    return {
        "first_name": "Asha",
        "last_name": "Sharma",
        "email": "asha@example.com",
        "phone_no": "9876543210",
        "password": "SafePassword123!",
        "address": "12 Lake Road",
        "city": "Kolkata",
        "state": "West Bengal",
        "pincode": "700001",
    }
