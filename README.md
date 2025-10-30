# Tornado.ai (Python Edition)

Tornado.ai is a security-operations playground that now ships as a Python-first
FastAPI service paired with an immersive web console. The platform models
feature toggles, RBAC policies, Nessus-style scan orchestration, and an MCP tool
registry so you can experiment with complex automation flows end to end.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Installation](#installation)
   - [Linux](#linux)
   - [Windows](#windows)
3. [Configuration](#configuration)
4. [Running the Advanced Console](#running-the-advanced-console)
5. [API Overview](#api-overview)
6. [Testing](#testing)
7. [MCP Configuration](#mcp-configuration)
8. [FAQ](#faq)
9. [Project Layout](#project-layout)

---

## Prerequisites

- **Python**: 3.11 or later.
- **pip**: recent version recommended (`python -m pip install --upgrade pip`).
- **Optional** (for production hosting): a process manager such as `systemd` or
  `supervisord`, and an ASGI server such as `uvicorn` or `hypercorn`.
- **Git**: to clone the repository.

If you plan to run the MCP tool registry or export scan reports you will also
need outbound internet access for dependency downloads and (optional)
`sqlite3` for persistent caching.

---

## Installation

The project is distributed as a standard Python package. You can install it in a
virtual environment or directly on the host machine.

### Linux

```bash
# 1. Clone the project
git clone https://github.com/your-org/Tornado.Ai.git
cd Tornado.Ai

# 2. Create and activate a virtual environment
python3 -m venv .venv
source .venv/bin/activate

# 3. Install the package with development extras
pip install --upgrade pip
pip install -e .[dev]

# 4. Run smoke tests to validate the install
pytest
```

Linux notes:

- `libsqlite3` and `build-essential` are recommended when running heavy MCP
  tooling (for example: `sudo apt install build-essential libsqlite3-dev`).
- When deploying under `systemd`, set the `WorkingDirectory` to the project root
  so the FastAPI app can locate the console templates.

### Windows

```powershell
# 1. Clone the project
git clone https://github.com/your-org/Tornado.Ai.git
cd Tornado.Ai

# 2. Create and activate a virtual environment
py -3.11 -m venv .venv
.\.venv\Scripts\activate

# 3. Install dependencies
python -m pip install --upgrade pip
pip install -e .[dev]

# 4. Run tests
pytest
```

Windows notes:

- When launching Uvicorn on Windows use `--host 0.0.0.0 --reload --log-level info`.
- The advanced console depends on static files stored in `tornado_ai/ui/static`.
  Ensure your antivirus does not sandbox the repository so static assets remain
  accessible.
- If you encounter SSL/TLS errors when installing dependencies, run
  `python -m pip install --upgrade certifi`.

For containerised deployments or additional tuning (workers, TLS termination)
see [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md).

---

## Configuration

Runtime settings are exposed via environment variables:

| Variable | Default | Description |
| --- | --- | --- |
| `TORNADO_SERVER_HOST` | `127.0.0.1` | Address the API listens on. |
| `TORNADO_SERVER_PORT` | `8000` | TCP port for the API and console. |
| `TORNADO_SERVER_CORS` | `true` | Toggle CORS support for external dashboards. |
| `TORNADO_LOG_LEVEL` | `INFO` | Logging verbosity passed to Pino-compatible logger. |
| `TORNADO_CACHE_PATH` | (in-memory) | Optional filesystem cache directory. |

Create a `.env` file in the project root to persist overrides during local
development.

---

## Running the Advanced Console

1. Start the FastAPI server:
   ```bash
   uvicorn tornado_ai.server:app --reload --host 0.0.0.0 --port 8000
   ```
2. Visit [http://localhost:8000/console](http://localhost:8000/console) in your
   browser.
3. Use the tabbed interface to:
   - Toggle features, lock capabilities, and annotate restart requirements.
   - Manage roles with granular permission and feature mappings.
   - Model Nessus-style scan profiles with guardrails, approvals, and telemetry.
   - Review live activity logs of every change applied.

All UI interactions call the same REST endpoints exposed by the API, so any
updates immediately propagate to automation clients.

---

## API Overview

The REST surface remains stable for programmatic clients. Key endpoints:

| Method | Path | Description |
| --- | --- | --- |
| `GET` | `/api/health/` | Service health metadata and MCP registry summary. |
| `GET` | `/api/control/` | Snapshot of features, roles, and scan profiles. |
| `POST` | `/api/control/features` | Create or mutate feature toggles. |
| `POST` | `/api/control/roles` | Create or mutate RBAC roles. |
| `POST` | `/api/control/scans` | Create or mutate scan profiles. |

Refer to [`docs/API.md`](docs/API.md) for payload contracts and schema
examples.

---

## Testing

```bash
pytest
```

The suite covers the RBAC engine, cache, control-center state machine, tool
catalog, and MCP registry validation to ensure parity with the historic
TypeScript implementation.

---

## MCP Configuration

The MCP registry ships with representative tool definitions under
`tornado_ai/tools`. To register the service with an MCP-compliant client:

1. Copy `docs/mcp-config.example.yaml` (see [`docs/MCP.md`](docs/MCP.md)) and
   update the target host, API token (if enabled), and tool allowlist.
2. Ensure `mcp.streaming-results` remains enabled in the feature grid—this keeps
   WebSocket streaming active for UI telemetry.
3. Restart the client or re-discover the MCP endpoint after updating the config
   file.

Detailed integration walkthroughs live in [`docs/MCP.md`](docs/MCP.md).

---

## FAQ

**Why Python and FastAPI?**  
The rewritten stack mirrors modern SecOps tooling, making it easier to embed in
Python-first automation workflows and to leverage FastAPI's async capabilities.

**How does the console compare to Nessus or Burp Suite?**  
The console emphasises orchestration rather than engine execution. You can
curate scan profiles, approvals, and guardrails similar to Nessus policies or
Burp engagement dashboards, but execution is simulated through the tool catalog.

**Where are changes stored?**  
State mutates in-memory via the `ControlCenter`. Persist changes by exporting the
`ControlSurface` snapshot (see `tornado_ai/core/control/center.py`) or backing it
with your preferred datastore.

**Can I extend the MCP registry?**  
Yes. Add new tool descriptors in `tornado_ai/tools/definitions.py` and register
supporting schemas in `tornado_ai/shared/types.py`. The registry automatically
validates new entries on startup.

**The console does not load static assets—what now?**  
Ensure FastAPI mounted `/console/static` correctly. Running behind a reverse
proxy? Expose the `/console` path without rewriting, or mount the static assets
under your preferred prefix via `register_ui`.

---

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

For deeper architectural notes review [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md).
