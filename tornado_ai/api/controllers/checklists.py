"""Checklist endpoints exposing CSV-driven data."""
from __future__ import annotations

from ...checklists.loader import default_templates


async def get_default_checklists() -> dict:
    templates = default_templates()
    return {key: template.model_dump() for key, template in templates.items()}
