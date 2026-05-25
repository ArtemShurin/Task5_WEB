from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db import SessionLocal
from app.schemas.admin import AdminLogin, AdminCreate, Token, AdminInfo
from app.services import auth_service
from app.dependencies import get_current_admin

router = APIRouter(prefix="/auth", tags=["Auth"])


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("/login", response_model=Token)
def login(data: AdminLogin, db: Session = Depends(get_db)):
    admin = auth_service.authenticate(db, data.username, data.password)
    if not admin:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    return {"access_token": auth_service.create_access_token(admin.username), "token_type": "bearer"}


@router.get("/me", response_model=AdminInfo)
def me(username: str = Depends(get_current_admin)):
    return {"username": username}


@router.post("/admins", response_model=AdminInfo, status_code=201)
def create_admin(data: AdminCreate, db: Session = Depends(get_db), _: str = Depends(get_current_admin)):
    admin = auth_service.create_admin(db, data.username, data.password)
    return {"username": admin.username}
