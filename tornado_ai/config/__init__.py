"""Application configuration loaded from environment variables."""
from __future__ import annotations

import os
from dataclasses import dataclass, field
from typing import Any, Dict

from dotenv import load_dotenv

load_dotenv()


@dataclass
class ServerConfig:
    host: str = field(default_factory=lambda: os.getenv("TORNADO_SERVER_HOST", "127.0.0.1"))
    port: int = field(default_factory=lambda: int(os.getenv("TORNADO_SERVER_PORT", "8000")))
    cors_enabled: bool = field(
        default_factory=lambda: os.getenv("TORNADO_SERVER_CORS", "true").lower() == "true"
    )


@dataclass
class LoggingConfig:
    level: str = field(default_factory=lambda: os.getenv("TORNADO_LOG_LEVEL", "INFO"))

    def to_logging_dict(self) -> Dict[str, Any]:
        return {
            "root": {
                "handlers": ["console"],
                "level": self.level.upper(),
            }
        }


@dataclass
class AppConfig:
    server: ServerConfig = field(default_factory=ServerConfig)
    logging: LoggingConfig = field(default_factory=LoggingConfig)


config = AppConfig()
