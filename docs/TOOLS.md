# Tool Registry Reference

The Model Context Protocol registry exposes the following simulated tooling catalog:

- **Network**: nmap_scan.sim, masscan_scan.sim, rustscan_scan.sim, amass_enum.sim,
  autorecon_scan.sim
- **Web Application**: gobuster_scan.sim, ffuf_scan.sim, nuclei_scan.sim, sqlmap_scan.sim,
  wpscan_scan.sim
- **Cloud**: prowler_assess.sim, scout_suite_audit.sim, trivy_scan.sim, kube_hunter_scan.sim,
  kube_bench_check.sim
- **Binary**: ghidra_analyze.sim, radare2_analyze.sim, angr_analyze.sim
- **CTF / Forensics**: volatility_analyze.sim, binwalk_analyze.sim
- **OSINT**: recon_ng.sim, spiderfoot.sim, theharvester.sim

Each tool definition specifies:

- `summary` — high-level description of capability
- `inputSchema` — shape of required parameters
- `requiredPermissions` — RBAC requirements for execution
- `estimatedDuration` — expected runtime in seconds

Developers can add new tools by appending to `src/tools/definitions.ts` and updating the
corresponding handler implementations within the ASME subsystem.
