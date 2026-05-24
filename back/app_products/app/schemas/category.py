from pydantic import BaseModel
from uuid import UUID
from datetime import datetime

class CategoryBase(BaseModel):
    name: str
    description: str

class CategoryCreate(CategoryBase):
    pass

class CategoryUpdate(CategoryBase):
    pass

class CategoryResponse(CategoryBase):
    id: UUID
    name: str
    description: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True