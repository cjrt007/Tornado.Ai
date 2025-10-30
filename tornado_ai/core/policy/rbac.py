"""Role based access control utilities translated from the original TypeScript module."""
from __future__ import annotations

from typing import Dict, Iterable, List, Literal

Permission = Literal[
    "execute_tools",
    "view_reports",
    "manage_users",
    "configure_system",
    "manage_scans",
    "view_dashboards",
]

Role = Literal["admin", "pentester", "auditor", "viewer"]

_WILDCARD = "*"

_ALL_PERMISSIONS: List[Permission] = [
    "execute_tools",
    "view_reports",
    "manage_users",
    "configure_system",
    "manage_scans",
    "view_dashboards",
]

_ROLE_PERMISSIONS: Dict[Role, Iterable[Permission] | str] = {
    "admin": _WILDCARD,
    "pentester": ("execute_tools", "view_reports", "manage_scans"),
    "auditor": ("view_reports", "view_dashboards"),
    "viewer": ("view_dashboards",),
}


def _expand(role: Role) -> List[Permission]:
    permissions = _ROLE_PERMISSIONS[role]
    if permissions == _WILDCARD:
        return list(_ALL_PERMISSIONS)
    return list(permissions)


def has_permission(role: Role, permission: Permission) -> bool:
    """Return True if the supplied role grants ``permission``."""

    return permission in _expand(role)


def list_permissions(role: Role) -> List[Permission]:
    """Return a mutable list of permissions for ``role``."""

    return _expand(role)
