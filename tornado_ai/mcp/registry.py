"""MCP registry helpers."""
from __future__ import annotations

from typing import List

from ..tools.definitions import ToolDefinition, tool_definitions


def list_tool_definitions() -> List[ToolDefinition]:
    return list(tool_definitions)


def registry_size() -> int:
    return len(tool_definitions)
