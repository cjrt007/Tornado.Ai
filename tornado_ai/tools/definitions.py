"""Curated list of simulated tool definitions with dry-run adapters."""
from __future__ import annotations

from dataclasses import dataclass
from typing import Dict, Iterable, List

from ..shared.types import ToolSpec


@dataclass(frozen=True)
class ToolDefinition:
    """A single simulated tool wired into the ASME engine."""

    spec: ToolSpec
    adapter: str
    decision_weight: float = 1.0
    cvss_bias: float = 0.0


def _spec(**kwargs) -> ToolSpec:
    return ToolSpec.model_validate(kwargs)


_tool_matrix: Iterable[ToolDefinition] = [
    ToolDefinition(
        spec=_spec(
            id="nmap_scan.sim",
            category="network",
            summary="Simulated Nmap scan that enumerates open ports on targets.",
            inputSchema={
                "targets": "string[]",
                "intensity": "low|medium|high",
                "ports": "string?",
                "scripts": "string[]?",
            },
            outputSchema={"openPorts": "Port[]"},
            requiredPermissions=["execute_tools"],
            estimatedDuration=120,
        ),
        adapter="network_enumerator",
        decision_weight=1.0,
        cvss_bias=0.2,
    ),
    ToolDefinition(
        spec=_spec(
            id="masscan_scan.sim",
            category="network",
            summary="High-speed TCP port scanner for large network ranges.",
            inputSchema={
                "targets": "string[]",
                "ports": "string",
                "rate": "number",
            },
            outputSchema={"findings": "MasscanFinding[]"},
            requiredPermissions=["execute_tools"],
            estimatedDuration=90,
        ),
        adapter="network_burst_enumerator",
        decision_weight=0.9,
        cvss_bias=0.1,
    ),
    ToolDefinition(
        spec=_spec(
            id="autorecon_scan.sim",
            category="network",
            summary="Automated network reconnaissance workflow chaining multiple scanners.",
            inputSchema={
                "targets": "string[]",
                "profiles": "string[]?",
            },
            outputSchema={"services": "ServiceFinding[]"},
            requiredPermissions=["execute_tools"],
            estimatedDuration=240,
        ),
        adapter="recon_orchestrator",
        decision_weight=1.1,
        cvss_bias=0.3,
    ),
    ToolDefinition(
        spec=_spec(
            id="gobuster_scan.sim",
            category="webapp",
            summary="Directory brute-forcing for web applications.",
            inputSchema={
                "url": "string",
                "wordlist": "string",
                "extensions": "string[]?",
                "threads": "number?",
            },
            outputSchema={"paths": "string[]"},
            requiredPermissions=["execute_tools"],
            estimatedDuration=60,
        ),
        adapter="web_directory_enumerator",
        decision_weight=1.0,
        cvss_bias=0.25,
    ),
    ToolDefinition(
        spec=_spec(
            id="nuclei_scan.sim",
            category="webapp",
            summary="Template-based vulnerability scanning for web applications.",
            inputSchema={
                "targets": "string[]",
                "templates": "string[]?",
                "severity": "string[]?",
            },
            outputSchema={"vulnerabilities": "Finding[]"},
            requiredPermissions=["execute_tools"],
            estimatedDuration=180,
        ),
        adapter="web_template_scanner",
        decision_weight=1.2,
        cvss_bias=0.35,
    ),
    ToolDefinition(
        spec=_spec(
            id="sqlmap_scan.sim",
            category="webapp",
            summary="SQL injection testing workflow with tamper scripts.",
            inputSchema={
                "target": "string",
                "risk": "0|1|2|3",
                "level": "1|2|3|4|5",
            },
            outputSchema={"injectionVectors": "InjectionFinding[]"},
            requiredPermissions=["execute_tools"],
            estimatedDuration=200,
        ),
        adapter="sql_injection_assessor",
        decision_weight=1.15,
        cvss_bias=0.4,
    ),
    ToolDefinition(
        spec=_spec(
            id="prowler_assess.sim",
            category="cloud",
            summary="AWS security best-practice assessment via Prowler.",
            inputSchema={"accountIds": "string[]", "regions": "string[]?"},
            outputSchema={"findings": "CloudFinding[]"},
            requiredPermissions=["execute_tools"],
            estimatedDuration=300,
        ),
        adapter="cloud_misconfig_auditor",
        decision_weight=1.1,
        cvss_bias=0.2,
    ),
    ToolDefinition(
        spec=_spec(
            id="scout_suite_audit.sim",
            category="cloud",
            summary="Multi-cloud security auditing using Scout Suite.",
            inputSchema={"providers": "string[]"},
            outputSchema={"alerts": "CloudAlert[]"},
            requiredPermissions=["execute_tools"],
            estimatedDuration=320,
        ),
        adapter="cloud_multiscan",
        decision_weight=1.05,
        cvss_bias=0.15,
    ),
    ToolDefinition(
        spec=_spec(
            id="ghidra_analyze.sim",
            category="binary",
            summary="Headless analysis pipeline powered by Ghidra.",
            inputSchema={
                "binaryPath": "string",
                "analysisLevel": "basic|deep",
            },
            outputSchema={"functions": "FunctionFinding[]"},
            requiredPermissions=["execute_tools"],
            estimatedDuration=360,
        ),
        adapter="binary_ghidra_pipeline",
        decision_weight=0.95,
        cvss_bias=0.3,
    ),
    ToolDefinition(
        spec=_spec(
            id="pwntools_ctf.sim",
            category="ctf",
            summary="Guided exploitation workflow leveraging Pwntools snippets.",
            inputSchema={"challenge": "string", "architecture": "string"},
            outputSchema={"exploitPlan": "string"},
            requiredPermissions=["execute_tools"],
            estimatedDuration=150,
        ),
        adapter="ctf_exploit_helper",
        decision_weight=1.0,
        cvss_bias=0.05,
    ),
    ToolDefinition(
        spec=_spec(
            id="osint_profile_mapper.sim",
            category="osint",
            summary="Aggregates OSINT sources to map external attack surface.",
            inputSchema={"organization": "string", "sources": "string[]?"},
            outputSchema={"profiles": "OsintProfile[]"},
            requiredPermissions=["execute_tools"],
            estimatedDuration=210,
        ),
        adapter="osint_surface_mapper",
        decision_weight=0.9,
        cvss_bias=0.1,
    ),
]


tool_definitions: List[ToolDefinition] = list(_tool_matrix)


def tool_index() -> Dict[str, ToolDefinition]:
    return {definition.spec.id: definition for definition in tool_definitions}


__all__ = ["ToolDefinition", "tool_definitions", "tool_index"]
