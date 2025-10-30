"""Process orchestration endpoints backed by APME."""
from __future__ import annotations

from pydantic import BaseModel

from ...core.processes.manager import process_manager
from ...shared.types import ProcessRecord


class TerminateResponse(BaseModel):
    process: ProcessRecord
    message: str


async def list_processes() -> list[ProcessRecord]:
    return process_manager.list()


async def get_process(process_id: str) -> ProcessRecord:
    return process_manager.get(process_id)


async def terminate_process(process_id: str) -> TerminateResponse:
    record = process_manager.terminate(process_id)
    return TerminateResponse(process=record, message="Process termination requested")
