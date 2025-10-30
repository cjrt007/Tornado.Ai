"""Curated list of simulated tool definitions."""
from __future__ import annotations

from typing import List

from ..shared.types import ToolSpec

ToolDefinition = ToolSpec


def _spec(**kwargs) -> ToolDefinition:
    return ToolSpec.model_validate(kwargs)


tool_definitions: List[ToolDefinition] = [
    _spec(
        id="nmap_scan.sim",
        category="network",
        summary="Simulated Nmap scan that enumerates open ports on targets.",
        inputSchema={
            "targets": "string[]",
            "intensity": "low|med|high",
            "ports": "string?",
            "scripts": "string[]?",
        },
        requiredPermissions=["execute_tools"],
        estimatedDuration=120,
    ),
    _spec(
        id="masscan_scan.sim",
        category="network",
        summary="High-speed TCP port scanner.",
        inputSchema={
            "targets": "string[]",
            "ports": "string",
            "rate": "number",
        },
        requiredPermissions=["execute_tools"],
        estimatedDuration=90,
    ),
    _spec(
        id="rustscan_scan.sim",
        category="network",
        summary="Hybrid port scanner combining Nmap and RustScan.",
        inputSchema={},
        requiredPermissions=["execute_tools"],
        estimatedDuration=75,
    ),
    _spec(
        id="amass_enum.sim",
        category="network",
        summary="Enumerate subdomains using OWASP Amass.",
        inputSchema={},
        requiredPermissions=["execute_tools"],
        estimatedDuration=180,
    ),
    _spec(
        id="autorecon_scan.sim",
        category="network",
        summary="Automated network reconnaissance workflow.",
        inputSchema={},
        requiredPermissions=["execute_tools"],
        estimatedDuration=240,
    ),
    _spec(
        id="gobuster_scan.sim",
        category="webapp",
        summary="Directory brute-forcing for web applications.",
        inputSchema={
            "url": "string",
            "wordlist": "string",
            "extensions": "string[]?",
            "threads": "number?",
        },
        requiredPermissions=["execute_tools"],
        estimatedDuration=60,
    ),
    _spec(
        id="ffuf_scan.sim",
        category="webapp",
        summary="Content discovery using FFUF.",
        inputSchema={},
        requiredPermissions=["execute_tools"],
        estimatedDuration=50,
    ),
    _spec(
        id="nuclei_scan.sim",
        category="webapp",
        summary="Template-based vulnerability scanning.",
        inputSchema={
            "targets": "string[]",
            "templates": "string[]?",
            "severity": "string[]?",
        },
        requiredPermissions=["execute_tools"],
        estimatedDuration=180,
    ),
    _spec(
        id="sqlmap_scan.sim",
        category="webapp",
        summary="SQL injection testing workflow.",
        inputSchema={},
        requiredPermissions=["execute_tools"],
        estimatedDuration=200,
    ),
    _spec(
        id="wpscan_scan.sim",
        category="webapp",
        summary="WordPress security assessment.",
        inputSchema={},
        requiredPermissions=["execute_tools"],
        estimatedDuration=120,
    ),
    _spec(
        id="prowler_assess.sim",
        category="cloud",
        summary="AWS security best-practice assessment.",
        inputSchema={},
        requiredPermissions=["execute_tools"],
        estimatedDuration=300,
    ),
    _spec(
        id="scout_suite_audit.sim",
        category="cloud",
        summary="Multi-cloud security auditing.",
        inputSchema={},
        requiredPermissions=["execute_tools"],
        estimatedDuration=320,
    ),
    _spec(
        id="trivy_scan.sim",
        category="cloud",
        summary="Container and artifact vulnerability scanning.",
        inputSchema={},
        requiredPermissions=["execute_tools"],
        estimatedDuration=110,
    ),
    _spec(
        id="kube_hunter_scan.sim",
        category="cloud",
        summary="Kubernetes cluster penetration testing.",
        inputSchema={},
        requiredPermissions=["execute_tools"],
        estimatedDuration=260,
    ),
    _spec(
        id="kube_bench_check.sim",
        category="cloud",
        summary="Kubernetes CIS benchmark checks.",
        inputSchema={},
        requiredPermissions=["execute_tools"],
        estimatedDuration=220,
    ),
    _spec(
        id="ghidra_analyze.sim",
        category="binary",
        summary="Headless analysis pipeline powered by Ghidra.",
        inputSchema={},
        requiredPermissions=["execute_tools"],
        estimatedDuration=360,
    ),
]
