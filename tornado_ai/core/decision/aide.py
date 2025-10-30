"""Advanced Intelligent Decision Engine (AIDE)."""
from __future__ import annotations

from dataclasses import dataclass
from typing import List

from ...shared.types import AttackGraph, ParameterSuggestion, PriorToolResult, TargetProfile, ToolPlan
from ..observability.telemetry import telemetry_center
from .ipo import IntelligentParameterOptimizer
from .roe import roe
from .sacd import SmartAttackChainDiscovery
from .tsa import ToolSelectionAssistant, ToolSelectionContext


@dataclass
class AIDEOutput:
    plan: ToolPlan
    graph: AttackGraph
    recommendedConcurrency: int


class AdvancedIntelligentDecisionEngine:
    def __init__(
        self,
        tsa: ToolSelectionAssistant,
        ipo: IntelligentParameterOptimizer,
        sacd: SmartAttackChainDiscovery,
    ) -> None:
        self._tsa = tsa
        self._ipo = ipo
        self._sacd = sacd

    def analyze(self, profile: TargetProfile, history: List[PriorToolResult]) -> AIDEOutput:
        with telemetry_center.span("aide.analyze", targetId=profile.targetId):
            context = ToolSelectionContext(profile=profile, history=history)
            plan = self._tsa.build_plan(context)
            graph = self._sacd.build_graph(profile)
            concurrency = roe.recommend_concurrency(profile)
        return AIDEOutput(plan=plan, graph=graph, recommendedConcurrency=concurrency)

    def optimize(self, tool_id: str, params: dict, profile: TargetProfile) -> ParameterSuggestion:
        with telemetry_center.span("aide.optimize", toolId=tool_id):
            return self._ipo.suggest(tool_id, params, profile)


__all__ = ["AdvancedIntelligentDecisionEngine", "AIDEOutput"]
