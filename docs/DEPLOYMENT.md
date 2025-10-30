# Deployment Guide

This guide documents production-ready deployment workflows for the Python
edition of Tornado.ai. The backend is a FastAPI application served via ASGI. No
Node.js runtime is required.

## Pre-deployment Checklist

1. **Security authorization** – Verify the engagement scope and obtain written approval.
2. **Infrastructure** – Provision compute resources with at least 2 CPU cores,
   4 GB RAM, and 10 GB of storage for application code, logs, and cached tool
   results.
3. **Networking** – Reserve an inbound port (default `8000`) or terminate TLS via
   a reverse proxy.
4. **Secrets** – Store environment variables such as logging level overrides in a
   secure vault. (The current build does not depend on databases or JWT secrets.)
5. **Monitoring** – Route structured logs to your observability stack.
6. **Disaster recovery** – Plan snapshots for any persisted cache directories.

## Linux Deployment (systemd + uvicorn)

1. **Create application user and directories**:
   ```bash
   sudo useradd --system --home /opt/tornado-ai --shell /usr/sbin/nologin tornado
   sudo mkdir -p /opt/tornado-ai
   sudo chown tornado:tornado /opt/tornado-ai
   ```
2. **Install Python runtime** (3.11+ recommended):
   ```bash
   sudo apt update
   sudo apt install -y python3 python3-venv python3-pip
   ```
3. **Create a virtual environment and install Tornado.ai**:
   ```bash
   sudo -u tornado python3 -m venv /opt/tornado-ai/.venv
   sudo -u tornado /opt/tornado-ai/.venv/bin/pip install --upgrade pip
   sudo -u tornado /opt/tornado-ai/.venv/bin/pip install tornado-ai[dev]
   ```
4. **Configure environment variables** by creating `/opt/tornado-ai/.env`:
   ```ini
   TORNADO_SERVER_HOST=0.0.0.0
   TORNADO_SERVER_PORT=8000
   TORNADO_LOG_LEVEL=INFO
   ```
5. **Create a systemd service** at `/etc/systemd/system/tornado-ai.service`:
   ```ini
   [Unit]
   Description=Tornado.ai FastAPI Service
   After=network-online.target

   [Service]
   Type=simple
   User=tornado
   WorkingDirectory=/opt/tornado-ai
   EnvironmentFile=-/opt/tornado-ai/.env
   ExecStart=/opt/tornado-ai/.venv/bin/uvicorn tornado_ai.server:app --host ${TORNADO_SERVER_HOST:-0.0.0.0} --port ${TORNADO_SERVER_PORT:-8000}
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
7. **Expose via Nginx (optional)** – proxy `https://tornado.example.com` to
   `http://127.0.0.1:8000`.

## Windows Deployment (PowerShell + NSSM)

1. **Install prerequisites**:
   ```powershell
   winget install Python.Python.3.11
   winget install Git.Git
   ```
2. **Create a virtual environment and install dependencies**:
   ```powershell
   python -m venv C:\TornadoAI\.venv
   C:\TornadoAI\.venv\Scripts\pip install --upgrade pip
   C:\TornadoAI\.venv\Scripts\pip install tornado-ai[dev]
   ```
3. **Create `C:\TornadoAI\.env`** with any environment overrides.
4. **Install NSSM and register the service**:
   ```powershell
   winget install NSSM
   nssm install TornadoAI "C:\TornadoAI\.venv\Scripts\uvicorn.exe" "tornado_ai.server:app" --run
   nssm set TornadoAI AppDirectory C:\TornadoAI
   nssm set TornadoAI AppEnvironmentExtra "TORNADO_SERVER_HOST=0.0.0.0" "TORNADO_SERVER_PORT=8000"
   nssm start TornadoAI
   ```

## Containerized Deployment

A minimal container entry point can be built directly from the Python source:

```Dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY . .
RUN pip install --no-cache-dir .
CMD ["uvicorn", "tornado_ai.server:app", "--host", "0.0.0.0", "--port", "8000"]
```

Build and run:

```bash
docker build -t tornado-ai:latest .
docker run -p 8000:8000 --env-file .env tornado-ai:latest
```

## Observability & Operations

- **Logging** – Structured JSON logs are emitted via the standard logging
  module. Forward stdout to your logging platform of choice.
- **Health checks** – Probe `/api/health/` for readiness and liveness.
- **Metrics** – The current build does not expose Prometheus metrics; integrate
  your preferred library if deeper telemetry is required.

## Backup & Recovery

The service state is in-memory. Persisted artifacts are limited to any cache
files you choose to store under `data/`. Schedule filesystem backups if you rely
on these caches for long-running analyses.
