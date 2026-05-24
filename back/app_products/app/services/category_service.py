from sqlalchemy.orm import Session
from fastapi import HTTPException
from datetime import datetime

from app.models.category import Category
from app.models.product import Product
from app.models.product_category import ProductCategory

def get_all_categories(db):
    return db.query(Category).filter(Category.deleted == False).all()

def get_category_products(db, category_id):

    category = db.query(Category).filter(
        Category.id == category_id,
        Category.deleted == False
    ).first()

    if not category:
        raise HTTPException(404, "Category not found")

    return category.products


def create_category(db: Session, data):
    category = Category(**data.dict())
    existing = db.query(Category).filter(
        Category.name == data.name,
        Category.deleted == False
    ).first()

    if existing:
        raise HTTPException(status_code=409, detail="Category name already exists")
    
    db.add(category)
    db.commit()
    db.refresh(category)
    return category


def update_category(db: Session, category_id, data):
    category = db.query(Category).filter(
        Category.id == category_id,
        Category.deleted == False
    ).first()

    if not category:
        raise HTTPException(status_code=404, detail="Category not found")

    if data.name != category.name:
        existing = db.query(Category).filter(
            Category.name == data.name,
            Category.deleted == False,
            Category.id != category.id
        ).first()

        if existing:
            raise HTTPException(
                status_code=409,
                detail="Category with this name already exists"
            )

    for key, value in data.dict().items():
        setattr(category, key, value)

    category.updated_at = datetime.utcnow()

    db.commit()
    db.refresh(category)

    return category


def soft_delete_category(db: Session, category_id):
    category = db.query(Category).filter(
        Category.id == category_id,
        Category.deleted == False
    ).first()

    if not category:
        raise HTTPException(404, "Category not found")

    category.deleted = True
    db.commit()


def delete_category(db: Session, category_id):
    category = db.query(Category).filter(Category.id == category_id).first()

    if not category:
        raise HTTPException(404, "Category not found")

    db.delete(category)
    db.commit()



def add_product_to_category(db, category_id, product_id):

    category = db.query(Category).filter(
        Category.id == category_id,
        Category.deleted == False
    ).first()

    if not category:
        raise HTTPException(404, "Category not found")

    product = db.query(Product).filter(
        Product.id == product_id,
        Product.deleted == False
    ).first()

    if not product:
        raise HTTPException(404, "Product not found")

    if product in category.products:
        raise HTTPException(409, "Product already in category")

    category.products.append(product)

    db.commit()

    return {"message": "Product added to category"}


def remove_product(db, category_id, product_id):

    category = db.query(Category).filter(
        Category.id == category_id,
        Category.deleted == False
    ).first()

    if not category:
        raise HTTPException(404, "Category not found")

    product = db.query(Product).filter(Product.id == product_id).first()

    if not product:
        raise HTTPException(404, "Product not found")

    if product not in category.products:
        raise HTTPException(404, "Product not in category")

    category.products.remove(product)

    db.commit()

    return {"message": "Product removed from category"}