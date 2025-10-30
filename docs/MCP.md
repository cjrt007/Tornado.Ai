# Model Context Protocol (MCP) Configuration Guide

The Tornado.ai MCP server exposes every supported security tool, checklist action, and orchestration primitive via the Model Context Protocol so automation platforms can discover capabilities and execute workloads safely. This guide documents configuration surfaces, deployment considerations, and validation workflows. For client-specific connection instructions (Copilot, Roo Code, Cursor, Claude, etc.), see [AI Client Integration](AI-CLIENTS.md).

## Quick Start

1. Ensure the Fastify backend is running with MCP tooling enabled:
   ```bash
   pnpm build
   pnpm mcp
   ```
2. Configure the MCP client with the server endpoint (default `http://localhost:7700`).
3. Authenticate using a service account or API token with the `execute_tools` permission.
4. Use the discovery endpoint to enumerate available tools and associated schemas.

## Server Configuration

| Setting | Location | Description |
| --- | --- | --- |
| `server.host` | `config.yaml` / `.env` | Bind address for the Fastify + MCP server. |
| `server.port` | `config.yaml` / `.env` | Port for REST and MCP endpoints (defaults to `7700`). |
| `auth.jwt_secret` | `.env` | Secret used to sign JWTs for MCP clients. |
| `mcp.streaming` | `config.yaml` | Enables streaming result payloads when set to `true`. |
| `tools.timeout` | `config.yaml` | Execution timeout applied to every MCP tool invocation. |
| `cache.default_ttl` | `config.yaml` | Default TTL for cached MCP tool results. |

To override a configuration value, set the corresponding environment variable (e.g. `MCP_STREAMING=true`) or provide a `config.yaml` file when launching the backend.

## Client Registration

- **API Token** – Generate via admin workflow and provide with the `Authorization: Bearer <token>` header.
- **Role Alignment** – Ensure the service account has the `execute_tools` permission. Additional permissions (e.g. `view_reports`) unlock related MCP extensions.
- **MFA** – Service accounts can be configured with TOTP secrets. Provide a valid OTP in the `X-MCP-OTP` header for high-sensitivity operations.

## Tool Discovery

Invoke the registry introspection endpoint to retrieve MCP tool descriptors:

```bash
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:7700/api/mcp/registry
```

The response includes:

- Tool metadata (`id`, `category`, `summary`)
- `inputSchema`/`outputSchema` definitions (Zod compatible)
- Required permissions and estimated duration hints

## Execution Policies

- **Approvals** – For tools with the `approve` flag, submit an approval event via the `/api/command` endpoint or approve from the UI control center.
- **Streaming** – Enable `mcp.streaming` to receive incremental payloads for long-running scans.
- **Caching** – The Smart Caching Manager hashes `toolId + params`. Use `noCache=true` to bypass.
- **Rate Limits** – Configure reverse proxies (e.g. Nginx) or service meshes for rate limiting; Tornado.ai enforces concurrency guardrails via the APME module.

## Troubleshooting

| Symptom | Resolution |
| --- | --- |
| `401 Unauthorized` | Verify token scopes and ensure the clock skew between client/server is <30s. |
| Missing tools | Run `pnpm mcp` to regenerate registry caches or confirm the tool is enabled via the control center. |
| Stale results | Clear the cache with `DELETE /api/cache` or disable caching using `noCache`. |
| Streaming stalls | Confirm `mcp.streaming` is `true` and the reverse proxy supports chunked responses. |

## Observability

- **Logging** – MCP interactions are logged via Pino at `info` level with correlation IDs.
- **Metrics** – Exposed via `/api/telemetry` counters (`tool_calls_total`, `tool_latency_ms`).
- **Tracing** – Each MCP execution emits a span with the correlation ID shared with UI workflows.

## Change Management

- Validate schema updates with `pnpm test` to ensure registry integrity.
- Document new tools in `docs/TOOLS.md` and update the UI catalogue where applicable.
- Coordinate with the Control Center to align feature toggles (e.g., `mcp.streaming-results`).
