from datetime import datetime, timezone, timedelta
import json
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.orm import Session
from .auth import current_user
from .db import get_db
from .entities import AuditLog, CreatorApplication, CreatorSubscriptionPlan, Media, Subscription, User

router = APIRouter(prefix="/api/v1", tags=["subscriptions"])

class PlanIn(BaseModel):
    price_cents: int = Field(ge=100, le=1000000)
    currency: str = Field(default="USD", min_length=3, max_length=3)

class PlanOut(BaseModel):
    creator_id: int
    price_cents: int
    currency: str
    active: bool

class SubscriptionOut(BaseModel):
    id: int
    creator_id: int
    status: str
    current_period_start: datetime
    current_period_end: datetime
    canceled_at: datetime | None

def _audit(db, actor, action, target_type, target_id, metadata=None):
    db.add(AuditLog(actor_user_id=actor.id, action=action, target_type=target_type,
                    target_id=str(target_id), metadata_json=json.dumps(metadata or {})))

def _is_verified_active_creator(db: Session, creator: User) -> bool:
    if creator.role != "CREATOR" or creator.status != "ACTIVE":
        return False
    application = db.scalar(select(CreatorApplication).where(CreatorApplication.user_id == creator.id))
    return bool(
        application
        and application.status == "APPROVED"
        and application.verification_status == "VERIFIED"
    )

def has_active_subscription(db: Session, customer_id: int, creator_id: int) -> bool:
    return db.scalar(select(Subscription).where(
        Subscription.customer_id == customer_id,
        Subscription.creator_id == creator_id,
        Subscription.status == "ACTIVE",
        Subscription.current_period_end > datetime.now(timezone.utc),
    )) is not None

def can_view_media(db: Session, user: User, media: Media) -> bool:
    if user.role == "ADMIN":
        return True
    if media.status != "PUBLISHED":
        return False
    if media.creator_id == user.id:
        return True
    if media.access_level == "PUBLIC":
        return True
    if media.access_level == "SUBSCRIBERS":
        return has_active_subscription(db, user.id, media.creator_id)
    return False

@router.put("/creators/me/subscription-plan", response_model=PlanOut)
def set_subscription_plan(data: PlanIn, user: User = Depends(current_user), db: Session = Depends(get_db)):
    if not _is_verified_active_creator(db, user):
        raise HTTPException(403, "Approved creator access is required")
    currency = data.currency.upper()
    row = db.scalar(select(CreatorSubscriptionPlan).where(CreatorSubscriptionPlan.creator_id == user.id))
    if row is None:
        row = CreatorSubscriptionPlan(creator_id=user.id, price_cents=data.price_cents, currency=currency)
        db.add(row)
    else:
        row.price_cents, row.currency, row.active = data.price_cents, currency, True
    _audit(db, user, "SUBSCRIPTION_PLAN_UPDATED", "CREATOR", user.id,
           {"price_cents": data.price_cents, "currency": currency})
    db.commit()
    db.refresh(row)
    return row

@router.get("/creators/{creator_id}/subscription-plan", response_model=PlanOut)
def get_subscription_plan(creator_id: int, db: Session = Depends(get_db)):
    row = db.scalar(select(CreatorSubscriptionPlan).where(
        CreatorSubscriptionPlan.creator_id == creator_id,
        CreatorSubscriptionPlan.active.is_(True)))
    if row is None:
        raise HTTPException(404, "Subscription plan not found")
    return row

@router.post("/subscriptions/{creator_id}", response_model=SubscriptionOut, status_code=201)
def subscribe(creator_id: int, user: User = Depends(current_user), db: Session = Depends(get_db)):
    if user.role != "CUSTOMER":
        raise HTTPException(403, "Customer access is required")
    creator = db.get(User, creator_id)
    if creator is None or not _is_verified_active_creator(db, creator):
        raise HTTPException(404, "Creator not found")
    plan = db.scalar(select(CreatorSubscriptionPlan).where(
        CreatorSubscriptionPlan.creator_id == creator_id,
        CreatorSubscriptionPlan.active.is_(True)))
    if plan is None:
        raise HTTPException(409, "Creator does not have an active subscription plan")
    now = datetime.now(timezone.utc)
    existing = db.scalar(select(Subscription).where(
        Subscription.customer_id == user.id, Subscription.creator_id == creator_id,
        Subscription.status == "ACTIVE"))
    if existing and existing.current_period_end > now:
        return existing
    if existing is None:
        existing = Subscription(customer_id=user.id, creator_id=creator_id, status="ACTIVE",
                                current_period_start=now, current_period_end=now + timedelta(days=30))
        db.add(existing)
    else:
        existing.status = "ACTIVE"
        existing.current_period_start = now
        existing.current_period_end = now + timedelta(days=30)
        existing.canceled_at = None
    db.flush()
    _audit(db, user, "SUBSCRIPTION_ACTIVATED", "SUBSCRIPTION", existing.id,
           {"creator_id": creator_id, "currency": plan.currency, "price_cents": plan.price_cents})
    db.commit()
    db.refresh(existing)
    return existing

@router.get("/subscriptions", response_model=list[SubscriptionOut])
def list_subscriptions(user: User = Depends(current_user), db: Session = Depends(get_db)):
    if user.role != "CUSTOMER":
        raise HTTPException(403, "Customer access is required")
    return list(db.scalars(select(Subscription).where(
        Subscription.customer_id == user.id).order_by(Subscription.created_at.desc())).all())

@router.post("/subscriptions/{subscription_id}/cancel", response_model=SubscriptionOut)
def cancel_subscription(subscription_id: int, user: User = Depends(current_user), db: Session = Depends(get_db)):
    sub = db.get(Subscription, subscription_id)
    if sub is None or sub.customer_id != user.id:
        raise HTTPException(404, "Subscription not found")
    if sub.status != "ACTIVE":
        raise HTTPException(409, "Subscription is not active")
    sub.status = "CANCELED"
    sub.canceled_at = datetime.now(timezone.utc)
    _audit(db, user, "SUBSCRIPTION_CANCELED", "SUBSCRIPTION", sub.id, {"creator_id": sub.creator_id})
    db.commit()
    db.refresh(sub)
    return sub
