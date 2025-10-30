"""Pydantic models that mirror the original TypeScript schemas."""
from __future__ import annotations

from typing import Any, Dict, List, Literal, Optional

from pydantic import BaseModel, ConfigDict, Field

PermissionLiteral = Literal[
    "execute_tools",
    "view_reports",
    "manage_users",
    "configure_system",
    "manage_scans",
    "view_dashboards",
]


class ToolSpec(BaseModel):
    model_config = ConfigDict(extra="forbid")

    id: str
    category: Literal["network", "webapp", "cloud", "binary", "ctf", "osint", "compliance", "hybrid"]
    summary: str
    inputSchema: Dict[str, Any]
    outputSchema: Optional[Dict[str, Any]] = None
    requiredPermissions: List[str]
    estimatedDuration: int


class ToolCall(BaseModel):
    model_config = ConfigDict(extra="forbid")

    toolId: str
    params: Dict[str, Any]
    correlationId: str
    userId: str
    approve: bool = False


class AuditEvent(BaseModel):
    model_config = ConfigDict(extra="forbid")

    timestamp: str
    actor: Literal["mcp", "api", "test", "web"]
    userId: str
    toolId: str
    params: Dict[str, Any]
    status: Literal["success", "failure", "pending"]
    resultRef: Optional[str] = None
    error: Optional[str] = None
    correlationId: str


class User(BaseModel):
    model_config = ConfigDict(extra="forbid")

    id: str
    username: str
    email: str
    passwordHash: str
    role: Literal["admin", "pentester", "auditor", "viewer"]
    mfaEnabled: bool
    mfaSecret: Optional[str] = None
    createdAt: str
    lastLogin: Optional[str] = None


class ChecklistItem(BaseModel):
    model_config = ConfigDict(extra="forbid")

    id: str
    checklistId: str
    category: str
    testId: str
    description: str
    status: Literal["not_started", "in_progress", "completed", "not_applicable"]
    severity: Literal["critical", "high", "medium", "low", "info"]
    evidence: List[str] = Field(default_factory=list)
    notes: str
    testedBy: str
    testedDate: Optional[str] = None


class ToolDescriptor(BaseModel):
    model_config = ConfigDict(extra="forbid")

    name: str
    description: str


class ToolCategory(BaseModel):
    model_config = ConfigDict(extra="forbid")

    name: str
    tool_count: int
    tools: List[ToolDescriptor]


class NewFeature(BaseModel):
    model_config = ConfigDict(extra="forbid")

    name: str
    description: str


class SecurityStatistics(BaseModel):
    model_config = ConfigDict(extra="forbid")

    total_categories: int
    total_tools: int
    last_verified: str


class SecurityToolsCollection(BaseModel):
    model_config = ConfigDict(extra="forbid")

    version: str
    last_updated: str
    categories: List[ToolCategory]
    new_features: List[NewFeature]
    statistics: SecurityStatistics


class FeatureToggle(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    id: str
    label: str
    description: str
    category: Literal["general", "auth", "mcp", "reporting", "ui", "observability", "tools"]
    enabled: bool
    locked: bool = False
    requiresRestart: bool = Field(default=False, alias="requiresRestart")
    tags: List[str] = Field(default_factory=list)


class FeatureTogglePatch(BaseModel):
    model_config = ConfigDict(extra="forbid")

    id: str
    enabled: Optional[bool] = None
    locked: Optional[bool] = None


class RoleEnforcement(BaseModel):
    model_config = ConfigDict(extra="forbid")

    mfaRequired: bool
    sessionTimeoutMinutes: int


class RoleControl(BaseModel):
    model_config = ConfigDict(extra="forbid")

    role: Literal["admin", "pentester", "auditor", "viewer"]
    displayName: str
    description: str
    permissions: List[str]
    featureAccess: List[str] = Field(default_factory=list)
    defaultLanding: str = "dashboard"
    enforcement: RoleEnforcement


class RoleControlPatch(BaseModel):
    model_config = ConfigDict(extra="forbid")

    role: Literal["admin", "pentester", "auditor", "viewer"]
    permissions: Optional[List[str]] = None
    featureAccess: Optional[List[str]] = None
    defaultLanding: Optional[str] = None
    enforcement: Optional[RoleEnforcement] = None


class MaintenanceWindow(BaseModel):
    model_config = ConfigDict(extra="forbid")

    start: str
    durationMinutes: int


class ScanSchedule(BaseModel):
    model_config = ConfigDict(extra="forbid")

    type: Literal["manual", "scheduled", "continuous"]
    cron: Optional[str] = None
    timezone: str = "UTC"
    maintenanceWindow: Optional[MaintenanceWindow] = None


class ScanGuardrail(BaseModel):
    model_config = ConfigDict(extra="forbid")

    approvalsRequired: bool
    approvalsNeeded: int = 1
    safeMode: bool
    maxParallelTasks: int
    notifyRoles: List[Literal["admin", "pentester", "auditor", "viewer"]] = Field(default_factory=list)


class ScanProfile(BaseModel):
    model_config = ConfigDict(extra="forbid")

    id: str
    name: str
    category: Literal["network", "webapp", "cloud", "binary", "ctf", "osint", "compliance", "hybrid"]
    description: str
    targets: List[str]
    tooling: List[str]
    parameters: Dict[str, Any] = Field(default_factory=dict)
    tags: List[str] = Field(default_factory=list)
    schedule: ScanSchedule
    guardrails: ScanGuardrail
    owner: str
    createdAt: str
    updatedAt: str


class ScanProfilePatch(BaseModel):
    model_config = ConfigDict(extra="forbid")

    id: str
    description: Optional[str] = None
    targets: Optional[List[str]] = None
    tooling: Optional[List[str]] = None
    parameters: Optional[Dict[str, Any]] = None
    tags: Optional[List[str]] = None
    schedule: Optional[Dict[str, Any]] = None
    guardrails: Optional[Dict[str, Any]] = None


class ControlSurface(BaseModel):
    model_config = ConfigDict(extra="forbid")

    features: List[FeatureToggle]
    roles: List[RoleControl]
    scanProfiles: List[ScanProfile]
