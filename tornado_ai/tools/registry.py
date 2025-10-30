"""Tool registry utilities for ASME and MCP integration."""
from __future__ import annotations

from dataclasses import dataclass
from typing import Dict, Iterable, List

from ..shared.types import ToolSpec
from .definitions import ToolDefinition, tool_definitions


@dataclass
class ToolSummary:
    id: str
    category: str
    summary: str
    adapter: str


class ToolRegistry:
    def __init__(self, definitions: Iterable[ToolDefinition]):
        self._definitions = {definition.spec.id: definition for definition in definitions}

    def list_definitions(self) -> List[ToolDefinition]:
        return list(self._definitions.values())

    def list_specs(self) -> List[ToolSpec]:
        return [definition.spec for definition in self._definitions.values()]

    def get_definition(self, tool_id: str) -> ToolDefinition:
        if tool_id not in self._definitions:
            raise KeyError(f"Unknown tool: {tool_id}")
        return self._definitions[tool_id]

    def summary(self) -> List[ToolSummary]:
        return [
            ToolSummary(
                id=definition.spec.id,
                category=definition.spec.category,
                summary=definition.spec.summary,
                adapter=definition.adapter,
            )
            for definition in self._definitions.values()
        ]

    def categories(self) -> Dict[str, int]:
        counts: Dict[str, int] = {}
        for definition in self._definitions.values():
            counts.setdefault(definition.spec.category, 0)
            counts[definition.spec.category] += 1
        return counts


tool_registry = ToolRegistry(tool_definitions)


__all__ = ["tool_registry", "ToolRegistry", "ToolSummary"]
