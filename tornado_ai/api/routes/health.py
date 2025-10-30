"""FastAPI routes for health checks."""
from __future__ import annotations

from fastapi import APIRouter

from ..controllers.health import get_health_status

router = APIRouter(prefix="/health", tags=["health"])


@router.get("/", summary="API health status")
async def health():
    return await get_health_status()
