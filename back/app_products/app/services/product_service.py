from sqlalchemy.orm import Session, joinedload
from fastapi import HTTPException
from app.models.product import Product
from datetime import datetime

def get_all_products(db: Session):
    return (
        db.query(Product)
        .options(joinedload(Product.categories))
        .filter(Product.deleted == False)
        .all()
    )

def get_product(db: Session, product_id):
    product = (
        db.query(Product)
        .options(joinedload(Product.categories))
        .filter(Product.id == product_id, Product.deleted == False)
        .first()
    )

    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    return product


def create_product(db: Session, data):
    existing = db.query(Product).filter(
        Product.name == data.name,
        Product.deleted == False
    ).first()

    if existing:
        raise HTTPException(status_code=409, detail="Product name already exists")

    product = Product(**data.dict())

    db.add(product)
    db.commit()
    db.refresh(product)

    return product

def update_product(db: Session, product_id, data):
    product = get_product(db, product_id)

    # 🔥 проверка имени
    if data.name != product.name:
        existing = db.query(Product).filter(
            Product.name == data.name,
            Product.deleted == False,
            Product.id != product.id   # ❗ исключаем текущий объект
        ).first()

        if existing:
            raise HTTPException(
                status_code=409,
                detail="Product with this name already exists"
            )

    for key, value in data.dict().items():
        setattr(product, key, value)

    product.updated_at = datetime.utcnow()

    db.commit()
    db.refresh(product)

    return product

def soft_delete_product(db: Session, product_id):
    product = get_product(db, product_id)
    product.deleted = True
    product.updated_at = datetime.utcnow()
    db.commit()

def delete_product(db: Session, product_id):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(404, "Product not found")
    db.delete(product)
    db.commit()
    return {"message": "Product permanently deleted"}


def reduce_stock(db: Session, product_id, quantity: int):
    product = get_product(db, product_id)
    if product.stock < quantity:
        raise HTTPException(status_code=422, detail=f"Insufficient stock: available {product.stock}, requested {quantity}")
    product.stock -= quantity
    product.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(product)
    return {"product_id": str(product.id), "stock": product.stock}