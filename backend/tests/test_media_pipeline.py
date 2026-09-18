import io
import json
import shutil
from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.db import Base, engine, SessionLocal
from backend.app.entities import User, CreatorApplication, Media, AuditLog
from backend.app.security import create_access_token, hash_password
from backend.app.config import settings

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
    db.add(user); db.commit(); db.refresh(user); db.close()
    return user

def make_video():
    return b"\x00\x00\x00\x18ftypisom" + b"\x00" * 32

def upload(user):
    consent = json.dumps([{"participant_reference":"creator-self","authorization_version":"v1"}])
    return client.post(
        "/api/v1/media/upload",
        headers=auth(user),
        data={"title":"Test Video","description":"Private test media","consent":consent},
        files={"file":("test.mp4", io.BytesIO(make_video()), "video/mp4")},
    )

def test_customer_cannot_upload():
    user = make_user("customer@example.com")
    response = upload(user)
    assert response.status_code == 403

def test_unverified_creator_cannot_upload():
    user = make_user("applicant@example.com")
    response = upload(user)
    assert response.status_code == 403

def test_approved_creator_can_upload_and_enters_review():
    user = make_user("creator@example.com", "CREATOR")
    response = upload(user)
    assert response.status_code == 201
    body = response.json()
    assert body["status"] == "REVIEW"
    assert body["content_type"] == "video/mp4"
    db = SessionLocal()
    media = db.get(Media, body["id"])
    assert media is not None
    assert media.storage_key.startswith(f"creators/{user.id}/")
    assert media.checksum_sha256
    assert db.query(AuditLog).filter_by(action="MEDIA_UPLOADED_FOR_REVIEW").count() == 1
    db.close()

def test_admin_can_approve_and_creator_can_publish():
    creator = make_user("creator2@example.com", "CREATOR")
    response = upload(creator)
    media_id = response.json()["id"]
    admin = make_user("admin@example.com", "ADMIN")
    approved = client.post(f"/api/v1/media/{media_id}/approve", headers=auth(admin))
    assert approved.status_code == 200
    assert approved.json()["status"] == "APPROVED"
    published = client.post(f"/api/v1/media/{media_id}/publish", headers=auth(creator))
    assert published.status_code == 200
    assert published.json()["status"] == "PUBLISHED"

def test_admin_can_reject_media():
    creator = make_user("creator3@example.com", "CREATOR")
    media_id = upload(creator).json()["id"]
    admin = make_user("admin2@example.com", "ADMIN")
    response = client.post(f"/api/v1/media/{media_id}/reject", headers=auth(admin), json={"reason":"Policy review required"})
    assert response.status_code == 200
    assert response.json()["status"] == "REJECTED"
    assert response.json()["moderation_reason"] == "Policy review required"

def test_rejected_media_cannot_publish():
    creator = make_user("creator4@example.com", "CREATOR")
    media_id = upload(creator).json()["id"]
    admin = make_user("admin3@example.com", "ADMIN")
    client.post(f"/api/v1/media/{media_id}/reject", headers=auth(admin), json={"reason":"Not approved"})
    response = client.post(f"/api/v1/media/{media_id}/publish", headers=auth(creator))
    assert response.status_code == 409
