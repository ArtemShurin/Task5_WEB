import os
import httpx
from fastapi import APIRouter, Request, Response, Depends
from app.dependencies import get_current_admin

PRODUCTS_URL = os.getenv("PRODUCTS_SERVICE_URL", "http://localhost:8000")
ORDERS_URL = os.getenv("ORDERS_SERVICE_URL", "http://localhost:8001")

HOP_BY_HOP = {"transfer-encoding", "connection", "keep-alive", "upgrade", "te", "trailers"}

router = APIRouter(prefix="/admin", tags=["Admin"])


async def forward(request: Request, target_url: str) -> Response:
    body = await request.body()
    headers = {k: v for k, v in request.headers.items() if k.lower() not in HOP_BY_HOP and k.lower() != "host"}
    async with httpx.AsyncClient() as client:
        resp = await client.request(
            method=request.method,
            url=target_url,
            headers=headers,
            content=body,
            params=dict(request.query_params),
            timeout=30.0,
        )
    resp_headers = {k: v for k, v in resp.headers.items() if k.lower() not in HOP_BY_HOP}
    return Response(content=resp.content, status_code=resp.status_code, headers=resp_headers)


@router.api_route("/products/{path:path}", methods=["GET", "POST", "PUT", "PATCH", "DELETE"])
async def admin_products(path: str, request: Request, _: str = Depends(get_current_admin)):
    return await forward(request, f"{PRODUCTS_URL}/products/{path}")


@router.api_route("/categories/{path:path}", methods=["GET", "POST", "PUT", "PATCH", "DELETE"])
async def admin_categories(path: str, request: Request, _: str = Depends(get_current_admin)):
    return await forward(request, f"{PRODUCTS_URL}/categories/{path}")


@router.api_route("/reviews/{path:path}", methods=["GET", "POST", "PUT", "PATCH", "DELETE"])
async def admin_reviews(path: str, request: Request, _: str = Depends(get_current_admin)):
    return await forward(request, f"{PRODUCTS_URL}/reviews/{path}")


@router.api_route("/orders/{path:path}", methods=["GET", "POST", "PUT", "PATCH", "DELETE"])
async def admin_orders(path: str, request: Request, _: str = Depends(get_current_admin)):
    return await forward(request, f"{ORDERS_URL}/orders/{path}")
