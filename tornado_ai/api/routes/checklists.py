"""Checklist routes."""
from __future__ import annotations

from fastapi import APIRouter

from ..controllers.checklists import get_default_checklists

router = APIRouter(prefix="/checklists", tags=["checklists"])


@router.get("/default", summary="Retrieve default OWASP checklists")
async def get_default():
    return await get_default_checklists()
