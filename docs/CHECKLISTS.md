# Checklist Management

The Python port keeps the checklist data models (`ChecklistItem` and
`ChecklistCollection` in `tornado_ai.shared.types`) but does not yet expose API
endpoints for importing or managing checklists. The previous TypeScript
implementation supported CSV import/export and rich status tracking; those flows
are slated for a future milestone once persistence is reintroduced.

## Current Capabilities

- Pydantic models ensure checklist items follow the expected schema (status,
  severity, evidence references, and ownership metadata).
- Domain services can consume these models internally if you embed Tornado.ai as
  a Python library.

## Roadmap

1. Add REST endpoints to manage checklist collections.
2. Persist checklist state to disk or a database backend.
3. Reconnect checklist outcomes to reporting pipelines.
