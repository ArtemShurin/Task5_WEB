from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db import SessionLocal
from app.services import product_service
from app.schemas.product import ProductCreate, ProductUpdate, ProductResponse
from app.dependencies import get_current_admin

router = APIRouter(prefix="/products", tags=["Products"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/get_all", response_model=list[ProductResponse])
def get_all(db: Session = Depends(get_db)):
    return product_service.get_all_products(db)

@router.get("/{product_id}/get_by_id", response_model=ProductResponse)
def get_by_id(product_id: str, db: Session = Depends(get_db)):
    return product_service.get_product(db, product_id)

@router.post("/create", response_model=ProductResponse)
def create_product(data: ProductCreate, db: Session = Depends(get_db), _: str = Depends(get_current_admin)):
    return product_service.create_product(db, data)

@router.put("/{product_id}/update")
def update(product_id: str, data: ProductUpdate, db: Session = Depends(get_db), _: str = Depends(get_current_admin)):
    return product_service.update_product(db, product_id, data)

@router.patch("/{product_id}/soft_delete")
def soft_delete(product_id: str, db: Session = Depends(get_db), _: str = Depends(get_current_admin)):
    product_service.soft_delete_product(db, product_id)
    return {"message": "Product soft deleted"}

@router.delete("/{product_id}/delete")
def delete(product_id: str, db: Session = Depends(get_db), _: str = Depends(get_current_admin)):
    product_service.delete_product(db, product_id)
    return {"message": "Product deleted"}

@router.patch("/{product_id}/reduce_stock")
def reduce_stock(product_id: str, quantity: int, db: Session = Depends(get_db)):
    return product_service.reduce_stock(db, product_id, quantity)