"""Dry-run adapters for the simulated tool catalog (ASME)."""
from __future__ import annotations

import random
import time
from typing import Any, Callable, Dict

from ..core.observability.telemetry import telemetry_center
from ..shared.types import ToolExecutionResult

AdapterFunction = Callable[[Dict[str, Any]], Dict[str, Any]]


def _generate_ports() -> list[Dict[str, Any]]:
    return [
        {"port": 22, "service": "ssh", "state": "open"},
        {"port": 80, "service": "http", "state": "open"},
        {"port": 443, "service": "https", "state": "open"},
    ]


def _with_latency(metric: str, func: AdapterFunction, params: Dict[str, Any]) -> Dict[str, Any]:
    start = time.perf_counter()
    result = func(params)
    telemetry_center.observe_latency(metric, time.perf_counter() - start)
    return result


def _network_enumerator(params: Dict[str, Any]) -> Dict[str, Any]:
    targets = params.get("targets", [])
    return {
        "mode": params.get("intensity", "medium"),
        "targets": targets,
        "openPorts": _generate_ports(),
    }


def _network_burst(params: Dict[str, Any]) -> Dict[str, Any]:
    rate = params.get("rate", 1000)
    return {"scannedHosts": len(params.get("targets", [])), "rate": rate, "findings": _generate_ports()[:2]}


def _recon_orchestrator(params: Dict[str, Any]) -> Dict[str, Any]:
    return {
        "profiles": params.get("profiles", ["default"]),
        "services": [
            {"host": "10.0.0.5", "service": "http", "confidence": 0.92},
            {"host": "10.0.0.8", "service": "ssh", "confidence": 0.84},
        ],
    }


def _web_dirbust(params: Dict[str, Any]) -> Dict[str, Any]:
    base = params.get("url", "https://example.com")
    return {
        "base": base,
        "paths": [f"{base}/admin", f"{base}/backup.zip"],
    }


def _web_templates(params: Dict[str, Any]) -> Dict[str, Any]:
    return {
        "targets": params.get("targets", []),
        "vulnerabilities": [
            {"id": "CVE-2023-1234", "severity": "high", "description": "Template-based RCE"},
            {"id": "CVE-2022-9876", "severity": "medium", "description": "Exposure of admin endpoint"},
        ],
    }


def _sql_injection(params: Dict[str, Any]) -> Dict[str, Any]:
    return {
        "target": params.get("target", "https://example.com/login"),
        "payloads": ["' OR 1=1 --", "UNION SELECT null"],
        "risk": params.get("risk", "1"),
    }


def _cloud_prowler(params: Dict[str, Any]) -> Dict[str, Any]:
    return {
        "accounts": params.get("accountIds", []),
        "regions": params.get("regions", ["us-east-1"]),
        "findings": [
            {"check": "iam-admin-check", "status": "fail", "severity": "high"},
            {"check": "s3-public-buckets", "status": "warn", "severity": "medium"},
        ],
    }


def _cloud_multiscan(params: Dict[str, Any]) -> Dict[str, Any]:
    providers = params.get("providers", ["aws", "gcp"])
    return {
        "providers": providers,
        "alerts": [
            {"provider": provider, "alert": "Excessive permissions", "severity": "high"}
            for provider in providers
        ],
    }


def _binary_pipeline(params: Dict[str, Any]) -> Dict[str, Any]:
    return {
        "binary": params.get("binaryPath", "sample.bin"),
        "analysisLevel": params.get("analysisLevel", "basic"),
        "functions": [
            {"name": "validate_user", "risk": "medium"},
            {"name": "process_credentials", "risk": "high"},
        ],
    }


def _ctf_helper(params: Dict[str, Any]) -> Dict[str, Any]:
    return {
        "challenge": params.get("challenge", "rop"),
        "architecture": params.get("architecture", "amd64"),
        "exploitPlan": ["leak libc", "ret2csu"],
    }


def _osint_mapper(params: Dict[str, Any]) -> Dict[str, Any]:
    org = params.get("organization", "Example Corp")
    seeds = params.get("sources", ["crt.sh", "hunter.io"])
    return {
        "organization": org,
        "sources": seeds,
        "profiles": [
            {"domain": f"{org.lower().replace(' ', '')}.com", "exposure": "high"},
            {"domain": f"vpn.{org.lower().split()[0]}.net", "exposure": "medium"},
        ],
    }


def _wrap(tool_id: str, adapter: AdapterFunction, params: Dict[str, Any]) -> ToolExecutionResult:
    output = _with_latency(f"adapter.{tool_id}", adapter, params)
    telemetry_center.increment_counter(f"adapter.{tool_id}.runs")
    return ToolExecutionResult(
        toolId=tool_id,
        status="completed",
        output=output,
        cached=False,
        telemetry={"mode": "dry-run", "seed": random.randint(1, 9999)},
    )


_ADAPTERS: Dict[str, AdapterFunction] = {
    "nmap_scan.sim": _network_enumerator,
    "masscan_scan.sim": _network_burst,
    "autorecon_scan.sim": _recon_orchestrator,
    "gobuster_scan.sim": _web_dirbust,
    "nuclei_scan.sim": _web_templates,
    "sqlmap_scan.sim": _sql_injection,
    "prowler_assess.sim": _cloud_prowler,
    "scout_suite_audit.sim": _cloud_multiscan,
    "ghidra_analyze.sim": _binary_pipeline,
    "pwntools_ctf.sim": _ctf_helper,
    "osint_profile_mapper.sim": _osint_mapper,
}


def available_adapters() -> Dict[str, AdapterFunction]:
    return dict(_ADAPTERS)


def run_dry(tool_id: str, params: Dict[str, Any]) -> ToolExecutionResult:
    adapter = _ADAPTERS.get(tool_id)
    if adapter is None:
        raise KeyError(f"No dry-run adapter registered for {tool_id}")
    return _wrap(tool_id, adapter, params)


__all__ = ["run_dry", "available_adapters", "AdapterFunction"]
