"""Cache metrics endpoints."""
from __future__ import annotations

from ...core.cache.manager import scm


async def get_cache_stats() -> dict:
    return scm.stats()
