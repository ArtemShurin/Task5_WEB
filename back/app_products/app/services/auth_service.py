import os
import bcrypt
from datetime import datetime, timedelta
from jose import jwt
from sqlalchemy.orm import Session
from app.models.admin import Admin

JWT_SECRET = os.getenv("JWT_SECRET", "secret")
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
JWT_EXPIRE_MINUTES = int(os.getenv("JWT_EXPIRE_MINUTES", "480"))


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()


def verify_password(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(plain.encode(), hashed.encode())


def create_access_token(username: str) -> str:
    expire = datetime.utcnow() + timedelta(minutes=JWT_EXPIRE_MINUTES)
    return jwt.encode({"sub": username, "exp": expire}, JWT_SECRET, algorithm=JWT_ALGORITHM)


def authenticate(db: Session, username: str, password: str) -> Admin | None:
    admin = db.query(Admin).filter(Admin.username == username, Admin.is_active == True).first()
    if not admin or not verify_password(password, admin.hashed_password):
        return None
    return admin


def seed_default_admin(db: Session):
    exists = db.query(Admin).first()
    if exists:
        return
    username = os.getenv("ADMIN_USERNAME", "admin")
    password = os.getenv("ADMIN_PASSWORD", "admin123")
    admin = Admin(username=username, hashed_password=hash_password(password))
    db.add(admin)
    db.commit()
