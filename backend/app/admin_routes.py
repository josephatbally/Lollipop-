import json
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.orm import Session
from .auth import admin_user
from .db import get_db
from .entities import AuditLog, CreatorApplication, User

router = APIRouter(prefix="/api/v1/admin", tags=["admin"])

class ReviewIn(BaseModel):
    reason: str | None = Field(default=None, max_length=2000)

class ApplicationOut(BaseModel):
    id: int
    user_id: int
    email: str
    display_name: str
    handle: str
    bio: str | None
    status: str
    verification_status: str
    submitted_at: datetime | None
    reviewed_at: datetime | None
    review_reason: str | None

def _out(app: CreatorApplication, user: User) -> ApplicationOut:
    return ApplicationOut(id=app.id, user_id=app.user_id, email=user.email,
        display_name=app.display_name, handle=app.handle, bio=app.bio,
        status=app.status, verification_status=app.verification_status,
        submitted_at=app.submitted_at, reviewed_at=app.reviewed_at,
        review_reason=app.review_reason)

@router.get("/creator-applications", response_model=list[ApplicationOut])
def pending_creator_applications(admin: User = Depends(admin_user), db: Session = Depends(get_db)):
    rows = db.execute(select(CreatorApplication, User).join(User, User.id == CreatorApplication.user_id)
        .where(CreatorApplication.status == "SUBMITTED", CreatorApplication.verification_status == "PENDING")
        .order_by(CreatorApplication.submitted_at.asc())).all()
    return [_out(app, user) for app, user in rows]

def _get(app_id: int, db: Session) -> CreatorApplication:
    app = db.get(CreatorApplication, app_id)
    if not app: raise HTTPException(404, "Creator application not found")
    return app

def _audit(db: Session, admin: User, action: str, app: CreatorApplication, reason: str | None):
    db.add(AuditLog(actor_user_id=admin.id, action=action, target_type="CREATOR_APPLICATION",
                    target_id=str(app.id), metadata_json=json.dumps({"reason": reason}) if reason else None))

@router.post("/creator-applications/{app_id}/approve", response_model=ApplicationOut)
def approve_creator_application(app_id: int, data: ReviewIn, admin: User = Depends(admin_user), db: Session = Depends(get_db)):
    app = _get(app_id, db)
    if app.status != "SUBMITTED" or app.verification_status != "PENDING":
        raise HTTPException(409, "Application is not pending review")
    user = db.get(User, app.user_id)
    if not user: raise HTTPException(404, "Applicant account not found")
    app.status="APPROVED"; app.verification_status="VERIFIED"; app.review_reason=data.reason
    app.reviewed_at=datetime.now(timezone.utc); user.role="CREATOR"
    _audit(db, admin, "CREATOR_APPLICATION_APPROVED", app, data.reason)
    db.commit(); db.refresh(app); db.refresh(user)
    return _out(app, user)

@router.post("/creator-applications/{app_id}/reject", response_model=ApplicationOut)
def reject_creator_application(app_id: int, data: ReviewIn, admin: User = Depends(admin_user), db: Session = Depends(get_db)):
    app = _get(app_id, db)
    if app.status != "SUBMITTED" or app.verification_status != "PENDING":
        raise HTTPException(409, "Application is not pending review")
    if not data.reason: raise HTTPException(422, "A rejection reason is required")
    user = db.get(User, app.user_id)
    if not user: raise HTTPException(404, "Applicant account not found")
    app.status="REJECTED"; app.verification_status="REJECTED"; app.review_reason=data.reason
    app.reviewed_at=datetime.now(timezone.utc)
    _audit(db, admin, "CREATOR_APPLICATION_REJECTED", app, data.reason)
    db.commit(); db.refresh(app)
    return _out(app, user)
