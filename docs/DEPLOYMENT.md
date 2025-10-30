# Deployment Guide

This guide covers production-ready deployment workflows for Tornado.ai across Linux and
Windows environments. It assumes familiarity with containerization, reverse proxies, and
managing Node.js services in production.

## Pre-deployment Checklist

1. **Security authorization** — Verify the engagement scope and obtain written approval.
2. **Infrastructure** — Provision compute resources with at least 4 CPU cores, 8 GB RAM, and
   40 GB of storage for application code, logs, and cached tool results.
3. **Networking** — Reserve inbound ports 7700 (API) and 3000 (UI) or configure a reverse
   proxy/ingress controller to expose HTTPS endpoints.
4. **Secrets** — Store JWT secrets, database passwords, and MFA seeds in a secure vault.
5. **Database** — Decide between SQLite (embedded) or PostgreSQL (external) and provision the
   chosen engine.
6. **Monitoring** — Integrate log shipping (e.g., Loki, ELK) and metrics scraping before go-live.
7. **Disaster recovery** — Plan backups for the database, audit logs, and report artifacts.

## Linux Deployment (Ubuntu/Debian)

1. **Create application user and directories**:
   ```bash
   sudo useradd --system --home /opt/tornado-ai --shell /usr/sbin/nologin tornado
   sudo mkdir -p /opt/tornado-ai
   sudo chown tornado:tornado /opt/tornado-ai
   ```
2. **Install runtime dependencies** (Node.js, pnpm, SQLite/PostgreSQL client tools):
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt install -y nodejs build-essential sqlite3 libpq5
   sudo corepack enable
   sudo corepack prepare pnpm@latest --activate
   ```
3. **Deploy application code** (CI/CD artifact or Git clone):
   ```bash
   sudo -u tornado git clone https://github.com/your-org/tornado-ai.git /opt/tornado-ai
   cd /opt/tornado-ai
   sudo -u tornado cp .env.example .env
   sudo -u tornado pnpm install --frozen-lockfile
   sudo -u tornado pnpm build
   ```
   _Quick bootstrap_: run `sudo -u tornado pnpm setup` to copy `.env`, create `data/`, and
   install dependencies in one step (without `--frozen-lockfile`).
4. **Configure environment variables** by editing `/opt/tornado-ai/.env` or placing a
   drop-in file under `/etc/tornado-ai.env`. Example snippet:
   ```ini
   SERVER_HOST=0.0.0.0
   SERVER_PORT=7700
   DATABASE_TYPE=postgres
   DATABASE_URL=postgres://tornado:secure@db-host:5432/tornado
   JWT_SECRET=change-me
   LOG_LEVEL=info
   ```
5. **Create a systemd service** at `/etc/systemd/system/tornado-ai.service`:
   ```ini
   [Unit]
   Description=Tornado.ai Fastify Service
   After=network-online.target

   [Service]
   Type=simple
   User=tornado
   WorkingDirectory=/opt/tornado-ai
   EnvironmentFile=/etc/tornado-ai.env
   ExecStart=/usr/bin/node dist/server.js
   Restart=on-failure
   RestartSec=5

   [Install]
   WantedBy=multi-user.target
   ```
6. **Start and enable the service**:
   ```bash
   sudo systemctl daemon-reload
   sudo systemctl enable --now tornado-ai
   sudo systemctl status tornado-ai
   ```
7. **Expose via Nginx (optional)**:
   ```nginx
   server {
     listen 443 ssl;
     server_name tornado.example.com;

     ssl_certificate /etc/letsencrypt/live/tornado.example.com/fullchain.pem;
     ssl_certificate_key /etc/letsencrypt/live/tornado.example.com/privkey.pem;

     location / {
       proxy_pass http://127.0.0.1:7700;
       proxy_set_header Host $host;
       proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
       proxy_set_header X-Forwarded-Proto $scheme;
     }
   }
   ```

## Windows Deployment (PowerShell)

1. **Install prerequisites**:
   ```powershell
   winget install OpenJS.NodeJS.LTS
   winget install pnpm.pnpm
   winget install Git.Git
   ```
2. **Clone and build** (run as a service account or Administrator):
   ```powershell
   git clone https://github.com/your-org/tornado-ai.git C:\TornadoAI
   cd C:\TornadoAI
   Copy-Item .env.example .env
   pnpm install --frozen-lockfile
   pnpm build
   ```
   _Quick bootstrap_: `pnpm setup` copies `.env`, prepares the data directory, and installs
   dependencies automatically for development environments.
3. **Configure environment variables** by editing `C:\TornadoAI\.env` or defining
   system-wide variables via:
   ```powershell
   [System.Environment]::SetEnvironmentVariable('JWT_SECRET','change-me','Machine')
   [System.Environment]::SetEnvironmentVariable('DATABASE_TYPE','sqlite','Machine')
   ```
4. **Run as a Windows service** using the Non-Sucking Service Manager (NSSM):
   ```powershell
   winget install NSSM
   nssm install TornadoAI "C:\Program Files\nodejs\node.exe" "dist\server.js"
   nssm set TornadoAI AppDirectory "C:\TornadoAI"
   nssm set TornadoAI AppEnvironmentExtra "NODE_ENV=production" "PORT=7700"
   nssm start TornadoAI
   ```
5. **IIS/Reverse proxy integration** — Configure IIS or an external appliance to terminate
   TLS and proxy requests to `http://localhost:7700`.

## Containerized Deployment (Docker & Compose)

The repository includes a multi-stage Dockerfile and `docker-compose.yml` for streamlined
container builds.

1. **Build the runtime image**:
   ```bash
   docker build -t tornado-ai:prod .
   ```
2. **Prepare environment configuration** by copying `.env.example` to `.env` and updating
   secrets. Mount this file via `env_file` or inject variables through your orchestrator.
3. **Launch with Docker Compose** (API + PostgreSQL):
   ```bash
   docker compose up --build
   ```
   The Compose stack exposes port `7700`, persists SQLite data under `./data`, provisions a
   PostgreSQL 15 instance, and waits for container health checks before starting the API.
4. **Kubernetes/Ops notes**:
   - Convert the Docker image into a Deployment with a ConfigMap/Secret providing `.env`
     values.
   - Mount a PersistentVolume for `/app/data` when using SQLite, or switch to PostgreSQL by
     setting `DATABASE_TYPE=postgres` and `DATABASE_URL` secrets.
   - Translate the compose health checks to readiness/liveness probes hitting `/health`.

## Database Configuration

- **SQLite**: Default mode. Ensure the service account can write to `data/tornado.db`. Take
  periodic filesystem backups or copy-on-write snapshots.
- **PostgreSQL**: Create database objects before deployment:
  ```sql
  CREATE DATABASE tornado;
  CREATE USER tornado WITH ENCRYPTED PASSWORD 'strong-password';
  GRANT ALL PRIVILEGES ON DATABASE tornado TO tornado;
  ```
  Update `DATABASE_URL` to use SSL/TLS and configure connection pooling (pgBouncer or RDS).

## File System Layout

```
/opt/tornado-ai
├── dist/             # Compiled server output
├── node_modules/
├── data/             # SQLite database and cache entries (ensure backups)
├── logs/             # Optional log directory when redirecting stdout/stderr
└── ui-build/         # Compiled React assets (if served from same host)
```

Adjust paths accordingly for Windows (`C:\TornadoAI`).

## Observability & Operations

- **Logging**: Pino emits JSON to stdout. Route logs to journald (systemd), Windows Event Log,
  or ship to a centralized aggregator. Consider enabling pretty-print only in development.
- **Metrics**: Expose counters and histograms via REST endpoints in `src/api`. Scrape them with
  Prometheus or integrate with OpenTelemetry exporters.
- **Tracing**: Correlate requests using the built-in correlation ID support (`src/core/audit`).
- **Health checks**: `/health` returns registry size and audit timestamps. Configure your load
  balancer to probe this endpoint.

## Hardening Recommendations

- Restrict outbound tool execution to approved networks; run scans inside segmented VPCs.
- Use OS-level firewalls (ufw, Windows Firewall) to limit inbound ports.
- Run the Node.js process as a non-privileged account and disable shell access.
- Enable automatic security updates and monitor for CVEs affecting bundled tools.
- Rotate `JWT_SECRET`, database credentials, and MFA backup codes regularly.

## Backup & Recovery

1. Schedule database dumps (`pg_dump` or `sqlite3 .dump`) and archive them securely.
2. Export audit logs stored in `data/audit.log` (if configured) to long-term storage.
3. Version control report templates and checklist CSVs to recreate outputs when needed.
4. Test restoration by bootstrapping a staging environment from the latest backups.

## FAQ

**Can I run Tornado.ai in Docker or Kubernetes?**
Yes. Use the bundled Dockerfile and Compose stack for local or CI environments. For
Kubernetes, build/push the image, mount configuration via ConfigMaps/Secrets, and reuse the
compose health checks as readiness probes.

**How do I deploy the React UI?**  
Run `pnpm --filter ui build` inside the `ui/` workspace (once populated) and host the output
through Nginx, IIS, or a CDN. For monolithic deployments, serve the UI build directory via
the same reverse proxy that fronts the API.

**What is the recommended process manager?**  
Systemd is preferred on Linux. Alternatives include `pm2`, `forever`, or container orchestration.
On Windows, NSSM or the Windows Service Wrapper can supervise the Node.js process.

**How should I handle configuration changes?**  
Update the `.env` or environment store and restart the service. For Kubernetes, update the
ConfigMap/Secret and roll the Deployment. Keep configuration under version control where
possible.

**How do I validate deployments before go-live?**  
Use `pnpm test` and `pnpm type-check` in CI, followed by smoke tests against `/health`,
selected MCP tool invocations, and sample report generation to ensure dependencies are wired
correctly.
