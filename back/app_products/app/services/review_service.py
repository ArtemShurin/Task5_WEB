from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.models.review import Review
from datetime import datetime
from app.models.product import Product

def get_all_reviews(db: Session):
    return db.query(Review).filter(Review.deleted == False).all()

def get_reviews_by_product(db: Session, product_id: str):
    return db.query(Review).filter(
        Review.product_id == product_id,
        Review.deleted == False
    ).order_by(Review.created_at.desc()).all()

def create_review(db: Session, data):
    
    product = db.query(Product).filter(
        Product.id == data.product_id,
        Product.deleted == False
    ).first()

    if not product:
        raise HTTPException(
            status_code=404,
            detail="Product not found"
        )
    existing = db.query(Review).filter(
        Review.user_name == data.user_name,
        Review.product_id == data.product_id,
        Review.deleted == False
    ).first()

    if existing:
        raise HTTPException(status_code=409, detail="Вы уже оставляли отзыв на этот товар")
    
    review = Review(**data.dict())

    db.add(review)
    db.commit()
    db.refresh(review)

    return review

def update_review(db: Session, review_id, data):
    review = db.query(Review).filter(
        Review.id == review_id,
        Review.deleted == False
    ).first()

    if not review:
        raise HTTPException(status_code=404, detail="Review not found")

    update_data = data.dict(exclude_unset=True)

    for key, value in update_data.items():
        setattr(review, key, value)

    review.updated_at = datetime.utcnow()

    db.commit()
    db.refresh(review)

    return review

def soft_delete_review(db: Session, review_id):
    review = db.query(Review).filter(
        Review.id == review_id,
        Review.deleted == False
    ).first()

    if not review:
        raise HTTPException(status_code=404, detail="Review not found")

    review.deleted = True
    db.commit()

def delete_review(db: Session, review_id):
    review = db.query(Review).filter(Review.id == review_id).first()

    if not review:
        raise HTTPException(status_code=404, detail="Review not found")

    db.delete(review)
    db.commit()