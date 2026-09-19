from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.db import Base, engine, SessionLocal
from backend.app.entities import User, CreatorApplication
from backend.app.security import create_access_token, hash_password

client = TestClient(app)

def setup_function():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)

def auth(user):
    return {"Authorization": "Bearer " + create_access_token(user.id, user.role)}

def test_customer_cannot_review():
    db = SessionLocal()
    user = User(email="customer@example.com", password_hash=hash_password("password123"))
    db.add(user); db.commit(); db.refresh(user)
    app_row = CreatorApplication(user_id=user.id, display_name="Test", handle="test_creator")
    db.add(app_row); db.commit(); db.refresh(app_row)
    app_row.status="SUBMITTED"; app_row.verification_status="PENDING"; db.commit()
    response = client.get("/api/v1/admin/creator-applications", headers=auth(user))
    assert response.status_code == 403
    db.close()

def test_admin_can_approve_and_promote_creator():
    db = SessionLocal()
    admin = User(email="admin@example.com", password_hash=hash_password("password123"), role="ADMIN")
    creator = User(email="creator@example.com", password_hash=hash_password("password123"))
    db.add_all([admin, creator]); db.commit(); db.refresh(admin); db.refresh(creator)
    app_row = CreatorApplication(user_id=creator.id, display_name="Creator", handle="creator_one", status="SUBMITTED", verification_status="PENDING")
    db.add(app_row); db.commit(); db.refresh(app_row)
    response = client.post(f"/api/v1/admin/creator-applications/{app_row.id}/approve", headers=auth(admin), json={"reason":"Verified through approved provider"})
    assert response.status_code == 200
    db.refresh(creator)
    assert response.json()["verification_status"] == "VERIFIED"
    assert response.json()["status"] == "APPROVED"
    assert creator.role == "CREATOR"
    db.close()

def test_admin_rejection_revokes_existing_creator_role():
    db = SessionLocal()
    admin = User(email="admin-reject@example.com", password_hash=hash_password("password123"), role="ADMIN")
    creator = User(email="creator-reject@example.com", password_hash=hash_password("password123"), role="CREATOR")
    db.add_all([admin, creator]); db.commit(); db.refresh(admin); db.refresh(creator)
    app_row = CreatorApplication(
        user_id=creator.id,
        display_name="Creator",
        handle="creator_reject",
        status="SUBMITTED",
        verification_status="PENDING",
    )
    db.add(app_row); db.commit(); db.refresh(app_row)

    response = client.post(
        f"/api/v1/admin/creator-applications/{app_row.id}/reject",
        headers=auth(admin),
        json={"reason":"Verification failed"},
    )

    assert response.status_code == 200
    db.refresh(creator)
    assert creator.role == "CUSTOMER"
    assert response.json()["status"] == "REJECTED"
    assert response.json()["verification_status"] == "REJECTED"
    db.close()

def test_creator_cannot_self_verify():
    db = SessionLocal()
    creator = User(email="creator2@example.com", password_hash=hash_password("password123"))
    db.add(creator); db.commit(); db.refresh(creator)
    response = client.post("/api/v1/admin/creator-applications/1/approve", headers=auth(creator), json={})
    assert response.status_code == 403
    db.close()
