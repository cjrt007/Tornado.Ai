"""Health endpoint helpers."""
from __future__ import annotations

from dataclasses import dataclass

from ...core.audit.status import audit_log_status
from ...mcp.registry import registry_size


@dataclass
class HealthResponse:
    status: str
    registrySize: int
    lastAuditEvent: str | None = None


async def get_health_status() -> HealthResponse:
    size = registry_size()
    audit = audit_log_status()
    return HealthResponse(
        status="ok",
        registrySize=size,
        lastAuditEvent=audit.last_event_time,
    )
