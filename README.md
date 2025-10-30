# Tornado.ai

Tornado.ai is a multi-role offensive security testing platform that combines a Fastify
backend, Model Context Protocol (MCP) server, and React UI. The project follows a
hexagonal architecture to keep domain logic, transport interfaces, and adapters cleanly
separated while supporting advanced authentication, reporting, visualization, and
checklist automation workflows.

- **Tech stack**: Node.js 18+, TypeScript, Fastify, Zod, Pino, better-sqlite3/PostgreSQL,
  Vitest, React 18, Tailwind CSS, Zustand/Redux Toolkit.
- **Security features**: Multi-role RBAC, JWT authentication, MFA via TOTP, detailed audit
  logging, and tool execution approvals.
- **Core subsystems**: Decision engine (AIDE), tool orchestration (ASME/APME), autonomous
  agents (AAAM), visualization (AVE), caching (SCM), observability, and reporting.
- **Streamlined setup**: `pnpm setup` bootstraps environment files, folders, and dependencies
  in a single step.
- **Containerization**: First-class Dockerfile and Compose stack for reproducible deployments
  across workstations and CI pipelines.

> ⚠️ **Warning**: Tornado.ai is intended for authorized security testing only. Always obtain
> explicit permission before assessing a target and follow responsible disclosure
> practices.

## Table of Contents

1. [Repository Layout](#repository-layout)
2. [Prerequisites](#prerequisites)
3. [Installation](#installation)
   - [Quick Start (One-command setup)](#quick-start-one-command-setup)
   - [Linux (Ubuntu/Debian)](#linux-ubuntudebian)
   - [Windows 11/10](#windows-1110)
4. [Configuration](#configuration)
5. [Running the Platform](#running-the-platform)
6. [Containerized Deployment](#containerized-deployment)
7. [Additional Documentation](#additional-documentation)
8. [FAQ](#faq)
9. [License](#license)

## Repository Layout

```
src/
  api/               # Fastify controllers and route registration
  agents/            # Autonomous security agent entry points
  auth/              # Authentication, MFA, and permission middleware
  core/              # Domain services (audit, cache, metrics, policy, etc.)
  mcp/               # Model Context Protocol server integration
  reports/           # Report generation pipelines and templates
  tools/             # Tool registry grouped by category
  viz/               # Visualization orchestration (AVE components)
  checklists/        # Checklist management engine
  shared/            # Cross-cutting types and utilities
ui/
  ...                # React + Tailwind UI scaffold (see `ui/README.md`)
docs/
  ...                # Architecture, APIs, tooling, deployment, and checklist guides
```

Each directory contains TypeScript modules that define contracts, DTOs, and placeholder
implementations to accelerate future development of the full platform.

## Prerequisites

| Requirement | Linux | Windows |
|-------------|-------|---------|
| Operating System | Ubuntu 22.04+, Debian 12+, Fedora 38+, or compatible | Windows 11 / 10 (22H2+) with PowerShell 7 or Windows Terminal |
| Node.js | v18.19 or later (LTS) | v18.19 or later (LTS) |
| Package Manager | pnpm 8+ (installed via Corepack) | pnpm 8+ (installed via Corepack) |
| Git | v2.40+ | v2.40+ |
| Database | SQLite 3.39+ (default) or PostgreSQL 14+ | SQLite (bundled) or PostgreSQL 14+ |
| Optional Build Tools | `build-essential`, `python3`, `libssl-dev`, `sqlite3` CLI | Visual Studio Build Tools 2022 or `winget install Microsoft.VisualStudio.2022.BuildTools` |
| Additional Utilities | `curl`, `wget`, `gnupg`, `openssh-client` | OpenSSH client (optional) |

- Enable Corepack: `corepack enable`
- Ensure your shell supports environment variables (`.env`) and that ports `7700` (API) and
  `3000` (UI) are available.
- For PostgreSQL deployments, provision the database and user with `CREATE DATABASE` and
  `CREATE ROLE` privileges prior to running migrations.

## Installation

### Quick Start (One-command setup)

1. Ensure [Corepack](https://nodejs.org/api/corepack.html) is enabled (ships with Node.js 18+):
   ```bash
   corepack enable
   ```
2. Clone the repository and run the bootstrapper:
   ```bash
   git clone https://github.com/your-org/tornado-ai.git
   cd tornado-ai
   pnpm setup
   ```

The setup routine copies `.env.example` to `.env` when missing, prepares the `data/` directory
for SQLite/cache artifacts, installs dependencies (auto-installing pnpm via Corepack if
necessary), and prints follow-up commands for linting, testing, and starting the dev server.

### Linux (Ubuntu/Debian)

1. **Install system packages**:
   ```bash
   sudo apt update
   sudo apt install -y curl ca-certificates build-essential python3 sqlite3 libsqlite3-dev gnupg
   ```
2. **Install Node.js 18 LTS via NodeSource**:
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt install -y nodejs
   ```
3. **Enable Corepack and install pnpm**:
   ```bash
   sudo corepack enable
   corepack prepare pnpm@latest --activate
   ```
4. **Clone the repository**:
   ```bash
   git clone https://github.com/your-org/tornado-ai.git
   cd tornado-ai
   ```
5. **Copy environment template and install dependencies**:
   ```bash
   cp .env.example .env
   pnpm install
   ```
6. **Verify the setup**:
   ```bash
   pnpm lint
   pnpm test
   pnpm dev
   ```
   Access the API at http://localhost:7700 and the UI (when running) at http://localhost:3000.

### Windows 11/10

1. **Install Node.js 18 LTS** using the [official installer](https://nodejs.org/) or with
   Winget:
   ```powershell
   winget install OpenJS.NodeJS.LTS
   ```
2. **Enable Corepack and install pnpm** (run in PowerShell as Administrator):
   ```powershell
   corepack enable
   corepack prepare pnpm@latest --activate
   ```
3. **Install Git and optional build tools**:
   ```powershell
   winget install Git.Git
   winget install Microsoft.VisualStudio.2022.BuildTools --silent --override "--add Microsoft.VisualStudio.Workload.VCTools"
   ```
4. **Clone the repository** using PowerShell or Git Bash:
   ```powershell
   git clone https://github.com/your-org/tornado-ai.git
   Set-Location tornado-ai
   ```
5. **Copy the environment template and install dependencies**:
   ```powershell
   Copy-Item .env.example .env
   pnpm install
   ```
6. **Run validation commands** (PowerShell or Windows Terminal):
   ```powershell
   pnpm lint
   pnpm test
   pnpm dev
   ```
   By default the Fastify server binds to `http://localhost:7700`.

## Configuration

Runtime configuration is defined in `src/config/index.ts` and sourced from environment
variables. Use the provided `.env.example` as a baseline and customize the following keys:

| Variable | Description | Default |
|----------|-------------|---------|
| `SERVER_HOST` | Address for the Fastify API server | `0.0.0.0` |
| `SERVER_PORT` | Port for the API server | `7700` |
| `JWT_SECRET` | Secret used to sign JWT tokens (required) | _none_ |
| `JWT_EXPIRY` | Access token lifetime (e.g. `24h`) | `24h` |
| `MFA_ISSUER` | TOTP issuer label for authenticator apps | `Tornado.ai` |
| `DATABASE_TYPE` | `sqlite` or `postgres` | `sqlite` |
| `DATABASE_PATH` | File path for SQLite database | `./data/tornado.db` |
| `DATABASE_URL` | PostgreSQL connection string (if `DATABASE_TYPE=postgres`) | _none_ |
| `CACHE_MAX_SIZE` | Content-addressed cache size (bytes) | `1073741824` (1 GB) |
| `CACHE_DEFAULT_TTL` | Default cache entry TTL in seconds | `3600` |
| `TOOLS_MAX_CONCURRENT` | Max concurrent tool executions | `5` |
| `TOOLS_TIMEOUT` | Tool execution timeout (seconds) | `300` |
| `LOG_LEVEL` | Pino log level (`info`, `debug`, etc.) | `info` |

Configuration can also be supplied via a `config.yaml` file if you prefer declarative
settings. Environment variables take precedence over file-based configuration.

### Database Notes

- SQLite is the default and requires no additional services. Ensure the `data/` directory is
  writable by the process owner.
- PostgreSQL deployments should configure SSL, connection pooling, and migrations. Update
  `DATABASE_URL` accordingly.

### Secrets Management

For production, store sensitive values (`JWT_SECRET`, database credentials) in a secrets
manager or encrypted environment store such as HashiCorp Vault, AWS Secrets Manager, or
Azure Key Vault.

## Running the Platform

### Development

```bash
pnpm dev          # Start Fastify with hot reload
pnpm dev:ui       # Start the React development server (ui/ directory)
```

### Production

```bash
pnpm build        # Emit compiled JavaScript to dist/
node dist/server.js
```

Use a process manager (pm2, systemd, Docker) for long-running deployments. Serve the UI via
a static hosting provider (Vercel, Netlify) or behind the same reverse proxy as the API.

## Containerized Deployment

### Build the image

```bash
docker build -t tornado-ai:dev .
```

The multi-stage Dockerfile installs dependencies with pnpm, compiles the TypeScript source,
and produces a production-ready runtime image that exposes port `7700`.

### Run with Docker Compose

1. Copy `.env.example` to `.env` and update secrets/connection details as needed.
2. Launch the stack (API + optional PostgreSQL) with persistent volumes:
   ```bash
   docker compose up --build
   ```
3. Access the API at http://localhost:7700 once the health check reports a healthy status.

The Compose file mounts `./data` for SQLite storage, provisions a PostgreSQL container with
health checks, and wires the Fastify service to use environment variables from `.env`.

### Testing & Quality

```bash
pnpm lint
pnpm type-check
pnpm test
```

## Additional Documentation

- [Architecture](docs/ARCHITECTURE.md)
- [API Reference](docs/API.md)
- [Tool Catalog](docs/TOOLS.md)
- [Checklist System](docs/CHECKLISTS.md)
- [Deployment Guide](docs/DEPLOYMENT.md)
- [UI Overview](ui/README.md)

## FAQ

**How do I switch between SQLite and PostgreSQL?**  
Set `DATABASE_TYPE=postgres` and provide `DATABASE_URL`. Run any migration scripts before
starting the server. For development, leave the defaults to use SQLite.

**Where do I configure role-based access control (RBAC) permissions?**  
RBAC policies live in `src/core/policy/rbac.ts`. Update the role-to-permission mappings and
add new permissions as needed.

**How do I enable Multi-Factor Authentication (MFA)?**  
MFA utilities reside in `src/auth/mfa/totp.ts`. Ensure `MFA_ISSUER` is set and expose the MFA
setup/verification routes from `src/auth/handlers/auth.ts` through your Fastify router.

**How are security tools registered with the MCP server?**  
The registry is defined in `src/tools/definitions.ts` and exported via `src/mcp/registry`.
`pnpm mcp` prints the descriptor catalog for client consumption.

**Can I containerize Tornado.ai?**
Yes. The repository ships with a production-focused Dockerfile and `docker-compose.yml`.
Build via `docker build -t tornado-ai:dev .` and launch the stack with `docker compose up` to
run the API alongside an optional PostgreSQL service.

**What observability features are available out of the box?**  
Structured JSON logs are emitted via Pino (`src/core/metrics/logger.ts`). Metrics and health
checks are exposed through Fastify routes under `src/api`. Extend these modules to integrate
with Prometheus, OpenTelemetry, or your preferred monitoring stack.

**How do I update checklists or import custom ones?**  
Checklist management utilities live under `src/checklists`. Use the CSV import endpoint
(`POST /api/checklists/:id/import`) once the REST API layer is wired up. Default OWASP
checklists ship in `docs/CHECKLISTS.md` for reference.

## License

Copyright (c) 2024 Tornado.ai. All rights reserved.
