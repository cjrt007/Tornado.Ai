"""FastAPI application bootstrap."""
from __future__ import annotations

from fastapi import FastAPI

from .api.routes import register_routes
from .config import config
from .core.metrics.logger import configure_logging


def create_app() -> FastAPI:
    logger = configure_logging(config.logging.to_logging_dict())
    app = FastAPI(title="Tornado AI", version="0.1.0")
    register_routes(app)

    @app.on_event("startup")
    async def _announce_startup() -> None:  # pragma: no cover - log side effect
        logger.info(
            "Tornado AI server starting", extra={"host": config.server.host, "port": config.server.port}
        )

    return app


app = create_app()
