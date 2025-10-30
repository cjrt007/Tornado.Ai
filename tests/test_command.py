import asyncio

import pytest

from tornado_ai.api.controllers.command import CommandPayload, execute_command


@pytest.mark.asyncio
async def test_execute_command_uses_cache(tmp_path, monkeypatch):
    monkeypatch.setattr("tornado_ai.api.controllers.command.AUDIT_PATH", tmp_path / "audit.log.jsonl")
    payload = CommandPayload(toolId="nmap_scan.sim", params={"targets": ["10.0.0.1"]})
    first = await execute_command(payload)
    assert first.result.status == "completed"
    assert "runtime" in first.result.telemetry
    assert isinstance(first.result.telemetry["runtime"], dict)
    second = await execute_command(payload)
    assert second.result.cached is True
