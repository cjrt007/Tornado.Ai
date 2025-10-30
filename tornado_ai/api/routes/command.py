"""Route exposing the ASME command surface."""
from __future__ import annotations

from fastapi import APIRouter

from ..controllers.command import CommandPayload, CommandResponse, execute_command

router = APIRouter(prefix="/command", tags=["command"])


@router.post("/", response_model=CommandResponse, summary="Execute a tool via the autonomous engine")
async def post_command(payload: CommandPayload):
    return await execute_command(payload)
