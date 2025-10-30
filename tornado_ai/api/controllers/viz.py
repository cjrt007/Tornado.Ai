"""Visualization endpoints for AVE, SRTD, PVT, and IVC."""
from __future__ import annotations

from datetime import datetime, timezone
from typing import List

from ...core.decision import aide
from ...core.observability import telemetry_center
from ...tools.registry import tool_registry
from ...shared.types import DashboardCard, VulnerabilityCard


async def get_dashboard_cards() -> List[DashboardCard]:
    metrics = telemetry_center.snapshot()
    categories = tool_registry.categories()
    return [
        DashboardCard(
            id="tool-categories",
            title="Tool Coverage",
            description="Tool count by assessment category",
            value=categories,
            severity="info",
        ),
        DashboardCard(
            id="telemetry-counters",
            title="Telemetry Counters",
            description="Latest recorded counters",
            value=metrics.get("counters", {}),
            severity="success",
        ),
        DashboardCard(
            id="latency-p95",
            title="Adapter Latency P95",
            description="Latency histogram (p95) for tool adapters",
            value={name: hist.get("p95", 0.0) for name, hist in metrics.get("histograms", {}).items()},
            severity="warning",
        ),
    ]


async def get_vulnerability_card(card_id: str) -> VulnerabilityCard:
    now = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    return VulnerabilityCard(
        id=card_id,
        name="Simulated Remote Code Execution",
        cve="CVE-2023-1234",
        cvss=9.2,
        summary=f"Exploitable condition discovered during automated recon on {now}.",
        remediation=[
            "Apply latest vendor patch",
            "Rotate exposed credentials",
            "Enable WAF signatures for exploit pattern",
        ],
        references=[
            "https://owasp.org/www-project-top-ten/",
            "https://cheatsheetseries.owasp.org/",
        ],
    )
