"""Application logging helpers."""
from __future__ import annotations

import json
import logging
from logging import LogRecord
from logging.config import dictConfig
from typing import Any, Dict, Optional


class JsonFormatter(logging.Formatter):
    """Structured JSON log formatter for observability pipelines."""

    def format(self, record: LogRecord) -> str:  # pragma: no cover - logging string formatting
        payload = {
            "timestamp": self.formatTime(record, self.datefmt),
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
        }
        if record.exc_info:
            payload["exc_info"] = self.formatException(record.exc_info)
        payload.update(getattr(record, "extra", {}))
        return json.dumps(payload, default=str)

_DEFAULT_LOG_CONFIG: Dict[str, Any] = {
    "version": 1,
    "disable_existing_loggers": False,
    "formatters": {
        "default": {
            "()": JsonFormatter,
        }
    },
    "handlers": {
        "console": {
            "class": "logging.StreamHandler",
            "level": "INFO",
            "formatter": "default",
        }
    },
    "root": {
        "handlers": ["console"],
        "level": "INFO",
    },
}


def configure_logging(config: Optional[Dict[str, Any]] = None) -> logging.Logger:
    merged = dict(_DEFAULT_LOG_CONFIG)
    if config:
        merged = {
            **merged,
            **config,
        }
    dictConfig(merged)
    return logging.getLogger("tornado_ai")
