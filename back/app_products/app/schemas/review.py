from pydantic import BaseModel
from uuid import UUID
from datetime import datetime
from typing import Optional

class ReviewBase(BaseModel):
    name: str
    description: str
    user_name: str
    product_id: UUID
    rate: int

class ReviewCreate(ReviewBase):
    pass

class ReviewUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    rate: Optional[int] = None

class ReviewResponse(BaseModel):
    id: UUID
    name: str
    user_name: str
    product_id: UUID
    description: str
    rate: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True