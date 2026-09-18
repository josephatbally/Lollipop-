from datetime import datetime, timezone

from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter(prefix="/api/v1")


class HealthResponse(BaseModel):
    status: str
    service: str
    timestamp: datetime


class FeatureResponse(BaseModel):
    identity: str
    creators: str
    media: str
    moderation: str
    monetization: str


@router.get("/health", response_model=HealthResponse)
def health() -> HealthResponse:
    return HealthResponse(
        status="ONLINE",
        service="lollipop-api",
        timestamp=datetime.now(timezone.utc),
    )


@router.get("/features", response_model=FeatureResponse)
def features() -> FeatureResponse:
    return FeatureResponse(
        identity="FOUNDATION",
        creators="FOUNDATION",
        media="FOUNDATION",
        moderation="REQUIRED",
        monetization="PLANNED",
    )
