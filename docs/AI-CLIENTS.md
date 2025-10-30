# AI Client Integration Guide

The Python backend now layers an autonomous assessment engine (AIDE, TSA, IPO,
SACD) on top of the control-center APIs and curated tool catalog. AI clients can
integrate by calling the REST endpoints directly or by importing the Python
modules that power the decision logic.

## Prerequisites

1. **Backend availability** – Start the FastAPI service (`uvicorn
   tornado_ai.server:app`). The default base URL is `http://localhost:8000`.
2. **Network access** – Ensure the AI client (or intermediary service) can reach
   the backend endpoint. Configure HTTPS/forwarding when running remotely.
3. **State management** – Decide whether the AI client will keep local copies of
   the control surface or fetch them per request.

> **Tip:** Because the state is in-memory, consider persisting snapshots of the
> control surface if your workflow requires deterministic rollbacks.

## Direct REST Calls

Every AI client that can issue HTTP requests can orchestrate the full workflow:

- Fetch the control surface:
  ```bash
  curl http://localhost:8000/api/control/
  ```
- Analyze a target with AIDE (returns tool plan + attack graph):
  ```bash
  curl -X POST http://localhost:8000/api/intelligence/analyze-target \
       -H "Content-Type: application/json" \
       -d '{
            "target": {
              "targetId": "app-01",
              "assetKind": "webapp",
              "environment": "staging",
              "cvss": 7.2,
              "criticality": "high"
            },
            "history": []
          }'
  ```
- Execute a tool via ASME with caching:
  ```bash
  curl -X POST http://localhost:8000/api/command/ \
       -H "Content-Type: application/json" \
       -d '{"toolId": "nmap_scan.sim", "params": {"targets": ["10.0.0.5"]}}'
  ```
- Stream observability data for dashboards:
  ```bash
  curl http://localhost:8000/api/telemetry/
  ```
- Retrieve OWASP checklists for validation prompts:
  ```bash
  curl http://localhost:8000/api/checklists/default
  ```

## Python Module Embedding

If your AI automation runs inside Python, import the catalog, decision engine,
and control-center modules directly:

```python
from tornado_ai.core.control.center import ControlCenter
from tornado_ai.core.decision import aide
from tornado_ai.tools.catalog import load_tools_catalog

control = ControlCenter()
current_surface = control.snapshot()
tools = load_tools_catalog()

profile = {
    "targetId": "api-gateway",
    "assetKind": "api",
    "environment": "production",
    "cvss": 8.1,
    "criticality": "high",
}
plan = aide.analyze(profile, history=[])
print(plan.plan.summary)
```

This approach avoids network hops and lets you share in-process state across
agents.

## MCP Transport Status

The legacy TypeScript project exposed a Model Context Protocol (MCP) server. The
Python port now centralises registry metadata in `tornado_ai.tools.registry` and
adds helpers in `tornado_ai.mcp.registry` (`registry_as_json_schemas`) to feed an
external MCP server. Native transports remain on the roadmap—track progress in
[`docs/MCP.md`](MCP.md).

## Troubleshooting Checklist

| Issue | Suggested Fix |
| --- | --- |
| `Connection refused` | Confirm the FastAPI server is running and the port is reachable. |
| `422 Unprocessable Entity` | Validate payloads against the Pydantic models in `tornado_ai.shared.types`. |
| Stale state | Issue a fresh `GET /api/control/` after applying mutations to avoid caching outdated data. |
| HTTPS errors | Place Tornado.ai behind a reverse proxy that terminates TLS. |

Enable debug logging by exporting `TORNADO_LOG_LEVEL=DEBUG` before starting the
server to trace inbound requests and validation errors.
