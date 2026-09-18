from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr, Field
from sqlalchemy import select
from sqlalchemy.orm import Session
from .auth import current_user
from .db import get_db
from .entities import User
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
    email = data.email.lower()
    if db.scalar(select(User).where(User.email == email)):
        raise HTTPException(409, "An account with that email already exists")
    user = User(email=email, password_hash=hash_password(data.password))
    db.add(user); db.commit(); db.refresh(user)
    return AuthResponse(access_token=create_access_token(user.id, user.role), user=UserOut.model_validate(user, from_attributes=True))

@router.post("/login", response_model=AuthResponse)
def login(data: Credentials, db: Session = Depends(get_db)):
    user = db.scalar(select(User).where(User.email == data.email.lower()))
    if not user or not verify_password(data.password, user.password_hash):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid email or password")
    return AuthResponse(access_token=create_access_token(user.id, user.role), user=UserOut.model_validate(user, from_attributes=True))

@router.get("/me", response_model=UserOut)
def me(user: User = Depends(current_user)):
    return UserOut.model_validate(user, from_attributes=True)
