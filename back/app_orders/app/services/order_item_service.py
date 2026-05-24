from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.models.order import Order
from app.models.order_item import OrderItem
from app.clients import product_client


def add_item(db: Session, order_id, data):
    order = db.query(Order).filter(
        Order.id == order_id,
        Order.deleted == False
    ).first()

    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    product = product_client.get_product(str(data.product_id))

    if product["stock"] < data.quantity:
        raise HTTPException(
            status_code=422,
            detail=f"Insufficient stock: available {product['stock']}, requested {data.quantity}"
        )

    price = product["price"]

    existing_item = db.query(OrderItem).filter(
        OrderItem.order_id == order_id,
        OrderItem.product_id == data.product_id,
        OrderItem.deleted == False
    ).first()

    if existing_item:
        existing_item.quantity += data.quantity
        existing_item.price = price
        db.commit()
        db.refresh(existing_item)
        product_client.reduce_stock(str(data.product_id), data.quantity)
        return existing_item

    item = OrderItem(
        order_id=order_id,
        product_id=data.product_id,
        quantity=data.quantity,
        price=price
    )

    db.add(item)
    db.commit()
    db.refresh(item)

    product_client.reduce_stock(str(data.product_id), data.quantity)

    return item


def remove_item(db: Session, order_id, product_id):
    item = db.query(OrderItem).filter(
        OrderItem.order_id == order_id,
        OrderItem.product_id == product_id,
        OrderItem.deleted == False
    ).first()

    if not item:
        raise HTTPException(status_code=404, detail="Item not found")

    item.deleted = True

    db.commit()
    return {"message": "Item removed"}