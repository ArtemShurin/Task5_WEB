from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db import SessionLocal
from app.services import review_service
from app.schemas.review import ReviewCreate, ReviewUpdate

router = APIRouter(prefix="/reviews", tags=["Reviews"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/get_all")
def get_all(db: Session = Depends(get_db)):
    return review_service.get_all_reviews(db)

@router.get("/by_product/{product_id}")
def get_by_product(product_id: str, db: Session = Depends(get_db)):
    return review_service.get_reviews_by_product(db, product_id)

@router.post("/create")
def create(data: ReviewCreate, db: Session = Depends(get_db)):
    return review_service.create_review(db, data)

@router.put("/{review_id}/update")
def update(review_id: str, data: ReviewUpdate, db: Session = Depends(get_db)):
    return review_service.update_review(db, review_id, data)

@router.patch("/{review_id}/soft_delete")
def soft_delete(review_id: str, db: Session = Depends(get_db)):
    review_service.soft_delete_review(db, review_id)
    return {"message": "Review soft deleted"}

@router.delete("/{review_id}/delete")
def delete(review_id: str, db: Session = Depends(get_db)):
    review_service.delete_review(db, review_id)
    return {"message": "Review deleted"}