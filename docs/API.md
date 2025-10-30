# Tornado.ai API Overview

The Python FastAPI service exposes a compact REST surface that mirrors the
control-center capabilities from the legacy TypeScript implementation. All
responses are JSON payloads generated from Pydantic models in
`tornado_ai.shared.types`.

| Method | Path                     | Description                                              |
| ------ | ------------------------ | -------------------------------------------------------- |
| GET    | `/api/health/`           | Report service status, control snapshot metadata, and tool counts |
| GET    | `/api/control/`          | Retrieve the full control surface (features, roles, scan profiles) |
| POST   | `/api/control/features`  | Apply one or more feature toggle mutations               |
| POST   | `/api/control/roles`     | Apply role definition mutations                          |
| POST   | `/api/control/scans`     | Apply scan profile mutations                             |

## Payloads

- **Feature mutations** expect a body that conforms to
  `FeatureTogglePatchCollection` from `tornado_ai.shared.types`.
- **Role mutations** accept `RoleControlPatchCollection` payloads.
- **Scan mutations** accept `ScanProfilePatchCollection` payloads.

See `tornado_ai/api/controllers/control.py` for the orchestrating logic. Each
endpoint returns the updated `ControlSurface` representation so clients can
render the latest state without issuing a follow-up `GET` request.

## Error Handling

Validation errors raised by Pydantic are automatically converted to FastAPI
responses with status code `422` and a `detail` array describing the failing
fields. Domain-level validation errors re-use the same mechanism by raising
`ValidationError` instances from the control-center manager.

## Versioning

The service currently ships as a single versioned application (no explicit API
version prefix). Backwards-incompatible changes are announced in the changelog
and reflected in the shared type models. Clients should pin against a specific
Git revision or release tag if stability is required.
