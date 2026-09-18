from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr, Field
from sqlalchemy import select
from sqlalchemy.orm import Session
from .auth import current_user
from .db import get_db
from .entities import User, CreatorApplication
from .security import create_access_token, hash_password, verify_password

router = APIRouter(prefix="/api/v1/auth", tags=["auth"])
class Credentials(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
class UserOut(BaseModel):
    id: int
    email: EmailStr
    role: str
    status: str
class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut
@router.post("/register", response_model=AuthResponse, status_code=201)
def register(data: Credentials, db: Session = Depends(get_db)):
    email=data.email.lower()
    if db.scalar(select(User).where(User.email==email)): raise HTTPException(409,"An account with that email already exists")
    user=User(email=email,password_hash=hash_password(data.password)); db.add(user); db.commit(); db.refresh(user)
    return AuthResponse(access_token=create_access_token(user.id,user.role),user=UserOut.model_validate(user,from_attributes=True))
@router.post("/login", response_model=AuthResponse)
def login(data: Credentials, db: Session = Depends(get_db)):
    user=db.scalar(select(User).where(User.email==data.email.lower()))
    if not user or not verify_password(data.password,user.password_hash): raise HTTPException(status.HTTP_401_UNAUTHORIZED,"Invalid email or password")
    return AuthResponse(access_token=create_access_token(user.id,user.role),user=UserOut.model_validate(user,from_attributes=True))
@router.get("/me", response_model=UserOut)
def me(user:User=Depends(current_user)): return UserOut.model_validate(user,from_attributes=True)

class CreatorApplicationIn(BaseModel):
    display_name: str = Field(min_length=2,max_length=120)
    handle: str = Field(min_length=3,max_length=40,pattern=r"^[A-Za-z0-9_]+$")
    bio: str | None = Field(default=None,max_length=1000)
class CreatorApplicationOut(BaseModel):
    id:int; display_name:str; handle:str; bio:str|None; status:str; verification_status:str; submitted_at:datetime|None
    model_config={"from_attributes":True}

@router.get("/creator-application",response_model=CreatorApplicationOut)
def get_creator_application(user:User=Depends(current_user),db:Session=Depends(get_db)):
    app=db.scalar(select(CreatorApplication).where(CreatorApplication.user_id==user.id))
    if not app: raise HTTPException(404,"Creator application not started")
    return app

@router.post("/creator-application",response_model=CreatorApplicationOut)
def save_creator_application(data:CreatorApplicationIn,user:User=Depends(current_user),db:Session=Depends(get_db)):
    app=db.scalar(select(CreatorApplication).where(CreatorApplication.user_id==user.id))
    if app and app.status=="SUBMITTED": raise HTTPException(409,"Application is already submitted")
    existing=db.scalar(select(CreatorApplication).where(CreatorApplication.handle==data.handle))
    if existing and (not app or existing.id!=app.id): raise HTTPException(409,"That handle is already in use")
    if not app: app=CreatorApplication(user_id=user.id,display_name=data.display_name,handle=data.handle,bio=data.bio); db.add(app)
    else: app.display_name=data.display_name; app.handle=data.handle; app.bio=data.bio
    db.commit(); db.refresh(app); return app

@router.post("/creator-application/submit",response_model=CreatorApplicationOut)
def submit_creator_application(user:User=Depends(current_user),db:Session=Depends(get_db)):
    app=db.scalar(select(CreatorApplication).where(CreatorApplication.user_id==user.id))
    if not app: raise HTTPException(404,"Create the creator application first")
    if app.status=="SUBMITTED": return app
    app.status="SUBMITTED"; app.verification_status="PENDING"; app.submitted_at=datetime.now(timezone.utc)
    db.commit(); db.refresh(app); return app
