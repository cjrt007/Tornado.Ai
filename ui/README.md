# Tornado.ai UI

The Tornado.ai UI is implemented as a Vite + React + TypeScript application styled with Tailwind CSS and powered by Zustand state management. The first milestone focuses on the enterprise control surface for tuning features, roles, and scan orchestration with parity to tools like Nessus and Burp Suite.

## Capabilities

- **Advanced Feature Controls** – Toggle platform capabilities with category grouping, restart indicators, and tag-based filtering.
- **Role Governance** – Assign permissions, MFA policies, and feature access per persona with instant backend persistence.
- **Scan Orchestration** – Edit targets, tooling, schedules, and guardrails for every scan profile with live guardrail validation.
- **Realtime Persistence** – Optimistic updates backed by the REST API exposed at `/api/control`.

## Getting Started

Install dependencies and launch the dev server:

```bash
pnpm install # at repository root (workspace aware)
pnpm dev:ui
```

The UI runs on `http://localhost:3000` and proxies API requests to the Fastify backend on `:7700`.
