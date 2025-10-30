# Model Context Protocol (MCP) Configuration Guide

Tornado.ai ships with a curated MCP registry that mirrors the historical
TypeScript dataset. While a built-in transport is still on the roadmap, you can
integrate the metadata with third-party MCP hubs or bespoke automation stacks.
This guide walks through configuration, file formats, and verification steps.

## Registry Dataset

Use the helper functions in `tornado_ai.mcp.registry` to inspect the available
metadata:

```python
from tornado_ai.mcp.registry import list_tool_definitions, registry_size

definitions = list_tool_definitions()
print(f"Registry tracks {registry_size()} tool stubs")
```

Each definition mirrors the legacy MCP schema with fields for `id`, `category`,
`summary`, `input_schema`, `required_permissions`, and an estimated duration.

## Configuration Blueprint

1. Copy the starter configuration and tailor it to your environment:

   ```bash
   cp docs/mcp-config.example.yaml ~/.config/tornado-ai/mcp.yaml
   ```

2. Edit the file to reference your FastAPI host and any authentication tokens:

   ```yaml
   # ~/.config/tornado-ai/mcp.yaml
   transport:
     type: http
     endpoint: "https://tornado.example.com/api/control"
     headers:
       Authorization: "Bearer <your-token>"
   tools:
     allow:
       - nuclei_scan.sim
       - sqlmap_scan.sim
       - autorecon_scan.sim
     deny: []
   streaming:
     enabled: true
     endpoint: "wss://tornado.example.com/ws/mcp"
   telemetry:
     notify_roles:
       - admin
       - pentester
   ```

3. Reload or restart your MCP orchestrator so it ingests the updated file. Most
   clients poll the configuration directory on launch.

> **Tip:** Keep `mcp.streaming-results` enabled in the feature toggle UI so the
> websocket endpoints emit real-time updates when you run scans.

## Integrating With External MCP Servers

If you operate a separate MCP server, feed it Tornado.ai's registry entries:

1. Load the definitions using the helper above.
2. Convert each entry into the format required by your MCP server (YAML or
   JSON). The schema fields map one-to-one with the MCP specification.
3. Publish the resulting schema through your transport of choice (HTTP or
   WebSocket).
4. Point your client configuration (see above) at the published transport.

## Validation Checklist

- `pytest tests/test_mcp_registry.py` passes—ensuring the registry payloads
  remain schema compliant.
- `python -m tornado_ai.mcp.registry` (see helper script below) prints the tool
  count and highlights missing dependencies.
- Your MCP hub acknowledges the external configuration file and lists Tornado.ai
  tools in its catalog.

```python
if __name__ == "__main__":
    from tornado_ai.mcp.registry import list_tool_definitions

    for definition in list_tool_definitions():
        print(f"- {definition.id}: {definition.summary}")
```

## Roadmap

- Implement a native MCP HTTP/WebSocket adapter inside the FastAPI service.
- Stream tool execution telemetry once the execution engine is rebuilt.
- Document authentication and rate-limiting strategies alongside the transport.

Track progress in the repository issues. Until then, REST remains the supported
integration surface, supplemented by the configuration guide above.
