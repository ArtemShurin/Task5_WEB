from pydantic import BaseModel, EmailStr
from uuid import UUID
from datetime import datetime
from typing import Literal

class OrderCreate(BaseModel):
    order_number: int
    user_name: str
    phone: str
    email: EmailStr
    address: str

class OrderResponse(OrderCreate):
    id: UUID
    status: Literal["created", "processing", "shipped", "delivered", "cancelled"]
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True