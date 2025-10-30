"""Routes exposing AIDE, TSA, IPO, and SACD."""
from __future__ import annotations

from fastapi import APIRouter

from ..controllers.intelligence import (
    AnalyzeTargetPayload,
    AnalyzeTargetResponse,
    OptimizeParametersPayload,
    SelectToolsPayload,
    analyze_target,
    optimize_parameters,
    select_tools,
)
from ...shared.types import ToolPlan

router = APIRouter(prefix="/intelligence", tags=["intelligence"])


@router.post("/analyze-target", response_model=AnalyzeTargetResponse, summary="Analyze a target and return a plan + graph")
async def post_analyze_target(payload: AnalyzeTargetPayload):
    return await analyze_target(payload)


@router.post("/select-tools", response_model=ToolPlan, summary="Select tools for a target")
async def post_select_tools(payload: SelectToolsPayload):
    return await select_tools(payload)


@router.post("/optimize-parameters", summary="Optimize parameters for a tool")
async def post_optimize_parameters(payload: OptimizeParametersPayload):
    return await optimize_parameters(payload)
