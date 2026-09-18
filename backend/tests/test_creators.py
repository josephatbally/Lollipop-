import io
import json
import shutil

from fastapi.testclient import TestClient

from backend.app.config import settings
from backend.app.db import Base, SessionLocal, engine
from backend.app.entities import CreatorApplication, CreatorSubscriptionPlan, User
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


def make_creator(email, display_name, handle, bio=None):
    creator = make_user(email, "CREATOR")
    db = SessionLocal()
    db.add(CreatorApplication(
        user_id=creator.id,
        display_name=display_name,
        handle=handle,
        bio=bio,
        status="APPROVED",
        verification_status="VERIFIED",
    ))
    db.commit()
    db.close()
    return creator


def make_published_media(creator, title):
    from backend.app.media_routes import _private_media_path
    from backend.app.media_storage import new_storage_key

    key = new_storage_key(creator.id, title + ".mp4", "video/mp4")
    path = _private_media_path(key)
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_bytes(b"demo")
    db = SessionLocal()
    from backend.app.entities import Media
    media = Media(
        creator_id=creator.id,
        title=title,
        description="Published demo",
        original_filename=title + ".mp4",
        content_type="video/mp4",
        storage_key=key,
        size_bytes=4,
        checksum_sha256="a" * 64,
        status="PUBLISHED",
    )
    db.add(media)
    db.commit()
    db.refresh(media)
    db.close()
    return media


def test_public_creator_list_returns_verified_active_creators_only():
    creator = make_creator("maya@example.com", "Maya V.", "mayav", "Creator bio")
    pending = make_user("pending@example.com", "CREATOR")
    db = SessionLocal()
    db.add(CreatorApplication(
        user_id=pending.id,
        display_name="Pending P.",
        handle="pendingp",
        status="SUBMITTED",
        verification_status="PENDING",
    ))
    inactive = make_user("inactive@example.com", "CREATOR")
    inactive_db = db.get(User, inactive.id)
    inactive_db.status = "SUSPENDED"
    db.add(CreatorApplication(
        user_id=inactive.id,
        display_name="Inactive I.",
        handle="inactivei",
        status="APPROVED",
        verification_status="VERIFIED",
    ))
    db.commit()
    db.close()

    response = client.get("/api/v1/creators")
    assert response.status_code == 200
    assert response.json() == [{
        "id": creator.id,
        "display_name": "Maya V.",
        "handle": "mayav",
        "bio": "Creator bio",
        "subscription_plan": None,
    }]


def test_creator_profile_returns_public_profile_and_published_count():
    creator = make_creator("aria@example.com", "Aria R.", "ariar")
    make_published_media(creator, "First")
    make_published_media(creator, "Second")
    response = client.get(f"/api/v1/creators/{creator.id}")
    assert response.status_code == 200
    assert response.json()["display_name"] == "Aria R."
    assert response.json()["handle"] == "ariar"
    assert response.json()["media_count"] == 2


def test_creator_media_returns_published_media_only():
    creator = make_creator("nova@example.com", "Nova S.", "novas")
    make_published_media(creator, "Published")
    db = SessionLocal()
    from backend.app.entities import Media
    db.add(Media(
        creator_id=creator.id, title="Review", original_filename="review.mp4",
        content_type="video/mp4", storage_key="review-key", size_bytes=4,
        checksum_sha256="b" * 64, status="REVIEW",
    ))
    db.commit()
    db.close()

    response = client.get(f"/api/v1/creators/{creator.id}/media")
    assert response.status_code == 200
    assert [item["title"] for item in response.json()] == ["Published"]
    assert "storage_key" not in response.json()[0]


def test_creator_profile_exposes_active_subscription_plan():
    creator = make_creator("luna@example.com", "Luna K.", "lunak")
    db = SessionLocal()
    db.add(CreatorSubscriptionPlan(creator_id=creator.id, price_cents=1500, currency="USD", active=True))
    db.commit()
    db.close()

    response = client.get(f"/api/v1/creators/{creator.id}")
    assert response.status_code == 200
    assert response.json()["subscription_plan"] == {"price_cents": 1500, "currency": "USD"}
