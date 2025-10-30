"""Routes for the control surface."""
from __future__ import annotations

from fastapi import APIRouter

from ..controllers.control import (
    FeatureTogglePayload,
    RolePayload,
    ScanPayload,
    get_control_surface,
    update_feature_surface,
    update_role_surface,
    update_scan_surface,
)

router = APIRouter(prefix="/control", tags=["control"])


@router.get("/", summary="Retrieve the current control surface")
async def read_control_surface():
    return await get_control_surface()


@router.post("/features", summary="Update feature toggles")
async def post_features(payload: FeatureTogglePayload):
    return await update_feature_surface(payload)


@router.post("/roles", summary="Update role definitions")
async def post_roles(payload: RolePayload):
    return await update_role_surface(payload)


@router.post("/scans", summary="Update scan profiles")
async def post_scans(payload: ScanPayload):
    return await update_scan_surface(payload)
