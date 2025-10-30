"""Control surface request handlers."""
from __future__ import annotations

from typing import Iterable

from pydantic import BaseModel

from ...core.control.center import control_center
from ...shared.types import (
    ControlSurface,
    FeatureToggle,
    FeatureTogglePatch,
    RoleControl,
    RoleControlPatch,
    ScanProfile,
    ScanProfilePatch,
)


class FeatureTogglePayload(BaseModel):
    features: Iterable[FeatureToggle | FeatureTogglePatch]


class RolePayload(BaseModel):
    roles: Iterable[RoleControl | RoleControlPatch]


class ScanPayload(BaseModel):
    scanProfiles: Iterable[ScanProfile | ScanProfilePatch]


async def get_control_surface() -> ControlSurface:
    return control_center.snapshot()


async def update_feature_surface(payload: FeatureTogglePayload) -> list[FeatureToggle]:
    return control_center.update_features(payload.features).features


async def update_role_surface(payload: RolePayload) -> list[RoleControl]:
    return control_center.update_roles(payload.roles).roles


async def update_scan_surface(payload: ScanPayload) -> list[ScanProfile]:
    return control_center.update_scan_profiles(payload.scanProfiles).scanProfiles
