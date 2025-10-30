"""Telemetry exposure for observability dashboards."""
from __future__ import annotations

from ...core.observability import telemetry_center


async def get_telemetry_snapshot() -> dict:
    return telemetry_center.snapshot()
