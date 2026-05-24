from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import Integer, Float, Boolean
from sqlalchemy.dialects.postgresql import UUID
import uuid
from app.db import Base


class OrderItem(Base):
    __tablename__ = "order_items"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    order_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True))
    product_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True))

    quantity: Mapped[int] = mapped_column(Integer)
    price: Mapped[float] = mapped_column(Float)

    deleted: Mapped[bool] = mapped_column(Boolean, default=False)