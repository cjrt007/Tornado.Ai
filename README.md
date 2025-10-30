# Tornado.ai (Python Edition)

Tornado.ai is a security operations playground that now ships as a Python-first
FastAPI service. The project bundles opinionated defaults for role based access
control, feature toggle management, simulated scan profiles, and a curated tool
catalog that mirrors the original TypeScript implementation. The new decision
intelligence layer lets MCP-compatible LLM agents (Claude, GPT, Copilot, etc.)
perform security assessments through typed tools, caching, progress tracking,
and rich telemetry.

## Tech Stack

- **Runtime**: Python 3.11+
- **API Framework**: FastAPI + Uvicorn
- **Validation**: Pydantic v2 models in `tornado_ai.shared`
- **Caching**: Content-addressed SCM with TTL + LRU eviction
- **Tool registry**: MCP-aware registry with JSON Schema definitions
- **Testing**: Pytest (Python) and Vitest (UI simulations)

## Architecture at a Glance

### Local Python environment

1. Install dependencies (the project uses a `pyproject.toml`):
   ```bash
   pip install -e .[dev]
   ```
3. Run checks:
   ```bash
   pytest
   ```
4. Launch the API:
   ```bash
   uvicorn tornado_ai.server:app --reload
   ```

### Native Kali Linux

When the host distribution is detected as Kali Linux, Tornado.ai executes tools
directly on the host. Install the Python requirements as above. No Docker
container is provisioned for tool execution in this mode.

### Optional: Docker runtime

Build and run the container to keep Python tooling isolated from the host:

```bash
docker build -t tornado-ai .
docker run --rm -p 8000:8000 --env-file .env tornado-ai
```

If you need live code iteration, mount the repository as a volume and override
the startup command:

```bash
docker run --rm -it -p 8000:8000 -v "$(pwd)":/app \
  --env-file .env tornado-ai \
  uvicorn tornado_ai.server:app --host 0.0.0.0 --reload
```

See [`docs/INSTALLATION.md`](docs/INSTALLATION.md) for an advanced guide that
covers Linux, Windows, Docker, prerequisites, and FAQs.

### Exposed API Surface

| Method | Path | Description |
| ------ | ---- | ----------- |
| GET | `/api/health/` | Service health metadata, cache stats, telemetry counters, MCP registry size |
| GET | `/api/control/` | Current feature toggles, roles, scan profiles |
| POST | `/api/control/features` | Apply feature toggle mutations |
| POST | `/api/control/roles` | Apply role control mutations |
| POST | `/api/control/scans` | Apply scan profile mutations |
| POST | `/api/intelligence/analyze-target` | Run AIDE to build an attack graph, tool plan, and concurrency guidance |
| POST | `/api/intelligence/select-tools` | Return an ordered ToolPlan from TSA |
| POST | `/api/intelligence/optimize-parameters` | Use IPO to provide guard-railed parameter suggestions |
| POST | `/api/command/` | Execute a tool via ASME with caching (SCM) and ERR fallbacks |
| GET | `/api/telemetry/` | Structured telemetry counters, histograms, spans (AVE/SRTD) |
| GET | `/api/cache/stats` | SCM cache metrics (hits, misses, evictions) |
| GET | `/api/processes/list` | List synthetic APME task states for AAAM/IBA/SCAA demos |
| GET | `/api/processes/status/{id}` | Inspect a specific synthetic process |
| POST | `/api/processes/terminate/{id}` | Terminate a synthetic process |
| GET | `/api/viz/dashboard` | JSON cards for SRTD dashboards and PVT summaries |
| GET | `/api/viz/vuln-card/{id}` | Retrieve an Intelligent Vulnerability Card (IVC) mock |
| GET | `/api/checklists/default` | Download OWASP Top 10 web & mobile checklist templates |

Refer to [`docs/API.md`](docs/API.md) for payload details, flow diagrams, and
cross-links into the decision engine docs.

### Security Intelligence Stack

- **AIDE – Advanced Intelligent Decision Engine** orchestrates TSA, SACD, IPO,
  ROE, and ERR to drive MCP automation. See [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md#decision-intelligence).
- **TSA – Tool Selection Assistant** scores tools using CVSS, asset context,
  and decision weights from the catalog. Details live in
  [`docs/TOOLS.md`](docs/TOOLS.md#tool-selection-assistant).
- **IPO – Intelligent Parameter Optimizer** applies guardrails based on target
  environment and criticality. Covered in [`docs/API.md`](docs/API.md#intelligent-parameter-optimizer).
- **SACD – Smart Attack Chain Discovery** returns hypothetical graphs to help
  agents reason about exploitation paths. Documented in
  [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md#smart-attack-chain-discovery).
- **AAAM, IBA, SCAA, ICMDA, AEGDEM** drive the simulated process manager (APME)
  and vulnerability visualization flows documented in
  [`docs/AI-CLIENTS.md`](docs/AI-CLIENTS.md) and
  [`docs/CHECKLISTS.md`](docs/CHECKLISTS.md).
- **SCM – Smart Caching Manager** delivers TTL + LRU caching with observability
  metrics. Refer to [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md#smart-caching-manager).
- **AVE/SRTD/PVT/IVC** power the visualization endpoints – see
  [`docs/AI-CLIENTS.md`](docs/AI-CLIENTS.md#visualization-suite).

### Testing checklists

The project now ships with CSV-backed OWASP Top 10 web and mobile templates.
Fetch them via `/api/checklists/default` or explore how to extend the loader in
[`docs/CHECKLISTS.md`](docs/CHECKLISTS.md#csv-templates). Each checklist entry
links to the official OWASP Testing Guide and Cheat Sheet resources.

## Repository Layout

```
tornado_ai/
  api/            # FastAPI routers and controllers
  config/         # Environment-driven configuration objects
  core/           # Domain services (audit log, cache, decision engines, RBAC)
  mcp/            # MCP registry helpers and schema exporters
  shared/         # Pydantic models shared across modules
  tools/          # Tool definitions, adapters, and catalog datasets
```

## Running in Production

Set the following environment variables before starting the server:

- `TORNADO_SERVER_HOST` (default `127.0.0.1`)
- `TORNADO_SERVER_PORT` (default `8000`)
- `TORNADO_SERVER_CORS` (`true`/`false`, default `true`)
- `TORNADO_LOG_LEVEL` (default `INFO`)

Then launch with your preferred ASGI server, for example:

```bash
uvicorn tornado_ai.server:app --host 0.0.0.0 --port 8000
```

## Testing Philosophy

The pytest suite exercises the Python ports of the RBAC policy helpers, the
content-addressed cache, the control center state machine, and the tool
catalog/registry validation logic to ensure functional parity with the former
TypeScript version.

## Project Layout

```
tornado_ai/
  api/            # FastAPI routers and controllers
  auth/           # Authentication helpers and MFA utilities
  checklists/     # Compliance checklists and reporting scaffolding
  config/         # Environment-driven configuration objects
  core/           # Domain services (audit log, cache, control center, RBAC)
  mcp/            # Offline MCP registry helpers
  shared/         # Pydantic models shared across modules
  tools/          # Tool definitions and catalog datasets
  ui/             # Console templates, static assets, and registration helpers
```

Distributed under the MIT License. See `LICENSE` for details.
