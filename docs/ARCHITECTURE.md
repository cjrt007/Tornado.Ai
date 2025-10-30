# Tornado.ai Architecture Overview

The Python port of Tornado.ai keeps the original domain concepts while swapping
the delivery layer to FastAPI and Pydantic. The codebase is organized around a
clean separation between data models, stateful domain services, and HTTP
adapters.

## Core Building Blocks

- **Control Center** – `tornado_ai.core.control.center.ControlCenter` manages the
  in-memory feature toggles, RBAC roles, and scan profiles. Mutations are
  validated with Pydantic models before they are applied.
- **RBAC Policy** – `tornado_ai.core.policy.rbac` provides helper utilities for
  expanding wildcard permissions and calculating enforcement metadata used by
  the control center.
- **Cache** – `tornado_ai.core.cache` implements a content-addressable cache for
  simulated tool runs and other expensive lookups.
- **Audit Status** – `tornado_ai.core.audit.status` offers lightweight helpers
  for producing timestamps and metadata that feed the health endpoint.
- **Tool Catalog** – `tornado_ai.tools.catalog` and
  `tornado_ai.tools.definitions` capture the curated catalog and simulated MCP
  registry definitions used throughout the application.

## HTTP Layer

- `tornado_ai.api.routes` wires FastAPI routers for health reporting and control
  surface mutations.
- `tornado_ai.api.controllers` contains request handlers that mediate between
  HTTP requests and the domain services.
- `tornado_ai.server` bootstraps the FastAPI application, configures structured
  logging, and registers startup hooks.

## Configuration & Environment

Runtime configuration is supplied via `tornado_ai.config`, which reads from
environment variables (with sensible defaults) and produces typed settings
objects. `python-dotenv` can be used locally to load values from a `.env` file.

## Data Flow

1. Incoming requests enter the FastAPI router layer (`/api`).
2. Controllers delegate to domain services such as the control center or tool
   catalog.
3. Domain services validate incoming payloads with shared Pydantic models and
   apply mutations to the in-memory state.
4. Responses return the updated `ControlSurface` or health metadata to clients.

## Future Enhancements

- Expose the MCP registry over HTTP/WebSocket once the transport adapters are
  reintroduced.
- Persist control-center state to disk or a backing store.
- Rebuild the interactive UI against the new Python API surface.
