# Tornado.ai

Tornado.ai is a multi-role offensive security testing platform that combines an MCP server,
Fastify backend, and React UI. This repository provides the initial project scaffold,
including TypeScript configuration, linting, testing, and directory layout for the
hexagonal architecture described in the project specification.

## Getting Started

Install dependencies using your preferred package manager (pnpm is recommended):

```bash
pnpm install
```

### Development Scripts

- `pnpm dev` — start the Fastify development server with TSX.
- `pnpm dev:ui` — run the React UI dev server (see `ui/` README for setup).
- `pnpm build` — compile TypeScript sources to `dist/`.
- `pnpm test` — execute Vitest test suites.
- `pnpm lint` — run ESLint checks.
- `pnpm type-check` — perform TypeScript type checking without emit.
- `pnpm mcp` — output the MCP tool descriptors.

## Project Structure

```
src/
  api/
    controllers/      # Fastify route handlers
    routes/           # Route registration modules
  agents/             # Autonomous security agents (stubs)
  auth/               # Authentication, MFA, and middleware
  core/               # Domain services (audit, cache, metrics, policy, etc.)
  mcp/                # Model Context Protocol server integration
  reports/            # Report generation pipelines
  tools/              # Tool registry grouped by category
  viz/                # Visualization orchestration (AVE)
  checklists/         # Checklist management services
  shared/             # Shared types and utilities
ui/
  ...                 # React + Tailwind UI scaffold (coming soon)
```

Each directory contains TypeScript modules that define contracts, DTOs, and placeholder
implementations. The structure is intended to support future development of the full
feature set, including authentication, MFA, RBAC, tool orchestration, reporting, and
observability.

## Configuration

Runtime configuration is loaded from environment variables (see `src/config/index.ts`).
A sample `.env.example` file is provided to document required settings.

## Testing

Vitest is configured for both unit and integration tests. Add new tests under the
`tests/` directory following the naming convention `*.test.ts`.

## License

Copyright (c) 2024 Tornado.ai. All rights reserved.
