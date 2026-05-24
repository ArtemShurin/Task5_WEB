from pydantic import BaseModel
from uuid import UUID
from datetime import datetime

class ProductBase(BaseModel):
    name: str
    description: str
    price: float
    stock: int
    image_url: str

class ProductCreate(ProductBase):
    pass

class ProductUpdate(ProductBase):
    pass

class CategoryShort(BaseModel):
    id: UUID
    name: str

    class Config:
        from_attributes = True

class ProductResponse(BaseModel):
    id: UUID
    name: str
    description: str
    price: float
    stock: int
    image_url: str | None = None
    created_at: datetime
    updated_at: datetime
    categories: list[CategoryShort] = []

    class Config:
        from_attributes = True