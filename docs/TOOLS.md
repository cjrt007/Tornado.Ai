# Tool Registry Reference

Tornado.ai maintains two complementary views of its security tooling landscape:

1. **Simulated MCP registry** – the executable subset exposed by the Model Context Protocol
   server and described in [`src/tools/definitions.ts`](../src/tools/definitions.ts).
2. **Curated capability catalog** – a broader research index that tracks 180+ offensive and
   defensive utilities for roadmap planning. The structured dataset lives in
   [`src/tools/catalog.ts`](../src/tools/catalog.ts) and is validated by
   `SecurityToolsCollectionSchema` within [`src/shared/types.ts`](../src/shared/types.ts).

Both layers feed the AIDE and ASME engines: the MCP registry defines what is runnable today,
while the curated catalog highlights coverage gaps and prioritizes future integrations.

## MCP Tooling Surface

The MCP registry currently exposes the following simulated tools:

- **Network**: `nmap_scan.sim`, `masscan_scan.sim`, `rustscan_scan.sim`, `amass_enum.sim`,
  `autorecon_scan.sim`
- **Web Application**: `gobuster_scan.sim`, `ffuf_scan.sim`, `nuclei_scan.sim`,
  `sqlmap_scan.sim`, `wpscan_scan.sim`
- **Cloud**: `prowler_assess.sim`, `scout_suite_audit.sim`, `trivy_scan.sim`,
  `kube_hunter_scan.sim`, `kube_bench_check.sim`
- **Binary**: `ghidra_analyze.sim`, `radare2_analyze.sim`, `angr_analyze.sim`
- **CTF / Forensics**: `volatility_analyze.sim`, `binwalk_analyze.sim`
- **OSINT**: `recon_ng.sim`, `spiderfoot.sim`, `theharvester.sim`

Each MCP definition includes the following metadata:

- `summary` — high-level description of capability
- `inputSchema` — shape of required parameters
- `requiredPermissions` — RBAC requirements for execution
- `estimatedDuration` — expected runtime in seconds

Extend the runnable inventory by appending to `src/tools/definitions.ts` and wiring the
corresponding handlers inside the ASME subsystem.

## Curated Security Tools Catalog (v1.0)

The research catalog is versioned and timestamped to simplify alignment with external threat
intelligence efforts.

- **Version:** 1.0
- **Last updated:** 2025-10-30
- **Tracked categories:** 9 (enforced through schema validation)
- **Reported total tools:** 188 unique entries across all categories
- **New features:** Streamlined installation process, Docker container support

| Category | Tools Highlighted |
| --- | --- |
| Network Reconnaissance & Scanning | Nmap, Rustscan, Masscan, AutoRecon, Amass, Subfinder, Fierce, DNSEnum, TheHarvester, ARP-Scan, NBTScan, RPCClient, Enum4linux, Enum4linux-ng, SMBMap, Responder, NetExec |
| Web Application Security Testing | Gobuster, Dirsearch, Feroxbuster, FFuf, Dirb, HTTPx, Katana, Hakrawler, Gau, Waybackurls, Nuclei, Nikto, SQLMap, WPScan, Arjun, ParamSpider, X8, Jaeles, Dalfox, Wafw00f, TestSSL, SSLScan, SSLyze, Anew, QSReplace, Uro, Whatweb, JWT-Tool, GraphQL-Voyager, Burp Suite Extensions, ZAP Proxy, Wfuzz, Commix, NoSQLMap, Tplmap |
| Advanced Browser Agent | Headless Chrome Automation, Screenshot Capture, DOM Analysis, Network Traffic Monitoring, Security Header Analysis, Form Detection & Analysis, JavaScript Execution, Proxy Integration, Multi-page Crawling, Performance Metrics |
| Authentication & Password Security | Hydra, John the Ripper, Hashcat, Medusa, Patator, NetExec, SMBMap, Evil-WinRM, Hash-Identifier, HashID, CrackStation, Ophcrack |
| Binary Analysis & Reverse Engineering | GDB, GDB-PEDA, GDB-GEF, Radare2, Ghidra, IDA Free, Binary Ninja, Binwalk, ROPgadget, Ropper, One-Gadget, Checksec, Strings, Objdump, Readelf, XXD, Hexdump, Pwntools, Angr, Libc-Database, Pwninit, Volatility, MSFVenom, UPX |
| Cloud & Container Security | Prowler, Scout Suite, CloudMapper, Pacu, Trivy, Clair, Kube-Hunter, Kube-Bench, Docker Bench Security, Falco, Checkov, Terrascan, CloudSploit, AWS CLI, Azure CLI, GCloud, Kubectl, Helm, Istio, OPA |
| CTF & Forensics Tools | Volatility, Volatility3, Foremost, PhotoRec, TestDisk, Steghide, Stegsolve, Zsteg, Outguess, ExifTool, Binwalk, Scalpel, Bulk Extractor, Autopsy, Sleuth Kit, John the Ripper, Hashcat, Hash-Identifier, CyberChef, Cipher-Identifier |
| Cryptography & Hash Analysis | Frequency-Analysis, RSATool, FactorDB, John the Ripper, Hashcat, CyberChef |
| Bug Bounty & OSINT Arsenal | Amass, Subfinder, Hakrawler, HTTPx, ParamSpider, Aquatone, Subjack, DNSEnum, Fierce, TheHarvester, Sherlock, Social-Analyzer, Recon-ng, Maltego, SpiderFoot, Shodan, Censys, Have I Been Pwned, Pipl, TruffleHog |

> **Note:** Some categories contain representative subsets of the total tool count to keep the
> documentation digestible. The canonical dataset resides in `src/tools/catalog.ts`, and the
> associated Vitest coverage (`tests/tools-catalog.test.ts`) ensures structural integrity,
> versioning, and alignment with reported statistics.

When expanding the curated catalog, update `src/tools/catalog.ts`, adjust the summary table
above, and regenerate any downstream intelligence dashboards that consume the schema.
