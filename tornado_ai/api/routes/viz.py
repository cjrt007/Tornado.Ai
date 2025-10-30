"""Visualization routes for dashboards and vulnerability cards."""
from __future__ import annotations

from fastapi import APIRouter

from ..controllers.viz import get_dashboard_cards, get_vulnerability_card

router = APIRouter(prefix="/viz", tags=["visualization"])


@router.get("/dashboard", summary="Retrieve dashboard cards")
async def get_dashboard():
    return [card.model_dump() for card in await get_dashboard_cards()]


@router.get("/vuln-card/{card_id}", summary="Retrieve a vulnerability card")
async def get_vuln_card(card_id: str):
    return (await get_vulnerability_card(card_id)).model_dump()
