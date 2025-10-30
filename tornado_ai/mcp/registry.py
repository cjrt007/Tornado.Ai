"""MCP registry helpers."""
from __future__ import annotations

from typing import Dict, List

from ..shared.types import ToolSpec
from ..tools.registry import ToolRegistry, tool_registry


def list_tool_definitions() -> List[ToolSpec]:
    return tool_registry.list_specs()


def registry_size() -> int:
    return len(list_tool_definitions())


def registry_as_json_schemas(registry: ToolRegistry | None = None) -> List[Dict[str, object]]:
    reg = registry or tool_registry
    payload: List[Dict[str, object]] = []
    for spec in reg.list_specs():
        payload.append(
            {
                "name": spec.id,
                "description": spec.summary,
                "input_schema": spec.inputSchema,
                "output_schema": spec.outputSchema or {},
                "category": spec.category,
                "permissions": spec.requiredPermissions,
            }
        )
    return payload


__all__ = ["list_tool_definitions", "registry_size", "registry_as_json_schemas"]
