import io, json, shutil
from datetime import datetime, timezone, timedelta
from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.db import Base, engine, SessionLocal
from backend.app.entities import User, Subscription
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

def publish(creator, admin):
    consent = json.dumps([{"participant_reference": "self", "authorization_version": "v1"}])
    response = client.post(
        "/api/v1/media/upload",
        headers=auth(creator),
        data={"title": "Subscriber Video", "consent": consent},
        files={"file": ("test.mp4", io.BytesIO(make_video()), "video/mp4")},
    )
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
    return response.json()

def test_customer_cannot_access_published_media_without_subscription():
    creator = make_user("creator@example.com", "CREATOR")
    admin = make_user("admin@example.com", "ADMIN")
    customer = make_user("customer@example.com")
    create_plan(creator)
    media_id = publish(creator, admin)
    response = client.get(f"/api/v1/media/{media_id}", headers=auth(customer))
    assert response.status_code == 403

def test_customer_can_access_published_media_with_active_subscription():
    creator = make_user("creator2@example.com", "CREATOR")
    admin = make_user("admin2@example.com", "ADMIN")
    customer = make_user("customer2@example.com")
    create_plan(creator)
    media_id = publish(creator, admin)
    subscribed = client.post(f"/api/v1/subscriptions/{creator.id}", headers=auth(customer))
    assert subscribed.status_code == 201
    assert client.get(f"/api/v1/media/{media_id}", headers=auth(customer)).status_code == 200

def test_canceled_subscription_loses_media_entitlement():
    creator = make_user("creator3@example.com", "CREATOR")
    admin = make_user("admin3@example.com", "ADMIN")
    customer = make_user("customer3@example.com")
    create_plan(creator)
    media_id = publish(creator, admin)
    sub = client.post(f"/api/v1/subscriptions/{creator.id}", headers=auth(customer)).json()
    assert client.get(f"/api/v1/media/{media_id}", headers=auth(customer)).status_code == 200
    assert client.post(f"/api/v1/subscriptions/{sub['id']}/cancel", headers=auth(customer)).status_code == 200
    assert client.get(f"/api/v1/media/{media_id}", headers=auth(customer)).status_code == 403

def test_expired_subscription_loses_media_entitlement():
    creator = make_user("creator4@example.com", "CREATOR")
    admin = make_user("admin4@example.com", "ADMIN")
    customer = make_user("customer4@example.com")
    create_plan(creator)
    media_id = publish(creator, admin)
    sub = client.post(f"/api/v1/subscriptions/{creator.id}", headers=auth(customer)).json()
    db = SessionLocal()
    row = db.get(Subscription, sub["id"])
    row.current_period_end = datetime.now(timezone.utc) - timedelta(seconds=1)
    db.commit(); db.close()
    assert client.get(f"/api/v1/media/{media_id}", headers=auth(customer)).status_code == 403

def test_customer_cannot_manage_creator_plan():
    customer = make_user("customer5@example.com")
    response = client.put(
        "/api/v1/creators/me/subscription-plan",
        headers=auth(customer),
        json={"price_cents": 1000},
    )
    assert response.status_code == 403

def test_customer_can_list_and_cancel_own_subscription():
    creator = make_user("creator5@example.com", "CREATOR")
    customer = make_user("customer6@example.com")
    create_plan(creator)
    created = client.post(f"/api/v1/subscriptions/{creator.id}", headers=auth(customer))
    assert created.status_code == 201
    listed = client.get("/api/v1/subscriptions", headers=auth(customer))
    assert listed.status_code == 200
    assert len(listed.json()) == 1
    canceled = client.post(f"/api/v1/subscriptions/{created.json()['id']}/cancel", headers=auth(customer))
    assert canceled.status_code == 200
    assert canceled.json()["status"] == "CANCELED"
