# Tornado.ai Architecture Overview

Tornado.ai follows a hexagonal architecture composed of domain-focused modules that can be
wired together through Fastify adapters and MCP integrations.

## Core Engines

- **AIDE** — orchestrates decision making for tool selection, parameter optimization, and
  attack chain discovery through the TSA, IPO, and SACD submodules.
- **AAAM** — coordinates autonomous security agents (bug bounty, CTF, CVE mapping, exploit
  engineering) via dedicated agent modules.
- **ASME** — standardizes the execution lifecycle for offensive security tooling. Each tool
  definition in `src/tools/definitions.ts` references the required permissions, expected
  inputs, and estimated runtimes.
- **AVE** — powers real-time dashboards, progress tracking, and vulnerability card visual
  components exposed through the `viz/` namespace.
- **APME**, **SCM**, **ROE**, **ERR** — process management, caching, optimization, and
  resilience building blocks.

## Data Flow

1. Requests enter through Fastify routes (`src/api/routes`).
2. Authentication middleware attaches session and MFA context.
3. RBAC policies (`src/core/policy/rbac.ts`) gate access to domain services.
4. Domain services orchestrate tool executions, audits, and reporting.
5. Observability modules capture structured logs and metrics.
6. Responses and events feed the MCP server for downstream agents and the React UI.

## Directory Reference

- `src/core/*` — domain services for audit logging, caching, metrics, policy, process, and
  decision intelligence.
- `src/auth/*` — authentication handlers, MFA utilities, and middleware.
- `src/mcp/*` — Model Context Protocol bindings that expose tools to external agents.
- `src/reports/*` — report generation pipelines for PDF, HTML, and DOCX outputs.
- `src/checklists/*` — checklist import/export, progress tracking, and schema management.
- `src/viz/*` — visualization engines powering dashboards and cards.
- `ui/` — React + Tailwind UI application (scaffold in progress).

## Future Enhancements

- Implement Fastify plugins for authentication, MFA setup, and session management.
- Integrate better-sqlite3 for persistence and provide migration scripts.
- Add comprehensive Vitest suites covering registry validation, cache behavior, auth flows,
  and MCP interactions.
- Build the React UI using Vite, Tailwind CSS, and Zustand for state management.
