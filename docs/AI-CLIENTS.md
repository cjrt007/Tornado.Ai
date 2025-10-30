# AI Client Integration Guide

Tornado.ai exposes its orchestration surface area through the Model Context Protocol (MCP)
and a REST API. This guide explains how to connect popular AI-assisted development tools to
the platform so you can script reconnaissance, manage feature flags, and supervise scan
plans from within your preferred AI client.

## Prerequisites

1. **Backend availability** – Start the Fastify + MCP server (`pnpm dev` or `docker compose up`).
2. **Authentication** – Create a service account with the `execute_tools` permission (and
   optionally `view_reports`, `manage_users`, or `configure_system`). Generate a JWT token or
   client credential for automated access.
3. **Network access** – Ensure the AI client can reach the backend endpoint (defaults to
   `http://localhost:7700`). Configure HTTPS/forwarding when running remotely.
4. **MCP discovery** – Run `pnpm mcp` to confirm the registry exports the tool descriptors the
   client expects.

> **Security Tip:** Grant the narrowest role necessary for each integration. Rotate tokens
> regularly and enable TOTP-based MFA for sensitive automations.

## VS Code Copilot Chat

GitHub Copilot Chat (VS Code) supports MCP providers in the "Labs" builds. Connect Tornado.ai
as follows:

1. Install the [GitHub Copilot Chat extension](https://marketplace.visualstudio.com/items?itemName=GitHub.copilot-chat)
and enable the **Labs > MCP** feature flag.
2. Open the command palette and run `Copilot: Open MCP Settings`.
3. Add a new provider named `tornado-ai` with:
   ```json
   {
     "name": "tornado-ai",
     "type": "http",
     "url": "http://localhost:7700",
     "headers": {
       "Authorization": "Bearer ${TORNADO_AI_TOKEN}",
       "X-MCP-OTP": "${TOTP_CODE?}"
     }
   }
   ```
4. Reload VS Code. Copilot Chat now lists Tornado.ai tools—e.g., `control.toggleFeature` or
   `tools.nmap_scan.sim`—inside the **Resources** pane.
5. Trigger tool executions via `/mcp run` or by referencing the tool name in a chat prompt.

## Roo Code

[Roo Code](https://github.com/roocode/roocode) can pair with external MCP servers to enhance
its automation routines.

1. Update `~/.roo/config.json` with a Tornado.ai provider entry:
   ```json
   {
     "providers": [
       {
         "id": "tornado-ai",
         "type": "mcp-http",
         "endpoint": "http://localhost:7700",
         "headers": {
           "Authorization": "Bearer ${TORNADO_AI_TOKEN}"
         },
         "capabilities": ["tool_execution", "control_center"]
       }
     ]
   }
   ```
2. Restart Roo Code. Use `/use tornado-ai` in the command palette to activate the integration.
3. Execute catalog entries (e.g., `tornado-ai.tools.sqlmap_scan.sim`) or update control-center
   settings (`tornado-ai.control.updateRolePolicy`).

## Cursor

[Cursor](https://cursor.sh/) exposes an experimental MCP bridge under the **Integrations**
menu.

1. Navigate to **Settings → Integrations → Model Context Protocol**.
2. Click **Add Provider** and supply:
   - **Name:** `Tornado AI`
   - **Endpoint:** `http://localhost:7700`
   - **API Key Header:** `Authorization`
   - **API Key Value:** `Bearer ${TORNADO_AI_TOKEN}`
3. Enable the provider for the workspaces that require automated scanning or feature toggles.
4. When drafting commands, prefix with `@mcp tornado-ai` to list and execute tools.

## Claude Desktop

Anthropic's Claude Desktop builds include MCP connectors via the `claude_desktop.json`
configuration file.

1. Locate the configuration file:
   - **macOS:** `~/Library/Application Support/Claude/claude_desktop.json`
   - **Windows:** `%APPDATA%/Claude/claude_desktop.json`
2. Add a provider block inside the `mcpProviders` array:
   ```json
   {
     "id": "tornado-ai",
     "transport": "http",
     "endpoint": "http://localhost:7700",
     "headers": {
       "Authorization": "Bearer ${TORNADO_AI_TOKEN}",
       "X-MCP-OTP": "${TOTP_CODE?}"
     }
   }
   ```
3. Restart Claude Desktop. Within a conversation, type `/tools` to confirm the Tornado.ai
   catalog is available.
4. Use natural language prompts like “Run the `nuclei_scan` template set against target X with
   high severity only” to delegate to Tornado.ai tools.

## Any MCP-Compatible Agent

For agents that support the MCP spec over HTTP or WebSocket, follow these baseline steps:

1. Provide the endpoint `http://localhost:7700` (or your deployed URL) and attach an
   `Authorization: Bearer <token>` header.
2. Perform discovery using `GET /api/mcp/registry` if dynamic schema fetching is required.
3. Invoke tool executions by POSTing to `/api/command` with the `toolId`, `params`, and
   optional `approve` flag.
4. Leverage the Control Center API (`/api/control/*`) to adjust feature flags, RBAC policies,
   and scan profiles before triggering runs.

Refer to `docs/MCP.md` for configuration surfaces and execution policies that apply to all
clients.

## 5ire Agent (v0.14.0)

The 5ire agent's latest release (v0.14.0) does not yet implement the MCP handshake required by
Tornado.ai. Attempts to register the provider will fail with a `501 Not Implemented` response.

- Monitor the 5ire release notes for MCP compatibility updates.
- When support lands, supply the same HTTP endpoint and headers described above.
- Until then, use the REST API directly or integrate through the Control Center UI.

## Troubleshooting Checklist

| Issue | Suggested Fix |
| --- | --- |
| `401 Unauthorized` | Verify the token scope matches the requested tool and that clocks are synchronized for MFA. |
| `404 Tool not found` | Ensure the tool is enabled via the Control Center and that the MCP registry has been refreshed (`pnpm mcp`). |
| `Client timeout` | Increase the client's request timeout and confirm `tools.timeout` in config allows long-running scans. |
| `TLS/HTTPS errors` | Place Tornado.ai behind a reverse proxy (Nginx, Caddy) terminating TLS and update client endpoints accordingly. |
| `Schema mismatch` | Rebuild the backend (`pnpm build`) so the MCP registry reflects the current Zod schema definitions. |

For deeper diagnostics, inspect `logs/mcp/*.log` (if configured) or enable debug logging via
`LOG_LEVEL=debug` before launching the server.
