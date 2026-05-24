from sqlalchemy.orm import Session
from fastapi import HTTPException
from datetime import datetime

from app.models.order import Order
from app.models.order_item import OrderItem


def create_order(db: Session, data):
    existing_order = db.query(Order).filter(
        Order.order_number == data.order_number
    ).first()

    if existing_order:
        raise HTTPException(
            status_code=409,
            detail="Order with this order_number already exists"
        )

    
    
    order = Order(
        order_number=data.order_number,
        user_name=data.user_name,
        phone=data.phone,
        email=data.email,
        address=data.address,
        status="created",
        deleted=False
    )

    db.add(order)
    db.commit()
    db.refresh(order)

    return order

def get_all_orders(db: Session):
    orders = db.query(Order).filter(
        Order.deleted == False
    ).order_by(Order.created_at.desc()).all()

    result = []

    for order in orders:
        result.append({
            "order_number": order.order_number,
            "order_id": str(order.id),
            "user_name": order.user_name,
            "phone": order.phone,
            "email": order.email,
            "address": order.address,
            "status": order.status,
            "created_at": order.created_at.strftime("%d.%m.%Y %H:%M"),
        })

    return result

def get_order_by_id(db: Session, order_id):
    order = db.query(Order).filter(
        Order.id == order_id,
        Order.deleted == False
    ).first()

    if not order:
        raise HTTPException(404, "Order not found")

    items = db.query(OrderItem).filter(
        OrderItem.order_id == order_id,
        OrderItem.deleted == False
    ).all()

    result_items = []
    total_price = 0

    for item in items:
        item_total = item.price * item.quantity
        total_price += item_total

        result_items.append({
            "product_id": str(item.product_id),
            "quantity": item.quantity,
            "price": item.price,
            "total": item_total
        })

    return {
        "id": str(order.id),
        "order_number": order.order_number,
        "user_name": order.user_name,
        "phone": order.phone,
        "email": order.email,
        "address": order.address,
        "status": order.status,
        "items": result_items,
        "total_price": total_price
    }


def get_status(db: Session, order_id):
    order = db.query(Order).filter(Order.id == order_id).first()

    if not order:
        raise HTTPException(404, "Order not found")

    return {"status": order.status}


def soft_delete_order(db: Session, order_id):
    order = db.query(Order).filter(Order.id == order_id).first()

    if not order:
        raise HTTPException(404, "Order not found")
    if order.deleted is True:
        raise HTTPException(status_code=400, detail="Order already soft deleted")
    order.deleted = True
    db.commit()

    return {"message": "Order soft deleted"}


def delete_order(db: Session, order_id):
    order = db.query(Order).filter(Order.id == order_id).first()

    if not order:
        raise HTTPException(404, "Order not found")

    db.delete(order)
    db.commit()

    return {"message": "Order permanently deleted"}


VALID_STATUSES = {"created", "processing", "shipped", "delivered", "cancelled"}


def update_order_status(db: Session, order_id: str, new_status: str):
    if new_status not in VALID_STATUSES:
        raise HTTPException(400, f"Invalid status. Valid values: {', '.join(VALID_STATUSES)}")

    order = db.query(Order).filter(Order.id == order_id, Order.deleted == False).first()
    if not order:
        raise HTTPException(404, "Order not found")

    order.status = new_status
    order.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(order)

    return {"order_id": str(order.id), "status": order.status}