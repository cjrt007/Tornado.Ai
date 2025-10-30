"""Tool Selection Assistant (TSA)."""
from __future__ import annotations

from dataclasses import dataclass
from typing import List

from ...shared.types import PriorToolResult, TargetProfile, ToolPlan, ToolPlanStep
from ...tools.registry import ToolRegistry


@dataclass
class ToolSelectionContext:
    profile: TargetProfile
    history: List[PriorToolResult]


class ToolSelectionAssistant:
    """Simple heuristic-driven tool selector based on CVSS and categories."""

    _ASSET_CATEGORY_PRIORITIES = {
        "webapp": ["webapp", "osint", "network"],
        "api": ["webapp", "network", "osint"],
        "mobile": ["webapp", "ctf", "osint"],
        "cloud": ["cloud", "osint", "network"],
        "infrastructure": ["network", "cloud", "osint"],
        "binary": ["binary", "ctf", "network"],
        "iot": ["network", "binary", "webapp"],
    }

    def __init__(self, registry: ToolRegistry) -> None:
        self._registry = registry

    def build_plan(self, context: ToolSelectionContext) -> ToolPlan:
        available = self._registry.list_definitions()
        history_ids = {result.toolId: result for result in context.history}
        ordered_steps: List[ToolPlanStep] = []

        priorities = self._ASSET_CATEGORY_PRIORITIES.get(context.profile.assetKind, ["network"])
        cvss_multiplier = 1.0 + (context.profile.cvss / 10)

        for definition in available:
            spec = definition.spec
            if spec.category not in priorities:
                continue
            prior = history_ids.get(spec.id)
            if prior and prior.success:
                continue
            score = self._score_tool(spec.category, cvss_multiplier, definition.decision_weight, definition.cvss_bias)
            rationale = self._rationale_for(spec.category, context.profile)
            prerequisites = []
            if spec.category == "webapp":
                prerequisites = ["nmap_scan.sim"] if spec.id != "nmap_scan.sim" else []
            ordered_steps.append(
                ToolPlanStep(
                    toolId=spec.id,
                    rationale=rationale,
                    score=round(score, 2),
                    category=spec.category,
                    prerequisites=prerequisites,
                )
            )

        ordered_steps.sort(key=lambda step: step.score, reverse=True)
        summary = (
            f"Selected {len(ordered_steps)} candidate tools for target {context.profile.targetId} "
            f"based on CVSS {context.profile.cvss:.1f} and asset kind {context.profile.assetKind}."
        )
        return ToolPlan(targetId=context.profile.targetId, steps=ordered_steps, summary=summary)

    def _score_tool(self, category: str, cvss_multiplier: float, weight: float, bias: float) -> float:
        base = weight * cvss_multiplier + bias
        return base

    def _rationale_for(self, category: str, profile: TargetProfile) -> str:
        if category == "webapp":
            return "Prioritize web application testing to validate OWASP Top 10 exposures."
        if category == "network":
            return "Map exposed network services to support deeper exploitation."
        if category == "cloud":
            return "Validate misconfigurations in cloud control plane across accounts."
        if category == "binary":
            return "Reverse engineer binaries for potential memory corruption vectors."
        if category == "ctf":
            return "Use exploitation helpers to accelerate challenge solving."
        if category == "osint":
            return "Expand external footprint visibility using open-source intelligence feeds."
        return f"Run category {category} tooling for target {profile.targetId}."


__all__ = ["ToolSelectionAssistant", "ToolSelectionContext"]
