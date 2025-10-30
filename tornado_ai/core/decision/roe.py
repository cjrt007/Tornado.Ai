"""Resource Optimization Engine (ROE)."""
from __future__ import annotations

from ...shared.types import TargetProfile


class ResourceOptimizationEngine:
    def recommend_concurrency(self, profile: TargetProfile) -> int:
        base = 2
        if profile.criticality == "high":
            base += 2
        if profile.environment == "production":
            base -= 1
        if profile.assetKind in {"cloud", "infrastructure"}:
            base += 1
        return max(1, base)


roe = ResourceOptimizationEngine()


__all__ = ["ResourceOptimizationEngine", "roe"]
