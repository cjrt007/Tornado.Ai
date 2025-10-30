"""Command execution endpoint leveraging ASME, SCM, ROE, and ERR."""
from __future__ import annotations

import json
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict

from pydantic import BaseModel, Field

from ...core.cache.manager import scm
from ...core.decision.err import err
from ...core.observability import telemetry_center
from ...shared.types import ToolExecutionResult
from ...tools.adapters import run_dry

AUDIT_PATH = Path("data") / "audit.log.jsonl"


class CommandPayload(BaseModel):
    toolId: str
    params: Dict[str, Any] = Field(default_factory=dict)
    useCache: bool = True
    userId: str = "system"


class CommandResponse(BaseModel):
    result: ToolExecutionResult
    fallbackActions: list[str]


def _write_audit_entry(payload: CommandPayload, result: ToolExecutionResult) -> None:
    AUDIT_PATH.parent.mkdir(parents=True, exist_ok=True)
    event = {
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "actor": "api",
        "userId": payload.userId,
        "toolId": payload.toolId,
        "params": payload.params,
        "status": "success" if result.status in {"completed", "cached"} else "failure",
        "resultRef": result.telemetry,
        "correlationId": result.telemetry.get("seed", "none") if isinstance(result.telemetry, dict) else "none",
    }
    with AUDIT_PATH.open("a", encoding="utf-8") as handle:
        handle.write(json.dumps(event) + "\n")


async def execute_command(payload: CommandPayload) -> CommandResponse:
    telemetry_center.increment_counter("command.invocations")

    def _produce() -> ToolExecutionResult:
        telemetry_center.increment_counter(f"command.{payload.toolId}.requested")
        return run_dry(payload.toolId, payload.params)

    if payload.useCache:
        cached = scm.resolve(payload.toolId, payload.params, _produce)
        result = cached.value
        if cached.cached:
            result = result.model_copy(update={"status": "cached", "cached": True})
    else:
        result = _produce()

    _write_audit_entry(payload, result)
    fallback = err.fallback_actions(payload.toolId)
    return CommandResponse(result=result, fallbackActions=fallback)
