"""Health endpoint helpers."""
from __future__ import annotations

from dataclasses import dataclass

from ...core.audit.status import audit_log_status
from ...core.cache.manager import scm
from ...core.observability import telemetry_center
from ...mcp.registry import registry_size
from ...tools.registry import tool_registry


@dataclass
class HealthResponse:
    status: str
    registrySize: int
    cacheStats: dict
    telemetryCounters: dict
    toolCategories: dict
    lastAuditEvent: str | None = None


async def get_health_status() -> HealthResponse:
    size = registry_size()
    audit = audit_log_status()
    cache = scm.stats()
    telemetry = telemetry_center.snapshot()
    categories = tool_registry.categories()
    return HealthResponse(
        status="ok",
        registrySize=size,
        lastAuditEvent=audit.last_event_time,
        cacheStats=cache,
        telemetryCounters=telemetry.get("counters", {}),
        toolCategories=categories,
    )
