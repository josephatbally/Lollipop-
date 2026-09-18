import io
import json
import shutil

from fastapi.testclient import TestClient

from backend.app.config import settings
from backend.app.db import Base, SessionLocal, engine
from backend.app.entities import CreatorApplication, Media, User
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


def upload(creator):
    consent = json.dumps([
        {"participant_reference": "self", "authorization_version": "v1"}
    ])
    return client.post(
        "/api/v1/media/upload",
        headers=auth(creator),
        data={"title": "Protected", "consent": consent},
        files={"file": ("test.mp4", io.BytesIO(b"\x00\x00\x00\x18ftypisom" + b"\x00" * 32), "video/mp4")},
    )


def test_media_response_exposes_access_level():
    creator = make_creator("creator@example.com")
    response = upload(creator)
    assert response.status_code == 201
    assert response.json()["access_level"] == "SUBSCRIBERS"


def test_owner_cannot_read_media_before_publication():
    creator = make_creator("creator2@example.com")
    media_id = upload(creator).json()["id"]

    response = client.get(f"/api/v1/media/{media_id}", headers=auth(creator))

    assert response.status_code == 404


def test_owner_cannot_stream_media_before_publication():
    creator = make_creator("creator3@example.com")
    media_id = upload(creator).json()["id"]

    response = client.get(f"/api/v1/media/{media_id}/stream", headers=auth(creator))

    assert response.status_code == 404


def test_non_admin_cannot_approve_or_reject_media():
    creator = make_creator("creator4@example.com")
    second_creator = make_creator("creator5@example.com")
    media_id = upload(creator).json()["id"]

    approve = client.post(f"/api/v1/media/{media_id}/approve", headers=auth(second_creator))
    reject = client.post(
        f"/api/v1/media/{media_id}/reject",
        headers=auth(second_creator),
        json={"reason": "No"},
    )

    assert approve.status_code == 403
    assert reject.status_code == 403


def test_unverified_creator_cannot_manage_subscription_plan():
    creator = make_creator("pending@example.com", verified=False)

    response = client.put(
        "/api/v1/creators/me/subscription-plan",
        headers=auth(creator),
        json={"price_cents": 1500, "currency": "USD"},
    )

    assert response.status_code == 403


def test_unverified_creator_cannot_be_subscribed_to():
    creator = make_creator("pending2@example.com", verified=False)
    customer = make_user("customer@example.com")

    response = client.post(
        f"/api/v1/subscriptions/{creator.id}",
        headers=auth(customer),
    )

    assert response.status_code == 404


def test_admin_can_read_unpublished_media_for_moderation():
    creator = make_creator("creator6@example.com")
    admin = make_user("admin@example.com", "ADMIN")
    media_id = upload(creator).json()["id"]

    response = client.get(f"/api/v1/media/{media_id}", headers=auth(admin))

    assert response.status_code == 200
    assert response.json()["status"] == "REVIEW"
