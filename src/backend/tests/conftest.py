import pytest
import sys
import os
import tempfile

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from database import Base, get_db
from main import app
from fastapi.testclient import TestClient


@pytest.fixture(scope="function")
def db_engine():
    db_fd, db_path = tempfile.mkstemp(suffix='.db')
    database_url = f"sqlite:///{db_path}"
    
    engine = create_engine(
        database_url,
        connect_args={"check_same_thread": False},
    )
    
    Base.metadata.create_all(bind=engine)
    
    yield engine
    
    Base.metadata.drop_all(bind=engine)
    os.close(db_fd)
    os.unlink(db_path)


@pytest.fixture(scope="function")
def db_session(db_engine):
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=db_engine)
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()


@pytest.fixture(scope="function")
def client(db_engine):
    from routers import auth, foods, records
    
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=db_engine)
    session = SessionLocal()

    def override_get_db():
        yield session

    app.dependency_overrides[get_db] = override_get_db
    app.dependency_overrides[auth.get_db] = override_get_db
    app.dependency_overrides[foods.get_db] = override_get_db
    app.dependency_overrides[records.get_db] = override_get_db
    
    with TestClient(app) as c:
        yield c
    
    session.close()
    app.dependency_overrides.clear()


@pytest.fixture
def test_user_data():
    return {
        "phone": "13800138000",
        "password": "testpassword123",
        "nickname": "testuser"
    }


@pytest.fixture
def registered_user(client, test_user_data):
    response = client.post("/api/auth/register", json=test_user_data)
    return response.json()
