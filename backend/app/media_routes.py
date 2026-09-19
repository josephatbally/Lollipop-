import json
from datetime import datetime, timezone
from pathlib import Path

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from fastapi.responses import FileResponse
from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.orm import Session

from .auth import admin_user, current_user
from .config import settings
from .db import get_db
from .entities import AuditLog, ConsentRecord, CreatorApplication, Media, User
from .media_storage import (
    ALLOWED_VIDEO_TYPES,
    delete_private_upload,
    new_storage_key,
    validate_video_signature,
    write_private_upload,
)
from .subscription_routes import can_view_media

router = APIRouter(prefix="/api/v1/media", tags=["media"])


class MediaOut(BaseModel):
    id: int
    creator_id: int
    title: str
    description: str | None
    original_filename: str
    content_type: str
    size_bytes: int
    checksum_sha256: str
    status: str
    access_level: str
    moderation_reason: str | None
    created_at: datetime
    reviewed_at: datetime | None


class ConsentIn(BaseModel):
    participant_reference: str = Field(min_length=1, max_length=255)
    authorization_version: str = Field(min_length=1, max_length=100)


class RejectIn(BaseModel):
    reason: str = Field(min_length=1, max_length=2000)


def _out(media: Media) -> MediaOut:
    return MediaOut.model_validate(media, from_attributes=True)


def _audit(
    db: Session,
    actor: User | None,
    action: str,
    media: Media,
    metadata: dict | None = None,
):
    db.add(
        AuditLog(
            actor_user_id=actor.id if actor else None,
            action=action,
            target_type="MEDIA",
            target_id=str(media.id),
            metadata_json=json.dumps(metadata or {}),
        )
    )


def _require_verified_creator(db: Session, user: User):
    if user.role != "CREATOR" or user.status != "ACTIVE":
        raise HTTPException(403, "Approved creator access is required")
    application = db.scalar(
        select(CreatorApplication).where(CreatorApplication.user_id == user.id)
    )
    if not application or application.status != "APPROVED" or application.verification_status != "VERIFIED":
        raise HTTPException(403, "Approved creator access is required")


def _private_media_path(storage_key: str) -> Path:
    root = Path(settings.media_storage_path).resolve()
    candidate = (root / storage_key).resolve()
    try:
        candidate.relative_to(root)
    except ValueError:
        raise HTTPException(404, "Media not found")
    return candidate


def _require_media_entitlement(db: Session, user: User, media: Media) -> None:
    if user.role == "ADMIN":
        return
    if media.status != "PUBLISHED":
        raise HTTPException(404, "Media not found")
    if can_view_media(db, user, media):
        return
    raise HTTPException(403, "Entitlement is required to access this media")


@router.post("/upload", response_model=MediaOut, status_code=201)
def upload_media(
    title: str = Form(..., min_length=1, max_length=200),
    description: str | None = Form(default=None, max_length=4000),
    consent: str = Form(..., description="JSON array of participant consent records"),
    file: UploadFile = File(...),
    user: User = Depends(current_user),
    db: Session = Depends(get_db),
):
    _require_verified_creator(db, user)
    if file.content_type not in ALLOWED_VIDEO_TYPES:
        raise HTTPException(415, "Unsupported video type")
    if not file.filename:
        raise HTTPException(422, "A filename is required")
    try:
        consent_items = [ConsentIn.model_validate(item) for item in json.loads(consent)]
    except (json.JSONDecodeError, TypeError, ValueError):
        raise HTTPException(422, "Consent must be a valid JSON array")
    if not consent_items:
        raise HTTPException(422, "At least one consent record is required")
    storage_key = new_storage_key(user.id, file.filename, file.content_type)
    try:
        initial = file.file.read(8192)
        if not validate_video_signature(file.content_type, initial):
            raise HTTPException(415, "File signature does not match the declared video type")
        file.file.seek(0)
        size, checksum = write_private_upload(file.file, storage_key)
    except HTTPException:
        delete_private_upload(storage_key)
        raise
    except ValueError as exc:
        delete_private_upload(storage_key)
        raise HTTPException(413, str(exc))
    except Exception:
        delete_private_upload(storage_key)
        raise HTTPException(500, "Media storage failed")
    media = Media(
        creator_id=user.id,
        title=title,
        description=description,
        original_filename=Path(file.filename).name[:255],
        content_type=file.content_type,
        storage_key=storage_key,
        size_bytes=size,
        checksum_sha256=checksum,
        status="REVIEW",
    )
    db.add(media)
    db.flush()
    for item in consent_items:
        db.add(
            ConsentRecord(
                media_id=media.id,
                participant_reference=item.participant_reference,
                authorization_version=item.authorization_version,
            )
        )
    _audit(
        db,
        user,
        "MEDIA_UPLOADED_FOR_REVIEW",
        media,
        {"filename": media.original_filename, "size_bytes": size},
    )
    db.commit()
    db.refresh(media)
    return _out(media)


@router.get("", response_model=list[MediaOut])
def list_my_media(user: User = Depends(current_user), db: Session = Depends(get_db)):
    if user.role == "ADMIN":
        query = select(Media).order_by(Media.created_at.desc())
    else:
        _require_verified_creator(db, user)
        query = select(Media).where(Media.creator_id == user.id).order_by(Media.created_at.desc())
    return [_out(row) for row in db.scalars(query).all()]


@router.get("/{media_id}/stream")
def stream_media(media_id: int, user: User = Depends(current_user), db: Session = Depends(get_db)):
    media = db.get(Media, media_id)
    if not media:
        raise HTTPException(404, "Media not found")
    _require_media_entitlement(db, user, media)
    media_path = _private_media_path(media.storage_key)
    if not media_path.is_file():
        raise HTTPException(404, "Media not found")
    return FileResponse(media_path, media_type=media.content_type)


@router.get("/{media_id}/download")
def download_media(media_id: int, user: User = Depends(current_user), db: Session = Depends(get_db)):
    media = db.get(Media, media_id)
    if not media:
        raise HTTPException(404, "Media not found")
    _require_media_entitlement(db, user, media)
    media_path = _private_media_path(media.storage_key)
    if not media_path.is_file():
        raise HTTPException(404, "Media not found")
    return FileResponse(
        media_path,
        media_type=media.content_type,
        filename=Path(media.original_filename).name,
        content_disposition_type="attachment",
    )


@router.get("/{media_id}", response_model=MediaOut)
def get_media(media_id: int, user: User = Depends(current_user), db: Session = Depends(get_db)):
    media = db.get(Media, media_id)
    if not media:
        raise HTTPException(404, "Media not found")
    _require_media_entitlement(db, user, media)
    return _out(media)


@router.post("/{media_id}/approve", response_model=MediaOut)
def approve_media(media_id: int, admin: User = Depends(admin_user), db: Session = Depends(get_db)):
    media = db.get(Media, media_id)
    if not media:
        raise HTTPException(404, "Media not found")
    if media.status != "REVIEW":
        raise HTTPException(409, "Media is not awaiting review")
    if not db.scalar(select(ConsentRecord.id).where(ConsentRecord.media_id == media.id)):
        raise HTTPException(409, "Required consent records are missing")
    media.status = "APPROVED"
    media.reviewed_at = datetime.now(timezone.utc)
    media.moderation_reason = None
    _audit(db, admin, "MEDIA_APPROVED", media)
    db.commit()
    db.refresh(media)
    return _out(media)


@router.post("/{media_id}/reject", response_model=MediaOut)
def reject_media(media_id: int, data: RejectIn, admin: User = Depends(admin_user), db: Session = Depends(get_db)):
    media = db.get(Media, media_id)
    if not media:
        raise HTTPException(404, "Media not found")
    if media.status not in {"REVIEW", "APPROVED"}:
        raise HTTPException(409, "Media is not reviewable")
    media.status = "REJECTED"
    media.reviewed_at = datetime.now(timezone.utc)
    media.moderation_reason = data.reason
    _audit(db, admin, "MEDIA_REJECTED", media, {"reason": data.reason})
    db.commit()
    db.refresh(media)
    return _out(media)


@router.post("/{media_id}/publish", response_model=MediaOut)
def publish_media(media_id: int, user: User = Depends(current_user), db: Session = Depends(get_db)):
    media = db.get(Media, media_id)
    if not media:
        raise HTTPException(404, "Media not found")
    _require_verified_creator(db, user)
    if media.creator_id != user.id:
        raise HTTPException(403, "Only the owning creator can publish this media")
    if media.status != "APPROVED":
        raise HTTPException(409, "Media must be approved before publication")
    if not db.scalar(select(ConsentRecord.id).where(ConsentRecord.media_id == media.id)):
        raise HTTPException(409, "Required consent records are missing")
    media.status = "PUBLISHED"
    _audit(db, user, "MEDIA_PUBLISHED", media)
    db.commit()
    db.refresh(media)
    return _out(media)
