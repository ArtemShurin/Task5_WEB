from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db import SessionLocal
from app.services import category_service
from app.schemas.category import CategoryCreate, CategoryUpdate, CategoryResponse
from app.dependencies import get_current_admin

router = APIRouter(prefix="/categories", tags=["Categories"])


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.get("/get_all", response_model=list[CategoryResponse])
def get_all(db: Session = Depends(get_db)):
    return category_service.get_all_categories(db)


@router.get("/{category_id}/get_by_id")
def get_products(category_id: str, db: Session = Depends(get_db)):
    return category_service.get_category_products(db, category_id)


@router.post("/create")
def create(data: CategoryCreate, db: Session = Depends(get_db), _: str = Depends(get_current_admin)):
    return category_service.create_category(db, data)


@router.put("/{category_id}/update")
def update(category_id: str, data: CategoryUpdate, db: Session = Depends(get_db), _: str = Depends(get_current_admin)):
    return category_service.update_category(db, category_id, data)

@router.patch("/{category_id}/{product_id}/add")
def add_product(category_id: str, product_id: str, db: Session = Depends(get_db), _: str = Depends(get_current_admin)):
    return category_service.add_product_to_category(db, category_id, product_id)

@router.patch("/{category_id}/product/{product_id}")
def remove_product(category_id: str, product_id: str, db: Session = Depends(get_db), _: str = Depends(get_current_admin)):
    return category_service.remove_product(db, category_id, product_id)

@router.patch("/{category_id}/soft_delete")
def soft_delete(category_id: str, db: Session = Depends(get_db), _: str = Depends(get_current_admin)):
    category_service.soft_delete_category(db, category_id)
    return {"message": "Category soft deleted"}


@router.delete("/{category_id}/delete")
def delete(category_id: str, db: Session = Depends(get_db), _: str = Depends(get_current_admin)):
    category_service.delete_category(db, category_id)
    return {"message": "Category deleted"}


