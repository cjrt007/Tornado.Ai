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

## Configuring Anthropic Claude (Desktop) via MCP

Claude Desktop supports the Model Context Protocol, which lets the assistant
call external tools that comply with the MCP schema. Tornado.ai ships the full
tool registry and telemetry surfaces required for Claude to orchestrate
assessment workflows. The following steps wire the two systems together.

### 1. Prepare the Tornado.ai backend

1. Follow the [installation guide](INSTALLATION.md) to install dependencies.
2. Start the FastAPI service locally (or expose it behind an HTTPS reverse
   proxy):
   ```bash
   uvicorn tornado_ai.server:app --host 0.0.0.0 --port 8000
   ```
3. Ensure `TORNADO_KALI_MODE` reflects your host runtime (`auto` by default).
   Claude surfaces the runtime decision inside tool responses so the agent knows
   whether commands ran on native Kali or inside the Docker workspace.

### 2. Export the registry for inspection (optional but recommended)

Claude does not require pre-generated schemas, but exporting them helps audit
the catalogue and troubleshoot validation issues. Use the helper below to write
the JSON schemas to a well-known location:

```bash
python - <<'PY'
from pathlib import Path
import json
from tornado_ai.mcp.registry import registry_as_json_schemas

output = Path.home() / ".config" / "tornado-ai" / "claude-registry.json"
output.parent.mkdir(parents=True, exist_ok=True)
output.write_text(json.dumps(registry_as_json_schemas(), indent=2))
print(f"Exported {output}")
PY
```

### 3. Install the Claude MCP bridge CLI

Anthropic publishes a lightweight bridge that turns HTTP endpoints into MCP
servers. Install it once per workstation:

```bash
npm install -g @modelcontextprotocol/cli
```

Create a client configuration describing the Tornado.ai REST surfaces. The
example below mirrors [`docs/mcp-config.example.yaml`](mcp-config.example.yaml):

```yaml
# claude-tornado.yaml
transport:
  type: http
  endpoint: "http://localhost:8000/api/control"
  headers: {}

intelligence:
  analyze_endpoint: "http://localhost:8000/api/intelligence/analyze-target"
  select_endpoint: "http://localhost:8000/api/intelligence/select-tools"
  optimize_endpoint: "http://localhost:8000/api/intelligence/optimize-parameters"

command:
  execute_endpoint: "http://localhost:8000/api/command"

telemetry:
  metrics_endpoint: "http://localhost:8000/api/telemetry"
  cache_endpoint: "http://localhost:8000/api/cache/stats"

checklists:
  default_endpoint: "http://localhost:8000/api/checklists/default"
```

Launch the bridge in a terminal and keep it running while Claude is open:

```bash
mcp http-bridge --config claude-tornado.yaml
```

The command forwards MCP tool calls from Claude to the REST API. Inspect the
logs to confirm Claude connects and enumerates the registry (the CLI prints the
tool IDs that become available to the agent).

### 4. Register the MCP server with Claude Desktop

Claude Desktop reads its MCP configuration from
`claude_desktop_config.json`. Update (or create) the file and add an entry for
the Tornado.ai bridge:

```json
{
  "mcpServers": {
    "tornado-ai": {
      "command": "mcp",
      "args": ["http-bridge", "--config", "/absolute/path/to/claude-tornado.yaml"],
      "env": {
        "TORNADO_AI_BASE_URL": "http://localhost:8000"
      }
    }
  }
}
```

Claude stores the file in these locations:

- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
- **Linux**: `~/.config/Claude/claude_desktop_config.json`

Restart Claude Desktop after saving the configuration. Open **Settings →
Developer → Manage Tools** to confirm the `tornado-ai` MCP server appears and
its tools are listed.

### 5. Validate the integration

1. Start a new Claude chat and type "List the Tornado tool catalogue".
2. Claude should call the MCP `list_tools` command and display the categories
   returned by Tornado.ai.
3. Trigger an intelligence workflow by requesting "Plan a webapp assessment for
   inventory-service". Claude will chain the analyze/select/optimize endpoints
   and present the SACD graph summary alongside the TSA plan.
4. Execute a dry-run tool (for example, `nmap_scan.sim`) and review the runtime
   field to verify the Kali detection logic is honoured.

### Troubleshooting tips

- **Authentication** – If the REST API sits behind an authenticated proxy, add
  the required headers to `transport.headers` in `claude-tornado.yaml`.
- **CORS errors in logs** – The bridge issues server-side requests, so browser
  CORS policies do not apply. If you still see CORS failures, double-check that
  the FastAPI service trusts the CLI host.
- **Timeouts** – Increase `MCP_HTTP_TIMEOUT` (environment variable consumed by
  the CLI) when executing long-running scans. Tornado.ai dry-run adapters return
  immediately, but real tool wrappers may take longer.
- **Runtime policy mismatch** – When running on Windows with the Kali container,
  confirm the Docker profile is up before executing tools. The `/api/health/`
  endpoint exposes `toolCategories` and `cacheStats` which help detect a stale
  execution workspace.

## Troubleshooting Checklist

| Issue | Suggested Fix |
| --- | --- |
| `Connection refused` | Confirm the FastAPI server is running and the port is reachable. |
| `422 Unprocessable Entity` | Validate payloads against the Pydantic models in `tornado_ai.shared.types`. |
| Stale state | Issue a fresh `GET /api/control/` after applying mutations to avoid caching outdated data. |
| HTTPS errors | Place Tornado.ai behind a reverse proxy that terminates TLS. |

Enable debug logging by exporting `TORNADO_LOG_LEVEL=DEBUG` before starting the
server to trace inbound requests and validation errors.
