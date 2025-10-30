# Tornado.ai Architecture Overview

The Python edition of Tornado.ai layers an autonomous security-assessment stack
on top of FastAPI and Pydantic. The runtime is split into focused domains that
cooperate through well-typed interfaces so MCP-compatible agents can reason
about every step in the workflow.

## Core Building Blocks

- **Control Center** – `tornado_ai.core.control.center.ControlCenter` keeps the
  feature toggles, RBAC roles, and scan profiles that mirror the original TypeScript
  implementation.
- **RBAC Policy** – `tornado_ai.core.policy.rbac` expands wildcard permissions
  and enforces guardrails for each persona.
- **Smart Caching Manager (SCM)** – `tornado_ai.core.cache.manager.scm` wraps a
  TTL + LRU content-addressed cache to deduplicate tool executions and expose
  hit/miss telemetry.
- **Tool Runtime Policy** – `tornado_ai.tools.runtime.tool_runtime` inspects the
  host OS/distribution and decides whether the Kali GUI container must be used
  for tool execution. On Windows it also auto-starts the container (unless
  `TORNADO_KALI_AUTOSTART=0` is set) and surfaces the decision through command
  telemetry (see the README runtime recap).
- **Tool Registry** – `tornado_ai.tools.registry.tool_registry` centralizes tool
  definitions, dry-run adapters, and MCP schema exports used by ASME and the MCP
  server.
- **Audit Log** – `tornado_ai.core.audit.status` parses the JSONL audit history
  maintained by the command surface.

## Decision Intelligence

- **AIDE – Advanced Intelligent Decision Engine** (`tornado_ai.core.decision.aide`)
  orchestrates the intelligence pipeline and returns a combined tool plan,
  attack graph, and concurrency recommendation.
- **TSA – Tool Selection Assistant** (`tornado_ai.core.decision.tsa`) scores
  tools using CVSS-derived multipliers, asset context, and curated weights.
- **IPO – Intelligent Parameter Optimizer** (`tornado_ai.core.decision.ipo`)
  adds environment-aware guardrails such as rate limiting and severity filters.
- **SACD – Smart Attack Chain Discovery** (`tornado_ai.core.decision.sacd`)
  produces hypothetical kill-chain graphs so LLM agents can explain their plans.
- **ROE & ERR** (`tornado_ai.core.decision.roe` / `tornado_ai.core.decision.err`)
  provide resource tuning guidance and fallback actions when tools fail.
- **AAAM / IBA / SCAA / ICMDA / AEGDEM** surface as seeded synthetic processes
  via `tornado_ai.core.processes.manager` to demonstrate orchestration states.

## Observability & Visualization

- **AVE & SRTD** – `tornado_ai.core.observability.telemetry` tracks counters,
  histograms, and spans; the `/api/telemetry` endpoint exposes these datasets.
- **PVT & IVC** – `tornado_ai.api.controllers.viz` builds dashboard cards and
  vulnerability briefs for consumption by downstream UIs.
- **Structured Logging** – `tornado_ai.core.metrics.logger.JsonFormatter` emits
  JSON logs compatible with log shippers and SIEM pipelines.

## HTTP Layer

Routers in `tornado_ai.api.routes` group endpoints by capability: health,
intelligence, command execution, telemetry, caching, process management,
visualization, checklists, and control surface management. Controllers are thin
wrappers that translate HTTP payloads into calls to the core services.

## Configuration & Environment

Typed configuration lives in `tornado_ai.config`. Environment variables control
server binding, logging verbosity, and can be extended to tune cache TTLs or
future persistence hooks. Local development can rely on `.env` files via
`python-dotenv`.

## Data Flow

1. API requests enter the FastAPI router layer under `/api`.
2. Controllers dispatch to decision engines, the control center, or the tool
   registry.
3. Domain services validate input with `tornado_ai.shared.types` models and
   record telemetry or cache entries as needed.
4. Responses return structured objects (plans, graphs, dashboards, checklists)
   that LLM agents or human operators can consume.

## Future Enhancements

- Wire the MCP transport so agents can call tools over WebSocket.
- Persist process telemetry to a datastore for historical analytics.
- Surface real tool adapters in place of the dry-run simulations.
