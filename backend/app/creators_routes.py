from datetime import datetime\n\nfrom fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from .db import get_db
from .entities import CreatorApplication, CreatorSubscriptionPlan, Media, User

router = APIRouter(prefix="/api/v1/creators", tags=["creators"])


class CreatorSummaryOut(BaseModel):
    id: int
    display_name: str
    handle: str
    bio: str | None
    subscription_plan: "PlanSummaryOut | None"


class PlanSummaryOut(BaseModel):
    price_cents: int
    currency: str


class CreatorMediaOut(BaseModel):
    id: int
    title: str
    description: str | None
    content_type: str
    size_bytes: int
    access_level: str
    created_at: datetime


class CreatorProfileOut(CreatorSummaryOut):
    media_count: int


@router.get("", response_model=list[CreatorSummaryOut])
def list_creators(db: Session = Depends(get_db)):
    rows = db.execute(
        select(User, CreatorApplication, CreatorSubscriptionPlan)
        .join(CreatorApplication, CreatorApplication.user_id == User.id)
        .outerjoin(CreatorSubscriptionPlan, CreatorSubscriptionPlan.creator_id == User.id)
        .where(
            User.role == "CREATOR",
            User.status == "ACTIVE",
            CreatorApplication.status == "APPROVED",
            CreatorApplication.verification_status == "VERIFIED",
        )
        .order_by(CreatorApplication.display_name.asc())
    ).all()

    return [
        CreatorSummaryOut(
            id=user.id,
            display_name=application.display_name,
            handle=application.handle,
            bio=application.bio,
            subscription_plan=(
                PlanSummaryOut(price_cents=plan.price_cents, currency=plan.currency)
                if plan and plan.active else None
            ),
        )
        for user, application, plan in rows
    ]


@router.get("/{creator_id}", response_model=CreatorProfileOut)
def get_creator(creator_id: int, db: Session = __import__("fastapi").Depends(get_db)):
    row = db.execute(
        select(User, CreatorApplication, CreatorSubscriptionPlan)
        .join(CreatorApplication, CreatorApplication.user_id == User.id)
        .outerjoin(CreatorSubscriptionPlan, CreatorSubscriptionPlan.creator_id == User.id)
        .where(
            User.id == creator_id,
            User.role == "CREATOR",
            User.status == "ACTIVE",
            CreatorApplication.status == "APPROVED",
            CreatorApplication.verification_status == "VERIFIED",
        )
    ).first()

    if not row:
        raise HTTPException(404, "Creator not found")

    user, application, plan = row
    media_count = db.scalar(
        select(func.count(Media.id)).where(
            Media.creator_id == creator_id,
            Media.status == "PUBLISHED",
        )
    ) or 0

    return CreatorProfileOut(
        id=user.id,
        display_name=application.display_name,
        handle=application.handle,
        bio=application.bio,
        subscription_plan=(
            PlanSummaryOut(price_cents=plan.price_cents, currency=plan.currency)
            if plan and plan.active else None
        ),
        media_count=media_count,
    )


@router.get("/{creator_id}/media", response_model=list[CreatorMediaOut])
def list_creator_media(creator_id: int, db: Session = __import__("fastapi").Depends(get_db)):
    exists = db.scalar(
        select(User.id)
        .join(CreatorApplication, CreatorApplication.user_id == User.id)
        .where(
            User.id == creator_id,
            User.role == "CREATOR",
            User.status == "ACTIVE",
            CreatorApplication.status == "APPROVED",
            CreatorApplication.verification_status == "VERIFIED",
        )
    )
    if exists is None:
        raise HTTPException(404, "Creator not found")

    rows = db.scalars(
        select(Media)
        .where(Media.creator_id == creator_id, Media.status == "PUBLISHED")
        .order_by(Media.created_at.desc())
    ).all()

    return [
        CreatorMediaOut(
            id=media.id,
            title=media.title,
            description=media.description,
            content_type=media.content_type,
            size_bytes=media.size_bytes,
            access_level=media.access_level,
            created_at=media.created_at,
        )
        for media in rows
    ]
