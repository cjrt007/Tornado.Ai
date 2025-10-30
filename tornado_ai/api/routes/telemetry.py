"""Routes exposing observability telemetry."""
from __future__ import annotations

from fastapi import APIRouter

from ..controllers.telemetry import get_telemetry_snapshot

router = APIRouter(prefix="/telemetry", tags=["telemetry"])


@router.get("/", summary="Retrieve telemetry counters, histograms, and spans")
async def get_telemetry():
    return await get_telemetry_snapshot()
