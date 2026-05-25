from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.db import Base, engine, SessionLocal
from app.services.auth_service import seed_default_admin
from app.routers import auth, admin, proxy

app = FastAPI(title="API Gateway")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

Base.metadata.create_all(bind=engine)

app.include_router(auth.router)
app.include_router(admin.router)
app.include_router(proxy.router)


@app.on_event("startup")
def startup():
    db = SessionLocal()
    try:
        seed_default_admin(db)
    finally:
        db.close()
