"""Stateful control surface manager implemented in Python."""
from __future__ import annotations

from copy import deepcopy
from datetime import datetime, timezone
from typing import Any, Iterable, List, Mapping, Optional, Union

from pydantic import ValidationError

from ...shared.types import (
    ControlSurface,
    FeatureToggle,
    FeatureTogglePatch,
    RoleControl,
    RoleControlPatch,
    ScanProfile,
    ScanProfilePatch,
)


def _timestamp() -> str:
    return datetime.now(timezone.utc).isoformat()


_DEFAULT_FEATURES: List[FeatureToggle] = [
    FeatureToggle(
        id="ai.orchestration",
        label="AI Orchestration Engine",
        description="Enable the multi-agent orchestration layer for automated campaign execution.",
        category="general",
        enabled=True,
        locked=False,
        requiresRestart=False,
        tags=["orchestration", "agents"],
    ),
    FeatureToggle(
        id="ui.advanced-controls",
        label="Advanced UI Control Surface",
        description="Expose Nessus-style orchestration controls in the web console.",
        category="ui",
        enabled=True,
        locked=False,
        requiresRestart=False,
        tags=["ui", "control"],
    ),
    FeatureToggle(
        id="mcp.streaming-results",
        label="MCP Streaming Results",
        description="Stream MCP tool execution events to the client UI for live telemetry.",
        category="mcp",
        enabled=True,
        locked=False,
        requiresRestart=False,
        tags=["mcp"],
    ),
    FeatureToggle(
        id="reporting.auto-publish",
        label="Auto Publish Reports",
        description="Automatically publish completed reports to the reporting center.",
        category="reporting",
        enabled=False,
        locked=False,
        requiresRestart=False,
        tags=["reports"],
    ),
    FeatureToggle(
        id="observability.deep-metrics",
        label="Advanced Metrics Collection",
        description="Collect extended telemetry, histograms, and traces for all tool executions.",
        category="observability",
        enabled=True,
        locked=False,
        requiresRestart=False,
        tags=["metrics"],
    ),
]

_DEFAULT_ROLES: List[RoleControl] = [
    RoleControl(
        role="admin",
        displayName="Administrator",
        description="Full platform access with override privileges.",
        permissions=["*"],
        featureAccess=[feature.id for feature in _DEFAULT_FEATURES],
        defaultLanding="dashboard",
        enforcement={
            "mfaRequired": True,
            "sessionTimeoutMinutes": 30,
        },
    ),
    RoleControl(
        role="pentester",
        displayName="Offensive Operator",
        description="Execute tooling, manage scans, and access findings.",
        permissions=["execute_tools", "manage_scans", "view_reports"],
        featureAccess=["ai.orchestration", "ui.advanced-controls", "mcp.streaming-results"],
        defaultLanding="operations",
        enforcement={
            "mfaRequired": True,
            "sessionTimeoutMinutes": 30,
        },
    ),
    RoleControl(
        role="auditor",
        displayName="Audit & Compliance",
        description="Read-only access to reports, dashboards, and compliance scans.",
        permissions=["view_reports", "view_dashboards"],
        featureAccess=["observability.deep-metrics"],
        defaultLanding="reports",
        enforcement={
            "mfaRequired": True,
            "sessionTimeoutMinutes": 60,
        },
    ),
    RoleControl(
        role="viewer",
        displayName="Stakeholder",
        description="Limited dashboard access for stakeholders and clients.",
        permissions=["view_dashboards"],
        featureAccess=["observability.deep-metrics"],
        defaultLanding="dashboard",
        enforcement={
            "mfaRequired": False,
            "sessionTimeoutMinutes": 120,
        },
    ),
]

_DEFAULT_SCAN_PROFILES: List[ScanProfile] = [
    ScanProfile(
        id="scan.network.weekly",
        name="Weekly Network Recon",
        category="network",
        description="Recurring internal and external network mapping with safe concurrency.",
        targets=["10.0.0.0/24", "corp.example.com"],
        tooling=["nmap_scan.sim", "masscan_scan.sim", "autorecon_scan.sim"],
        parameters={
            "nmap_scan": {"intensity": "med", "scripts": ["vuln"]},
            "masscan_scan": {"rate": 2000},
            "autorecon_scan": {"profile": "network-default"},
        },
        tags=["baseline", "scheduled"],
        schedule={
            "type": "scheduled",
            "cron": "0 2 * * 1",
            "timezone": "UTC",
            "maintenanceWindow": {"start": "02:00", "durationMinutes": 180},
        },
        guardrails={
            "approvalsRequired": True,
            "approvalsNeeded": 1,
            "safeMode": True,
            "maxParallelTasks": 3,
            "notifyRoles": ["admin", "pentester"],
        },
        owner="admin",
        createdAt=_timestamp(),
        updatedAt=_timestamp(),
    ),
    ScanProfile(
        id="scan.webapp.critical",
        name="Critical Web Applications",
        category="webapp",
        description="Continuous coverage for production web applications with attack chain guardrails.",
        targets=["https://app.example.com", "https://api.example.com"],
        tooling=["nuclei_scan.sim", "sqlmap_scan.sim", "gobuster_scan.sim"],
        parameters={
            "nuclei_scan": {"severity": ["critical", "high"], "templates": ["cves"]},
            "sqlmap_scan": {"threads": 3},
            "gobuster_scan": {"wordlist": "common.txt", "threads": 20},
        },
        tags=["continuous", "high-priority"],
        schedule={
            "type": "continuous",
            "timezone": "UTC",
        },
        guardrails={
            "approvalsRequired": False,
            "approvalsNeeded": 0,
            "safeMode": True,
            "maxParallelTasks": 2,
            "notifyRoles": ["admin", "auditor"],
        },
        owner="pentester",
        createdAt=_timestamp(),
        updatedAt=_timestamp(),
    ),
]


def _coerce_features(features: Iterable[FeatureToggle]) -> List[FeatureToggle]:
    return [FeatureToggle.model_validate(feature) for feature in features]


def _coerce_roles(roles: Iterable[RoleControl]) -> List[RoleControl]:
    return [RoleControl.model_validate(role) for role in roles]


def _coerce_profiles(profiles: Iterable[ScanProfile]) -> List[ScanProfile]:
    return [ScanProfile.model_validate(profile) for profile in profiles]


class ControlCenter:
    """Manage feature toggles, RBAC roles, and scan profiles."""

    def __init__(self, initial: Optional[dict] = None) -> None:
        initial = initial or {}
        features = initial.get("features", deepcopy(_DEFAULT_FEATURES))
        roles = initial.get("roles", deepcopy(_DEFAULT_ROLES))
        scan_profiles = initial.get("scanProfiles", deepcopy(_DEFAULT_SCAN_PROFILES))
        self._surface = ControlSurface(
            features=_coerce_features(features),
            roles=_coerce_roles(roles),
            scanProfiles=_coerce_profiles(scan_profiles),
        )

    def snapshot(self) -> ControlSurface:
        return ControlSurface.model_validate(self._surface.model_dump())

    def update_features(self, updates: Iterable[Union[FeatureToggle, FeatureTogglePatch, Mapping[str, Any]]]) -> ControlSurface:
        current = {feature.id: feature for feature in self._surface.features}
        for update in updates:
            if isinstance(update, (FeatureToggle, FeatureTogglePatch)):
                data = update.model_dump(exclude_none=True)
            else:
                raw = dict(update)
                try:
                    data = FeatureToggle.model_validate(raw).model_dump()
                except ValidationError:
                    data = FeatureTogglePatch.model_validate(raw).model_dump(exclude_none=True)
            identifier = data["id"]
            if identifier not in current:
                current[identifier] = FeatureToggle.model_validate(data)
                continue
            merged = current[identifier].model_dump()
            merged.update(data)
            current[identifier] = FeatureToggle.model_validate(merged)
        self._surface = ControlSurface(
            features=list(current.values()),
            roles=self._surface.roles,
            scanProfiles=self._surface.scanProfiles,
        )
        return self.snapshot()

    def update_roles(self, updates: Iterable[Union[RoleControl, RoleControlPatch, Mapping[str, Any]]]) -> ControlSurface:
        current = {role.role: role for role in self._surface.roles}
        for update in updates:
            if isinstance(update, (RoleControl, RoleControlPatch)):
                data = update.model_dump(exclude_none=True)
            else:
                raw = dict(update)
                try:
                    data = RoleControl.model_validate(raw).model_dump()
                except ValidationError:
                    data = RoleControlPatch.model_validate(raw).model_dump(exclude_none=True)
            role_name = data["role"]
            if role_name not in current:
                current[role_name] = RoleControl.model_validate(data)
                continue
            merged = current[role_name].model_dump()
            enforcement = merged.get("enforcement", {}).copy()
            enforcement.update(data.get("enforcement", {}))
            merged.update(data)
            merged["enforcement"] = enforcement
            current[role_name] = RoleControl.model_validate(merged)
        self._surface = ControlSurface(
            features=self._surface.features,
            roles=list(current.values()),
            scanProfiles=self._surface.scanProfiles,
        )
        return self.snapshot()

    def update_scan_profiles(self, updates: Iterable[Union[ScanProfile, ScanProfilePatch, Mapping[str, Any]]]) -> ControlSurface:
        current = {profile.id: profile for profile in self._surface.scanProfiles}
        for update in updates:
            if isinstance(update, (ScanProfile, ScanProfilePatch)):
                data = update.model_dump(exclude_none=True)
            else:
                raw = dict(update)
                try:
                    data = ScanProfile.model_validate(raw).model_dump()
                except ValidationError:
                    data = ScanProfilePatch.model_validate(raw).model_dump(exclude_none=True)
            identifier = data["id"]
            if identifier not in current:
                current[identifier] = ScanProfile.model_validate(data)
                continue
            merged = current[identifier].model_dump()
            schedule = merged.get("schedule", {}).copy()
            schedule.update(data.get("schedule", {}))
            guardrails = merged.get("guardrails", {}).copy()
            guardrails.update(data.get("guardrails", {}))
            merged.update(data)
            merged["schedule"] = schedule
            merged["guardrails"] = guardrails
            merged["updatedAt"] = _timestamp()
            current[identifier] = ScanProfile.model_validate(merged)
        self._surface = ControlSurface(
            features=self._surface.features,
            roles=self._surface.roles,
            scanProfiles=list(current.values()),
        )
        return self.snapshot()

    def reset(self) -> ControlSurface:
        self._surface = ControlSurface(
            features=deepcopy(_DEFAULT_FEATURES),
            roles=deepcopy(_DEFAULT_ROLES),
            scanProfiles=deepcopy(_DEFAULT_SCAN_PROFILES),
        )
        return self.snapshot()


control_center = ControlCenter()
