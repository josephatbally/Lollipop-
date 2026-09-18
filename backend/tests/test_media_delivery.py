import io, json, shutil
from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.db import Base, engine, SessionLocal
from backend.app.entities import Media, User
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
    db.add(user)
    db.commit()
    db.refresh(user)
    db.close()
    return user

def make_video():
    return b"\x00\x00\x00\x18ftypisom" + b"PRIVATE-VIDEO-DATA"

def publish(creator, admin):
    consent = json.dumps([{"participant_reference": "self", "authorization_version": "v1"}])
    response = client.post(
        "/api/v1/media/upload",
        headers=auth(creator),
        data={"title": "Protected Video", "consent": consent},
        files={"file": ("test.mp4", io.BytesIO(make_video()), "video/mp4")},
    )
    assert response.status_code == 201
    media_id = response.json()["id"]
    assert client.post(f"/api/v1/media/{media_id}/approve", headers=auth(admin)).status_code == 200
    assert client.post(f"/api/v1/media/{media_id}/publish", headers=auth(creator)).status_code == 200
    return media_id

def create_plan(creator):
    response = client.put(
        "/api/v1/creators/me/subscription-plan",
        headers=auth(creator),
        json={"price_cents": 1500, "currency": "USD"},
    )
    assert response.status_code == 200

def test_customer_without_entitlement_cannot_stream_media():
    creator = make_user("creator@example.com", "CREATOR")
    admin = make_user("admin@example.com", "ADMIN")
    customer = make_user("customer@example.com")
    create_plan(creator)
    media_id = publish(creator, admin)

    response = client.get(f"/api/v1/media/{media_id}/stream", headers=auth(customer))

    assert response.status_code == 403

def test_subscriber_can_stream_private_media():
    creator = make_user("creator2@example.com", "CREATOR")
    admin = make_user("admin2@example.com", "ADMIN")
    customer = make_user("customer2@example.com")
    create_plan(creator)
    media_id = publish(creator, admin)
    subscribed = client.post(f"/api/v1/subscriptions/{creator.id}", headers=auth(customer))
    assert subscribed.status_code == 201

    response = client.get(f"/api/v1/media/{media_id}/stream", headers=auth(customer))

    assert response.status_code == 200
    assert response.headers["content-type"].startswith("video/mp4")
    assert response.content == make_video()

def test_canceled_subscription_cannot_stream_media():
    creator = make_user("creator3@example.com", "CREATOR")
    admin = make_user("admin3@example.com", "ADMIN")
    customer = make_user("customer3@example.com")
    create_plan(creator)
    media_id = publish(creator, admin)
    subscribed = client.post(f"/api/v1/subscriptions/{creator.id}", headers=auth(customer))
    sub_id = subscribed.json()["id"]
    assert client.post(f"/api/v1/subscriptions/{sub_id}/cancel", headers=auth(customer)).status_code == 200

    response = client.get(f"/api/v1/media/{media_id}/stream", headers=auth(customer))

    assert response.status_code == 403

def test_missing_private_file_is_not_exposed():
    creator = make_user("creator4@example.com", "CREATOR")
    admin = make_user("admin4@example.com", "ADMIN")
    customer = make_user("customer4@example.com")
    create_plan(creator)
    media_id = publish(creator, admin)
    subscribed = client.post(f"/api/v1/subscriptions/{creator.id}", headers=auth(customer))
    assert subscribed.status_code == 201

    db = SessionLocal()
    media = db.get(Media, media_id)
    storage_key = media.storage_key
    db.close()

    from backend.app.media_storage import delete_private_upload
    delete_private_upload(storage_key)

    response = client.get(f"/api/v1/media/{media_id}/stream", headers=auth(customer))

    assert response.status_code == 404
