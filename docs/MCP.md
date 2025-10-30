# Model Context Protocol (MCP) Configuration Guide

The current Python release of Tornado.ai does **not** expose an MCP transport.
However, the project retains the curated registry metadata under
`tornado_ai.tools.definitions` so that future adapters—or external automation
layers—can enumerate the same tool definitions.

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

## Integrating With External MCP Servers

If you operate a separate MCP server, you can feed it Tornado.ai's registry
entries:

1. Load the definitions using the helper above.
2. Convert each entry into the format required by your MCP server.
3. Publish the resulting schema through your transport of choice (HTTP or
   WebSocket).

## Roadmap

- Implement a native MCP HTTP adapter inside the FastAPI service.
- Stream tool execution telemetry once the execution engine is rebuilt.
- Document authentication and rate-limiting strategies alongside the transport.

Track progress in the repository issues. Until then, REST remains the supported
integration surface.
