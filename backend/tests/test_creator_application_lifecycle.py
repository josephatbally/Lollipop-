from fastapi.testclient import TestClient

from backend.app.db import Base, SessionLocal, engine
from backend.app.entities import CreatorApplication, User
from backend.app.main import app
from backend.app.security import create_access_token, hash_password

client = TestClient(app)


def setup_function():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)


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


def test_approved_creator_application_cannot_be_edited_or_resubmitted():
    creator = make_user("approved@example.com")
    admin = make_user("admin@example.com", "ADMIN")

    saved = client.post(
        "/api/v1/auth/creator-application",
        headers=auth(creator),
        json={"display_name": "Approved Creator", "handle": "approved_creator", "bio": "Initial bio"},
    )
    assert saved.status_code == 200

    submitted = client.post(
        "/api/v1/auth/creator-application/submit",
        headers=auth(creator),
    )
    assert submitted.status_code == 200

    app_id = submitted.json()["id"]
    approved = client.post(
        f"/api/v1/admin/creator-applications/{app_id}/approve",
        headers=auth(admin),
        json={"reason": "Verified"},
    )
    assert approved.status_code == 200
    assert approved.json()["status"] == "APPROVED"
    assert approved.json()["verification_status"] == "VERIFIED"

    edit = client.post(
        "/api/v1/auth/creator-application",
        headers=auth(creator),
        json={"display_name": "Changed", "handle": "changed_creator", "bio": "Changed bio"},
    )
    assert edit.status_code == 409

    resubmit = client.post(
        "/api/v1/auth/creator-application/submit",
        headers=auth(creator),
    )
    assert resubmit.status_code == 409

    db = SessionLocal()
    row = db.get(CreatorApplication, app_id)
    assert row.status == "APPROVED"
    assert row.verification_status == "VERIFIED"
    assert row.display_name == "Approved Creator"
    assert row.handle == "approved_creator"
    db.close()


def test_rejected_application_can_be_edited_and_resubmitted():
    creator = make_user("rejected@example.com")
    admin = make_user("admin-rejected@example.com", "ADMIN")

    saved = client.post(
        "/api/v1/auth/creator-application",
        headers=auth(creator),
        json={"display_name": "Applicant", "handle": "rejected_creator", "bio": "Original"},
    )
    assert saved.status_code == 200

    submitted = client.post(
        "/api/v1/auth/creator-application/submit",
        headers=auth(creator),
    )
    assert submitted.status_code == 200
    app_id = submitted.json()["id"]

    rejected = client.post(
        f"/api/v1/admin/creator-applications/{app_id}/reject",
        headers=auth(admin),
        json={"reason": "Please provide more information"},
    )
    assert rejected.status_code == 200
    assert rejected.json()["status"] == "REJECTED"
    assert rejected.json()["verification_status"] == "REJECTED"

    edited = client.post(
        "/api/v1/auth/creator-application",
        headers=auth(creator),
        json={"display_name": "Updated Applicant", "handle": "updated_creator", "bio": "Updated"},
    )
    assert edited.status_code == 200
    assert edited.json()["status"] == "REJECTED"
    assert edited.json()["verification_status"] == "REJECTED"

    resubmitted = client.post(
        "/api/v1/auth/creator-application/submit",
        headers=auth(creator),
    )
    assert resubmitted.status_code == 200
    assert resubmitted.json()["status"] == "SUBMITTED"
    assert resubmitted.json()["verification_status"] == "PENDING"
