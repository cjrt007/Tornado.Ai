"""Security tooling catalog data."""
from __future__ import annotations

from ..shared.types import SecurityToolsCollection

security_tools_collection = SecurityToolsCollection.model_validate(
    {
        "version": "1.0",
        "last_updated": "2025-10-30",
        "categories": [
            {
                "name": "Network Reconnaissance & Scanning",
                "tool_count": 25,
                "tools": [
                    {
                        "name": "Nmap",
                        "description": "Advanced port scanning with custom NSE scripts and service detection",
                    },
                    {
                        "name": "Masscan",
                        "description": "High-speed Internet-scale port scanning with banner grabbing",
                    },
                    {
                        "name": "Rustscan",
                        "description": "Ultra-fast port scanner with intelligent rate limiting",
                    },
                    {
                        "name": "AutoRecon",
                        "description": "Comprehensive automated reconnaissance with extensive modules",
                    },
                ],
            },
            {
                "name": "Web Application Security Testing",
                "tool_count": 40,
                "tools": [
                    {
                        "name": "Gobuster",
                        "description": "Directory and file brute forcing with intelligent wordlists",
                    },
                    {
                        "name": "Nuclei",
                        "description": "Template-based vulnerability scanning with rich ecosystem",
                    },
                    {
                        "name": "SQLMap",
                        "description": "Automated SQL injection testing with tamper script support",
                    },
                    {
                        "name": "Burp Suite Extensions",
                        "description": "Curated collection of offensive security automation plugins",
                    },
                ],
            },
            {
                "name": "Cloud & Container Security",
                "tool_count": 20,
                "tools": [
                    {
                        "name": "Prowler",
                        "description": "Multi-cloud security assessment with compliance checks",
                    },
                    {
                        "name": "Trivy",
                        "description": "Container image scanning and infrastructure as code analysis",
                    },
                    {
                        "name": "Kube-Hunter",
                        "description": "Kubernetes penetration testing with active and passive probes",
                    },
                    {
                        "name": "Falco",
                        "description": "Runtime security monitoring for containers and Kubernetes",
                    },
                ],
            },
        ],
        "new_features": [
            {
                "name": "Campaign Orchestrator",
                "description": "Coordinate multi-stage assessments across hybrid infrastructures.",
            },
            {
                "name": "Detonation Lab",
                "description": "Isolated environment for testing payload execution with telemetry.",
            },
        ],
        "statistics": {
            "total_categories": 3,
            "total_tools": 60,
            "last_verified": "2025-10-01",
        },
    }
)
