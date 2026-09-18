import io
import json
import shutil

from fastapi.testclient import TestClient

from backend.app.config import settings
from backend.app.db import Base, SessionLocal, engine
from backend.app.entities import User, CreatorApplication
from backend.app.main import app
from backend.app.security import create_access_token, hash_password

client = TestClient(app)

def setup_function():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    shutil.rmtree(settings.media_storage_path, ignore_errors=True)

def auth(user):
    return {"Authorization": "Bearer " + create_access_token(user.id, user.role)}

def make_user(email, role="CUSTOMER"):
    db = SessionLocal()
    user = User(email=email, password_hash=hash_password("password123"), role=role)
    db.add(user)
    db.commit()
    db.refresh(user)
    db.close()
    return user

def make_creator(email, verified=True):
    user = make_user(email, "CREATOR")
    db = SessionLocal()
    db.add(CreatorApplication(
        user_id=user.id,
        display_name="Creator",
        handle=email.split("@")[0],
        status="APPROVED" if verified else "SUBMITTED",
        verification_status="VERIFIED" if verified else "PENDING",
    ))
    db.commit()
    db.close()
    return user

def upload(creator, title="Queue Video"):
    consent = json.dumps([
        {"participant_reference": "creator-self", "authorization_version": "v1"}
    ])
    return client.post(
        "/api/v1/media/upload",
        headers=auth(creator),
        data={"title": title, "consent": consent},
        files={"file": ("queue.mp4", io.BytesIO(b"\x00\x00\x00\x18ftypisom" + b"\x00" * 32), "video/mp4")},
    )

def test_customer_cannot_read_media_moderation_queue():
    customer = make_user("customer@example.com")
    response = client.get("/api/v1/admin/media", headers=auth(customer))
    assert response.status_code == 403

def test_admin_queue_returns_review_media_oldest_first_without_participant_details():
    creator = make_creator("creator@example.com")
    first = upload(creator, "First")
    second = upload(creator, "Second")
    assert first.status_code == 201
    assert second.status_code == 201

    admin = make_user("admin@example.com", "ADMIN")
    response = client.get("/api/v1/admin/media", headers=auth(admin))

    assert response.status_code == 200
    body = response.json()
    assert [item["title"] for item in body] == ["First", "Second"]
    assert body[0]["creator_email"] == "creator@example.com"
    assert body[0]["status"] == "REVIEW"
    assert body[0]["consent_records"] == 1
    assert "participant_reference" not in body[0]
    assert "storage_key" not in body[0]
