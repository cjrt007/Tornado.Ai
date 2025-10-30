"""Route registration helpers."""
from __future__ import annotations

from fastapi import APIRouter, FastAPI

from . import control, health


def register_routes(app: FastAPI) -> None:
    api_router = APIRouter(prefix="/api")
    api_router.include_router(health.router)
    api_router.include_router(control.router)
    app.include_router(api_router)
