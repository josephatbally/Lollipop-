from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .admin_routes import router as admin_router
from .auth_routes import router as auth_router
from .creators_routes import router as creators_router
from .db import Base, engine
from . import entities
from .media_routes import router as media_router
from .subscription_routes import router as subscription_router
from .routes import router

@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    yield

app = FastAPI(title="Lollipop API", version="0.4.0", description="Functional API foundation for the Lollipop creator media platform.", lifespan=lifespan)
app.add_middleware(CORSMiddleware, allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])
app.include_router(router)
app.include_router(auth_router)
app.include_router(admin_router)
app.include_router(creators_router)
app.include_router(media_router)
app.include_router(subscription_router)

@app.get("/")
def root() -> dict[str, str]:
    return {"application": "Lollipop API", "version": "0.4.0", "status": "ONLINE"}
