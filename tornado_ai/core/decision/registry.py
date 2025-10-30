"""Decision engine registry wiring all decision components together."""
from __future__ import annotations

from .aide import AdvancedIntelligentDecisionEngine
from .ipo import IntelligentParameterOptimizer
from .sacd import SmartAttackChainDiscovery
from .tsa import ToolSelectionAssistant
from ...tools.registry import tool_registry


tsa = ToolSelectionAssistant(tool_registry)
ipo = IntelligentParameterOptimizer()
sacd = SmartAttackChainDiscovery()
aide = AdvancedIntelligentDecisionEngine(tsa=tsa, ipo=ipo, sacd=sacd)


__all__ = ["aide", "tsa", "ipo", "sacd"]
