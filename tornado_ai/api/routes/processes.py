"""Process control routes."""
from __future__ import annotations

from fastapi import APIRouter

from ..controllers.processes import (
    TerminateResponse,
    get_process,
    list_processes,
    terminate_process,
)

router = APIRouter(prefix="/processes", tags=["processes"])


@router.get("/list", summary="List synthetic process states")
async def get_processes():
    return await list_processes()


@router.get("/status/{process_id}", summary="Fetch a synthetic process status")
async def get_process_status(process_id: str):
    return await get_process(process_id)


@router.post("/terminate/{process_id}", response_model=TerminateResponse, summary="Terminate a synthetic process")
async def post_terminate(process_id: str):
    return await terminate_process(process_id)
