# Tornado.ai API Overview

The FastAPI layer exposes the autonomous security assistant through grouped
routers. Every response is derived from the Pydantic models in
`tornado_ai.shared.types` so LLM agents can reason about the structure without
custom parsing.

## Core Endpoints

| Method | Path | Description |
| ------ | ---- | ----------- |
| GET | `/api/health/` | Service status with registry size, cache stats, telemetry counters, tool category counts |
| GET | `/api/control/` | Retrieve the full control surface (features, roles, scan profiles) |
| POST | `/api/control/features` | Apply feature toggle mutations |
| POST | `/api/control/roles` | Apply role definition mutations |
| POST | `/api/control/scans` | Apply scan profile mutations |

### Intelligence (AIDE / TSA / IPO / SACD)

- **POST `/api/intelligence/analyze-target`** – Body: `AnalyzeTargetPayload`
  containing a `TargetProfile` and optional prior tool history. Response:
  `AnalyzeTargetResponse` with a `ToolPlan`, `AttackGraph`, and recommended
  concurrency setting derived from ROE.
- **POST `/api/intelligence/select-tools`** – Body identical to `analyze-target`.
  Returns only the `ToolPlan` from TSA when an attack graph is not required.
- **POST `/api/intelligence/optimize-parameters`** – Body:
  `OptimizeParametersPayload` with `toolId`, `TargetProfile`, and initial
  parameter map. Response: `ParameterSuggestion` from IPO describing merged
  guardrails and rationale.

### Command Execution (ASME / SCM / ERR)

- **POST `/api/command/`** – Body: `CommandPayload` with `toolId`, optional
  parameters, `useCache`, and `userId`. Response: `CommandResponse` containing a
  `ToolExecutionResult` (with cache metadata, runtime policy details, and adapter
  telemetry) plus ERR fallback actions. Successful calls append an entry to
  `data/audit.log.jsonl`.

### Observability & Caching (AVE / SRTD / SCM)

- **GET `/api/telemetry/`** – Returns counters, histograms (with p95), and the
  50 most recent spans captured by `telemetry_center`.
- **GET `/api/cache/stats`** – Returns the SCM cache size, hit/miss counts,
  evictions, and configured capacity.

### Process & Visualization (APME / AAAM / PVT / IVC)

- **GET `/api/processes/list`** – Lists seeded `ProcessRecord` objects for the
  synthetic AAAM/IBA/SCAA pipelines.
- **GET `/api/processes/status/{id}`** – Fetch an individual process snapshot.
- **POST `/api/processes/terminate/{id}`** – Marks a synthetic process as
  `terminated` and returns a `TerminateResponse` wrapper.
- **GET `/api/viz/dashboard`** – Returns serialized `DashboardCard` entries
  summarizing tool coverage, telemetry counters, and latency metrics.
- **GET `/api/viz/vuln-card/{id}`** – Returns an `VulnerabilityCard` mock useful
  for visualization clients and MCP responses.

### Checklist Delivery (OWASP Top 10)

- **GET `/api/checklists/default`** – Returns the CSV-backed OWASP Top 10 web
  and mobile `ChecklistTemplate` payloads. Each template contains linked
  references to the Testing Guide v5 spreadsheet and Cheat Sheet series.

## Payload Notes

- Mutations still rely on the control-center models defined in
  `tornado_ai.shared.types` (`FeatureToggle`, `RoleControl`, `ScanProfile`).
- Intelligence endpoints consume `TargetProfile`, `PriorToolResult`, and
  `ToolPlan` structures that can be re-used directly in MCP scripts.
- Checklist templates are delivered as JSON to simplify ingestion, but the raw
  CSV files live under `data/checklists/` for offline workflows.

### Runtime policy telemetry

`ToolExecutionResult.telemetry` now includes a `runtime` object mirroring the
policy detected by `tornado_ai.tools.runtime`. A typical payload looks like:

```json
"runtime": {
  "host_os": "windows",
  "distribution": null,
  "requires_container": true,
  "container_image": "tornado-ai-kali:latest",
  "launcher_hint": "docker compose -f docker/kali/docker-compose.yml up -d",
  "notes": [
    "Windows hosts delegate tool execution to the Kali GUI container"
  ]
}
```

See the “Runtime policy recap” section of the [README](../README.md#runtime-policy-recap)
for usage guidance and override flags.

## Error Handling

Validation errors from Pydantic surface as HTTP 422 responses with structured
`detail` arrays. Domain-specific errors (unknown tool IDs, missing processes)
raise `HTTPException` with status 404 from the controllers.

## Versioning

The service currently ships as a single versioned application (no explicit API
version prefix). Backwards-incompatible changes are announced in the changelog
and reflected in the shared type models. Clients should pin against a specific
Git revision or release tag if stability is required.
