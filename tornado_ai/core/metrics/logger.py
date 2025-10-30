"""Application logging helpers."""
from __future__ import annotations

import logging
from logging.config import dictConfig
from typing import Any, Dict, Optional

_DEFAULT_LOG_CONFIG: Dict[str, Any] = {
    "version": 1,
    "disable_existing_loggers": False,
    "formatters": {
        "default": {
            "format": "%(asctime)s | %(levelname)s | %(name)s | %(message)s",
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
