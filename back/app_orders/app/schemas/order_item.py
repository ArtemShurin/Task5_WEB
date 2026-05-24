from pydantic import BaseModel
from uuid import UUID

class OrderItemCreate(BaseModel):
    product_id: UUID
    quantity: int