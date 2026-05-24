import os
import httpx
from fastapi import HTTPException

PRODUCTS_SERVICE_URL = os.getenv("PRODUCTS_SERVICE_URL", "http://localhost:8000")


def get_product(product_id: str) -> dict:
    url = f"{PRODUCTS_SERVICE_URL}/products/{product_id}/get_by_id"
    try:
        response = httpx.get(url, timeout=5.0)
    except httpx.RequestError as e:
        raise HTTPException(status_code=503, detail=f"Products service unavailable: {e}")

    if response.status_code == 404:
        raise HTTPException(status_code=404, detail="Product not found")
    if response.status_code != 200:
        raise HTTPException(status_code=502, detail="Error from Products service")

    return response.json()


def reduce_stock(product_id: str, quantity: int) -> dict:
    url = f"{PRODUCTS_SERVICE_URL}/products/{product_id}/reduce_stock"
    try:
        response = httpx.patch(url, params={"quantity": quantity}, timeout=5.0)
    except httpx.RequestError as e:
        raise HTTPException(status_code=503, detail=f"Products service unavailable: {e}")

    if response.status_code == 422:
        detail = response.json().get("detail", "Insufficient stock")
        raise HTTPException(status_code=422, detail=detail)
    if response.status_code != 200:
        raise HTTPException(status_code=502, detail=f"Failed to reduce stock: {response.text}")

    return response.json()
