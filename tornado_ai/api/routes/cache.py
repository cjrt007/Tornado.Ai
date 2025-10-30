"""Cache statistics routes."""
from __future__ import annotations

from fastapi import APIRouter

from ..controllers.cache import get_cache_stats

router = APIRouter(prefix="/cache", tags=["cache"])


@router.get("/stats", summary="Retrieve SCM cache stats")
async def get_stats():
    return await get_cache_stats()
