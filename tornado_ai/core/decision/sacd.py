"""Smart Attack Chain Discovery (SACD)."""
from __future__ import annotations

from typing import List

from ...shared.types import AttackGraph, AttackPathEdge, AttackPathNode, TargetProfile


class SmartAttackChainDiscovery:
    def build_graph(self, profile: TargetProfile) -> AttackGraph:
        nodes: List[AttackPathNode] = [
            AttackPathNode(id="recon", label="Initial Recon", phase="recon", likelihood=0.9),
            AttackPathNode(id="access", label="Initial Access", phase="exploit", likelihood=0.7),
            AttackPathNode(id="priv", label="Privilege Escalation", phase="exploit", likelihood=0.6),
            AttackPathNode(id="impact", label="Impact", phase="maintain", likelihood=0.5),
        ]
        edges = [
            AttackPathEdge(
                source="recon",
                target="access",
                description="Use reconnaissance findings to launch focused exploitation.",
            ),
            AttackPathEdge(
                source="access",
                target="priv",
                description="Leverage foothold for privilege escalation and lateral movement.",
            ),
            AttackPathEdge(
                source="priv",
                target="impact",
                description="Deploy payloads or extract data once elevated access is obtained.",
            ),
        ]

        if profile.assetKind in {"cloud", "infrastructure"}:
            nodes.append(AttackPathNode(id="persistence", label="Persistence", phase="maintain", likelihood=0.55))
            edges.append(
                AttackPathEdge(
                    source="priv",
                    target="persistence",
                    description="Establish long-term access via IAM or backdoors.",
                )
            )
        return AttackGraph(targetId=profile.targetId, nodes=nodes, edges=edges)


__all__ = ["SmartAttackChainDiscovery"]
