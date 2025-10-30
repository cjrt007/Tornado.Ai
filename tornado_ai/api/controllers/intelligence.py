"""Intelligence endpoints for AIDE, TSA, IPO, and SACD."""
from __future__ import annotations

from pydantic import BaseModel, Field

from ...core.decision import aide
from ...shared.types import (
    AttackGraph,
    ParameterSuggestion,
    PriorToolResult,
    TargetProfile,
    ToolPlan,
)


class AnalyzeTargetPayload(BaseModel):
    target: TargetProfile
    history: list[PriorToolResult] = Field(default_factory=list)


class AnalyzeTargetResponse(BaseModel):
    plan: ToolPlan
    graph: AttackGraph
    recommendedConcurrency: int


class SelectToolsPayload(BaseModel):
    target: TargetProfile
    history: list[PriorToolResult] = Field(default_factory=list)


class OptimizeParametersPayload(BaseModel):
    toolId: str
    target: TargetProfile
    params: dict = Field(default_factory=dict)


async def analyze_target(payload: AnalyzeTargetPayload) -> AnalyzeTargetResponse:
    outcome = aide.analyze(payload.target, payload.history)
    return AnalyzeTargetResponse(plan=outcome.plan, graph=outcome.graph, recommendedConcurrency=outcome.recommendedConcurrency)


async def select_tools(payload: SelectToolsPayload) -> ToolPlan:
    return aide.analyze(payload.target, payload.history).plan


async def optimize_parameters(payload: OptimizeParametersPayload) -> ParameterSuggestion:
    return aide.optimize(payload.toolId, payload.params, payload.target)
