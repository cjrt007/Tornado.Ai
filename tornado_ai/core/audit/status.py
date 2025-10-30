"""Helpers for reading the JSONL audit log."""
from __future__ import annotations

import json
from dataclasses import dataclass
from pathlib import Path
from typing import Optional

AUDIT_LOG_PATH = Path("data") / "audit.log.jsonl"


@dataclass
class AuditLogStatus:
    entries: int
    last_event_time: Optional[str] = None


def audit_log_status() -> AuditLogStatus:
    try:
        content = AUDIT_LOG_PATH.read_text(encoding="utf-8")
    except FileNotFoundError:
        return AuditLogStatus(entries=0)
    lines = [line for line in content.splitlines() if line.strip()]
    if not lines:
        return AuditLogStatus(entries=0)
    last = json.loads(lines[-1])
    return AuditLogStatus(entries=len(lines), last_event_time=last.get("timestamp"))
