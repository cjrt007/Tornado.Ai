# Tornado.ai (Python Edition)

Tornado.ai is a security operations playground that now ships as a Python-first
FastAPI service. The project bundles opinionated defaults for role based access
control, feature toggle management, simulated scan profiles, and a curated tool
catalog that mirrors the original TypeScript implementation.

## Tech Stack

- **Runtime**: Python 3.11+
- **Web framework**: FastAPI
- **Validation**: Pydantic v2
- **Configuration**: `python-dotenv`
- **Testing**: Pytest

## Getting Started

1. Install dependencies (the project uses a `pyproject.toml`):
   ```bash
   pip install -e .[dev]
   ```
2. Run the automated test suite:
   ```bash
   pytest
   ```
3. Launch the API locally:
   ```bash
   uvicorn tornado_ai.server:app --reload
   ```

By default the service listens on `127.0.0.1:8000` and exposes REST endpoints
under `/api` for health reporting and control-surface management.

### Exposed API Surface

| Method | Path                   | Description                                  |
| ------ | ---------------------- | -------------------------------------------- |
| GET    | `/api/health/`         | Service health metadata and registry summary |
| GET    | `/api/control/`        | Current feature toggles, roles, scan profiles |
| POST   | `/api/control/features` | Apply feature toggle mutations               |
| POST   | `/api/control/roles`   | Apply role control mutations                  |
| POST   | `/api/control/scans`   | Apply scan profile mutations                  |

Refer to [`docs/API.md`](docs/API.md) for payload details and response
structures.

## Repository Layout

```
tornado_ai/
  api/            # FastAPI routers and controllers
  config/         # Environment-driven configuration objects
  core/           # Domain services (audit log, cache, control center, RBAC)
  mcp/            # Offline MCP registry helpers
  shared/         # Pydantic models shared across modules
  tools/          # Tool definitions and catalog datasets
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
