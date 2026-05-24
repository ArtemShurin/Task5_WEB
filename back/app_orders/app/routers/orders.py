from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.db import SessionLocal
from app.schemas.order import OrderCreate
from app.schemas.order_item import OrderItemCreate
from app.dependencies import get_current_admin
from app.services import order_service, order_item_service


class StatusUpdate(BaseModel):
    status: str

router = APIRouter(prefix="/orders", tags=["Orders"])


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("/create")
def create_order(data: OrderCreate, db: Session = Depends(get_db)):
    return order_service.create_order(db, data)

@router.get("/get_all")
def get_all(db: Session = Depends(get_db)):
    return order_service.get_all_orders(db)

@router.get("/{order_id}/get_by_id")
def get_order(order_id: str, db: Session = Depends(get_db)):
    return order_service.get_order_by_id(db, order_id)


@router.patch("/{order_id}/add_item")
def add_item(order_id: str, data: OrderItemCreate, db: Session = Depends(get_db)):
    return order_item_service.add_item(db, order_id, data)


@router.patch("/{order_id}/item/{product_id}")
def remove_item(order_id: str, product_id: str, db: Session = Depends(get_db)):
    return order_item_service.remove_item(db, order_id, product_id)


@router.get("/{order_id}/status")
def get_status(order_id: str, db: Session = Depends(get_db)):
    return order_service.get_status(db, order_id)


@router.patch("/{order_id}/soft_delete")
def soft_delete(order_id: str, db: Session = Depends(get_db)):
    return order_service.soft_delete_order(db, order_id)


@router.delete("/{order_id}/delete")
def delete(order_id: str, db: Session = Depends(get_db)):
    return order_service.delete_order(db, order_id)


@router.patch("/{order_id}/update_status")
def update_status(order_id: str, data: StatusUpdate, db: Session = Depends(get_db), _: str = Depends(get_current_admin)):
    return order_service.update_order_status(db, order_id, data.status)