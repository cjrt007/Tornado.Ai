"""Intelligent Parameter Optimizer (IPO)."""
from __future__ import annotations

from typing import Dict

from ...shared.types import ParameterSuggestion, TargetProfile


class IntelligentParameterOptimizer:
    def suggest(self, tool_id: str, params: Dict[str, object], profile: TargetProfile) -> ParameterSuggestion:
        guardrails = self._guardrails_for(tool_id, profile)
        suggested = {**params, **guardrails}
        rationale = self._rationale(tool_id, profile)
        return ParameterSuggestion(toolId=tool_id, suggestedParams=suggested, rationale=rationale)

    def _guardrails_for(self, tool_id: str, profile: TargetProfile) -> Dict[str, object]:
        if tool_id == "masscan_scan.sim":
            return {"rate": 1000 if profile.environment == "production" else 5000}
        if tool_id == "nuclei_scan.sim":
            return {"severity": ["high", "critical"] if profile.criticality == "high" else ["medium", "high"]}
        if tool_id == "sqlmap_scan.sim":
            return {"risk": "2" if profile.environment == "production" else "3"}
        return {}

    def _rationale(self, tool_id: str, profile: TargetProfile) -> str:
        if tool_id == "masscan_scan.sim":
            return "Throttle scan rate to respect production-safe guardrails."
        if tool_id == "nuclei_scan.sim":
            return "Filter templates to focus on impactful vulnerabilities."
        if tool_id == "sqlmap_scan.sim":
            return "Adjust SQLMap risk profile according to environment sensitivity."
        return f"Standard parameter optimization for {profile.assetKind}."


__all__ = ["IntelligentParameterOptimizer"]
