# Installation & Operations Guide

This guide provides a comprehensive walk-through for preparing Tornado.ai on
Linux, Windows, and Docker-based environments. It expands on the README with
mandatory prerequisites, detailed configuration steps, validation commands, and
a living FAQ for the most common issues.

## Table of Contents

1. [Prerequisites](#1-prerequisites)
2. [Linux Installation Workflow](#2-linux-installation-workflow)
3. [Windows Installation Workflow](#3-windows-installation-workflow)
4. [Kali GUI Container (Windows tool runtime)](#4-kali-gui-container-windows-tool-runtime)
5. [Optional FastAPI Docker Runtime](#5-optional-fastapi-docker-runtime)
6. [Configuration and Environment Files](#6-configuration-and-environment-files)
7. [Post-Installation Validation](#7-post-installation-validation)
8. [Frequently Asked Questions](#8-frequently-asked-questions)
9. [Next Steps](#9-next-steps)

## 1. Prerequisites

### Hardware & Operating System

- 4 CPU cores and 8 GB RAM are recommended for comfortable local development.
- 2 GB of available disk space for the Python virtual environment and cache.
- Linux (Ubuntu 22.04+ or equivalent), macOS 13+, or Windows 11/10.

### Software Requirements

- Python **3.11** or newer.
- Node.js **18** or newer (for running Vitest decision-engine coverage).
- Git (for cloning the repository and tracking updates).
- Internet access for downloading Python packages and static assets.
- (Optional) SQLite 3.39+ if you intend to persist cached MCP datasets.
- (Optional) Docker Engine 24+ if you prefer containerised execution.
- (Required on Windows) Docker Desktop 4.27+ with virtualization enabled to run
  the Kali GUI workspace.

### Accounts & Permissions

- Ability to install system packages (`sudo` on Linux, Administrator on
  Windows).
- Firewall permission to open TCP port `8000` (or the port you configure).

## 2. Linux Installation Workflow

### 2.1 Install System Packages

Debian/Ubuntu example:

```bash
sudo apt update
sudo apt install -y python3 python3-venv python3-pip git build-essential libsqlite3-dev
```

> Fedora/RHEL users should replace `apt` with `dnf` and install the analogous
> packages (`python3`, `python3-virtualenv`, `git`, `gcc`, `sqlite-devel`).

### 2.2 Clone and Bootstrap the Project

```bash
git clone https://github.com/your-org/Tornado.Ai.git
cd Tornado.Ai
python3 -m venv .venv
source .venv/bin/activate
pip install --upgrade pip
pip install -e .[dev]
pytest
```

### 2.3 Launch the Development Server

```bash
uvicorn tornado_ai.server:app --host 0.0.0.0 --port 8000 --reload
```

Browse to `http://localhost:8000/console` for the advanced control surface. Use
`CTRL+C` to stop the server.

### 2.4 Optional: System Service

For production-style deployments, adapt the following systemd unit:

```ini
# /etc/systemd/system/tornado-ai.service
[Unit]
Description=Tornado AI FastAPI service
After=network.target

[Service]
User=tornado
Group=tornado
WorkingDirectory=/opt/Tornado.Ai
EnvironmentFile=/opt/Tornado.Ai/.env
ExecStart=/opt/Tornado.Ai/.venv/bin/uvicorn tornado_ai.server:app --host 0.0.0.0 --port 8000
Restart=on-failure

[Install]
WantedBy=multi-user.target
```

Reload and enable the unit with:

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now tornado-ai
```

## 3. Windows Installation Workflow

### 3.1 Install Python, Git, and Build Tooling

1. Install **Python 3.11** from [python.org](https://www.python.org/downloads/)
   or the Microsoft Store. Ensure “Add Python to PATH” is checked.
2. Install **Git for Windows**.
3. (Optional) Install **Visual Studio Build Tools** with the C++ workload to
   compile native wheels when required.

### 3.2 Clone and Bootstrap the Project

Open *PowerShell* and run:

```powershell
cd $HOME\Desktop
git clone https://github.com/your-org/Tornado.Ai.git
cd Tornado.Ai
py -3.11 -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
pip install -e .[dev]
pytest
```

### 3.3 Launch the Development Server

```powershell
uvicorn tornado_ai.server:app --host 0.0.0.0 --port 8000 --reload
```

Open `http://localhost:8000/console` in your browser to access the control
surface. Close the server with `Ctrl+C`.

### 3.4 Optional: Windows Service Mode

To run Tornado.ai as a background service on Windows, use NSSM (Non-Sucking
Service Manager):

```powershell
nssm install TornadoAI "$PWD\.venv\Scripts\uvicorn.exe" "tornado_ai.server:app" --host 0.0.0.0 --port 8000
nssm set TornadoAI AppDirectory "$PWD"
nssm set TornadoAI AppEnvironmentExtra "TORNADO_SERVER_HOST=0.0.0.0" "TORNADO_SERVER_PORT=8000" "TORNADO_LOG_LEVEL=INFO"
```

## 4. Kali GUI Container (Windows tool runtime)

The runtime detector automatically routes tool execution through a Kali GUI
container on Windows hosts. Linux and native Kali installations run tools
directly on the host.

### 4.1 Requirements

- Windows 10/11 with Hyper-V or WSL2 virtualization enabled.
- Docker Desktop 4.27+ with the “Use the WSL 2 based engine” option.
- Remote Desktop Protocol (RDP) client access to connect to the Kali desktop.

### 4.2 Automatic start-up behaviour

When Tornado.ai detects a Windows host it automatically executes
`docker compose -f docker/kali/docker-compose.yml up -d --pull missing` during
the first runtime check to ensure the Kali GUI container is running. Manual
startup is still available when you want to inspect logs or rebuild the image:

```powershell
cd docker\kali
docker compose up -d
```

The compose profile builds `tornado-ai-kali:latest`, installs XFCE + XRDP, and
mounts `../data` into `/workspace/data` so the API and GUI environments can
exchange findings.

### 4.3 Connect via Remote Desktop

- Server: `localhost`
- Port: `3390`
- Username: `kali`
- Password: `kali` (override with the `KALI_PASSWORD` environment variable)

When Tornado.ai executes a tool, the command response contains telemetry noting
that the Kali container satisfied execution requirements
(`result.telemetry.runtime.requiresContainer == true`).

### 4.4 Shut down the workspace

```powershell
docker compose down
```

Use `docker compose logs -f` for troubleshooting startup issues or verifying GUI
services.

### 4.5 Overrides and advanced usage

- Export `TORNADO_KALI_MODE=force-host` to bypass the container (useful for CI).
- Export `TORNADO_KALI_MODE=force-container` when testing the Windows workflow
  on Linux via Docker Desktop or WSL2.
- Export `TORNADO_KALI_AUTOSTART=0` to disable automatic container launch and
  manage the lifecycle manually.
- Customize credentials or shared paths by editing
  [`docker/kali/docker-compose.yml`](../docker/kali/docker-compose.yml).

## 5. Optional FastAPI Docker Runtime

Docker provides an isolated runtime for the FastAPI service without touching the
host Python toolchain.

### 5.1 Build the Image

```bash
docker build -t tornado-ai .
```

### 5.2 Run the Container

```bash
docker run --rm -p 8000:8000 --env-file .env tornado-ai
```

This uses the `.env` file from the project root for configuration. To iterate on
code without rebuilding the image, mount the repository and enable reload mode:

```bash
docker run --rm -it -p 8000:8000 -v "$(pwd)":/app \
  --env-file .env tornado-ai \
  uvicorn tornado_ai.server:app --host 0.0.0.0 --reload
```

### 5.3 Updating Dependencies

Rebuild the image whenever `pyproject.toml` changes:

```bash
docker build --pull --no-cache -t tornado-ai .
```

## 6. Configuration and Environment Files

### 6.1 Base `.env` Template

Create `.env` in the repository root. The service automatically loads it:

```bash
cat <<'ENV' > .env
TORNADO_SERVER_HOST=0.0.0.0
TORNADO_SERVER_PORT=8000
TORNADO_SERVER_CORS=true
TORNADO_LOG_LEVEL=INFO
ENV
```

PowerShell equivalent:

```powershell
@'
TORNADO_SERVER_HOST=0.0.0.0
TORNADO_SERVER_PORT=8000
TORNADO_SERVER_CORS=true
TORNADO_LOG_LEVEL=INFO
'@ | Out-File -FilePath .env -Encoding utf8
```

### 6.2 Additional Tweaks

- Set `TORNADO_SERVER_CORS=false` to disable cross-origin requests entirely.
- Adjust `TORNADO_SERVER_PORT` if port 8000 is already in use.
- Use `TORNADO_LOG_LEVEL=DEBUG` when diagnosing API or registry issues.

## 7. Post-Installation Validation

Run through the following checks to confirm the deployment:

1. `pytest` succeeds without failures.
2. Install and execute the Vitest suite:
   ```bash
   cd ui
   npm install
   npm test
   ```
3. `curl http://localhost:8000/api/health/` returns a JSON payload containing the
   MCP registry summary, cache stats, and telemetry counters.
4. Visiting `http://localhost:8000/console` renders the advanced UI with feature
   toggles, role controls, and scan profiles.
5. Mutating a feature/role/scan via the UI produces entries in the in-memory
   activity feed (visible in the console).
6. Invoke a dry-run tool via `curl -X POST http://localhost:8000/api/command/`
   (see [`docs/API.md`](API.md#command-endpoints)) and confirm the response
   includes `"runtime": {"requires_container": false|true}`.

## 8. Frequently Asked Questions

| Symptom | Resolution |
| --- | --- |
| `ModuleNotFoundError: jinja2` during startup | Ensure `pip install -e .[dev]` completed successfully or rebuild the Docker image. |
| UI shows blank cards | Verify the API is reachable at `/api/control/`; reverse proxy misconfiguration can block requests. |
| `pip` fails with SSL/TLS errors | Update system CA certificates (`sudo apt install ca-certificates` on Debian/Ubuntu) or configure your corporate proxy. |
| Native dependency build failures on Windows | Install Visual Studio Build Tools and re-run `pip install -e .[dev]`. |
| Uvicorn cannot bind to port 8000 | Change `TORNADO_SERVER_PORT` in `.env` or free the occupied port. |
| Docker container exits immediately | Confirm the `.env` file is mounted or baked into the image and that the port mapping is valid. |
| Unable to RDP into the Kali container | Ensure the compose stack is running (`docker compose ps`) and that port `3390` is open in Windows Firewall. |
| Telemetry shows `requiresContainer=false` on Windows | Verify Docker Desktop is running and that `TORNADO_KALI_MODE` is not set to `force-host`. |

## 9. Next Steps

- Review [`docs/API.md`](API.md) for payload contracts.
- Configure MCP integrations via [`docs/MCP.md`](MCP.md).
- Explore automation examples in [`docs/AI-CLIENTS.md`](AI-CLIENTS.md).
- Follow the hardened deployment practices in [`docs/DEPLOYMENT.md`](DEPLOYMENT.md).
