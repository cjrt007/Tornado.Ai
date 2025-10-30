"""Error Recovery & Resilience (ERR) helpers."""
from __future__ import annotations

from typing import Dict, List


class ErrorRecoveryAndResilience:
    def fallback_actions(self, tool_id: str) -> List[str]:
        mapping: Dict[str, List[str]] = {
            "nmap_scan.sim": ["Retry with reduced intensity", "Switch to masscan for confirmation"],
            "nuclei_scan.sim": ["Validate target availability", "Run with smaller template set"],
            "sqlmap_scan.sim": ["Confirm injection point manually", "Try time-based payloads"],
        }
        return mapping.get(tool_id, ["Review tool configuration", "Escalate to human analyst"])


err = ErrorRecoveryAndResilience()


__all__ = ["ErrorRecoveryAndResilience", "err"]
