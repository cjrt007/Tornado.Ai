"""Route registration helpers."""
from __future__ import annotations

from fastapi import APIRouter, FastAPI

from . import cache, checklists, command, control, health, intelligence, processes, telemetry, viz


def register_routes(app: FastAPI) -> None:
    api_router = APIRouter(prefix="/api")
    api_router.include_router(health.router)
    api_router.include_router(control.router)
    api_router.include_router(intelligence.router)
    api_router.include_router(command.router)
    api_router.include_router(telemetry.router)
    api_router.include_router(cache.router)
    api_router.include_router(processes.router)
    api_router.include_router(viz.router)
    api_router.include_router(checklists.router)
    app.include_router(api_router)
