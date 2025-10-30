# Model Context Protocol (MCP) Configuration Guide

Tornado.ai ships with a curated MCP registry describing the historical tool
catalog. While the Python service focuses on REST APIs today, the registry can
be exported to upstream MCP servers or consumed directly by MCP-aware clients.
This guide walks through the configuration files, Python helpers, and
integration patterns available right now.

## Table of Contents

1. [Capabilities Overview](#1-capabilities-overview)
2. [Preparing Tornado.ai](#2-preparing-tornadoai)
3. [Client Configuration](#3-client-configuration)
4. [Programmatic Access](#4-programmatic-access)
5. [Operational Tips](#5-operational-tips)
6. [Roadmap](#6-roadmap)

## 1. Capabilities Overview

- Tornado.ai exposes REST endpoints under `/api/control/` that surface the
  latest feature toggles, roles, and scan definitions.
- The offline MCP registry (in `tornado_ai.tools.definitions`) mirrors the
  original MCP schema: every entry includes `id`, `category`, `summary`,
  `input_schema`, `required_permissions`, and an estimated duration.
- A native MCP transport is not yet bundled, but the registry is intentionally
  reusable so you can federate it into your own MCP server.

## 2. Preparing Tornado.ai

1. Follow the [installation guide](INSTALLATION.md) to start the FastAPI
   service locally or via Docker.
2. Ensure the service is reachable at `http://localhost:8000/` (or the custom
   host/port you configured).
3. Optionally duplicate and edit
   [`docs/mcp-config.example.yaml`](mcp-config.example.yaml) to match your
   environment; this file is referenced by several MCP clients.

## 3. Client Configuration

Most MCP client libraries accept a YAML or JSON configuration describing the
control-plane endpoint, streaming telemetry, and tool policies. The provided
[`mcp-config.example.yaml`](mcp-config.example.yaml) contains sane defaults:

```yaml
transport:
  type: http
  endpoint: "http://localhost:8000/api/control"
  headers: {}

streaming:
  enabled: false
  endpoint: "ws://localhost:8000/ws/mcp"

telemetry:
  notify_roles:
    - admin
    - pentester

tools:
  allow:
    - nuclei_scan.sim
    - sqlmap_scan.sim
    - autorecon_scan.sim
  deny: []
```

To adapt the configuration:

1. Update `transport.endpoint` to the base URL of your Tornado.ai deployment.
2. Populate `transport.headers` with API keys or session cookies if you front
   the API with an authenticated proxy.
3. Toggle `streaming.enabled` once a WebSocket relay is in place. The provided
   endpoint is a placeholder for future releases.
4. Use the `tools.allow`/`tools.deny` lists to scope which registry entries are
   exposed to the client, emulating Nessus/Burp-style safelists.

## 4. Programmatic Access

Use the helper functions in `tornado_ai.mcp.registry` to inspect the registry
and feed other systems:

```python
from tornado_ai.mcp.registry import (
    list_tool_definitions,
    registry_as_json_schemas,
    registry_size,
)

definitions = list_tool_definitions()
print(f"Registry tracks {registry_size()} tool stubs")

for definition in definitions:
    print(definition.id, definition.category, definition.required_permissions)
```

The returned objects can be serialised directly to JSON/YAML and imported into
external MCP servers or automation frameworks. When building a bridge, map the
`input_schema` field to your server's command payload and align permission
checks with your RBAC model.

## 5. Operational Tips

- **Versioning**: Commit your customised MCP config alongside the rest of your
  infrastructure-as-code to track changes to the allow/deny lists.
- **Secrets**: Avoid storing credentials in plain YAML. Reference environment
  variables or inject headers at runtime through your client libraries.
- **Health checks**: Continue to monitor `/api/health/` even when using an MCP
  bridge—the endpoint exposes the registry size so you can detect drift.
- **Dry runs**: Use the Python helpers to lint registry definitions before
  publishing them to a production MCP server.

## 6. Roadmap

- Implement a native MCP HTTP/WebSocket adapter inside the FastAPI service.
- Stream tool execution telemetry once the execution engine is rebuilt.
- Document authentication and rate-limiting strategies alongside the transport.
- Provide ready-to-run Docker Compose templates for popular MCP client stacks.

Track progress in the repository issues. Until then, REST remains the supported
integration surface, and the registry helpers documented above offer a smooth
upgrade path once native transports land.
