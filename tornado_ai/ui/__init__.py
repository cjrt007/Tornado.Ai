"""UI registration for the Tornado AI console."""
from __future__ import annotations

from pathlib import Path

from fastapi import APIRouter, FastAPI, Request
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates


_UI_DIR = Path(__file__).parent
_TEMPLATES = Jinja2Templates(directory=str(_UI_DIR / "templates"))
_STATIC_DIR = _UI_DIR / "static"


def register_ui(app: FastAPI) -> None:
    """Mount the interactive console and supporting assets."""
    if not any(route.path == "/console" for route in app.routes):
        router = APIRouter(tags=["console"])

        @router.get("/console", response_class=HTMLResponse)
        async def console(request: Request) -> HTMLResponse:  # pragma: no cover - template rendering
            return _TEMPLATES.TemplateResponse("console.html", {"request": request})

        app.mount(
            "/console/static",
            StaticFiles(directory=str(_STATIC_DIR)),
            name="console-static",
        )
        app.include_router(router)
