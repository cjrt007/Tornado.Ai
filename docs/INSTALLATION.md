# Installation Guide

This guide provides step-by-step installation and configuration instructions for
Linux and Windows environments, including recommended packages, environment
variables, and sanity checks. Use it alongside the README for a high-level
overview.

## 1. System Requirements

- Python 3.11+
- Git
- Internet access for dependency downloads
- (Optional) SQLite 3.39+ for persistent caching of MCP datasets
- (Optional) Build tooling (`build-essential` on Debian/Ubuntu or
  `Visual Studio Build Tools` on Windows) when compiling heavy native
  dependencies

## 2. Linux Setup

### 2.1 Install System Dependencies

```bash
sudo apt update
sudo apt install -y python3 python3-venv python3-pip git build-essential libsqlite3-dev
```

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

### 2.3 Runtime Configuration

Create `.env` in the repository root (the FastAPI app loads it automatically):

```bash
cat <<'ENV' > .env
TORNADO_SERVER_HOST=0.0.0.0
TORNADO_SERVER_PORT=8000
TORNADO_SERVER_CORS=true
TORNADO_LOG_LEVEL=INFO
ENV
```

Start the service:

```bash
uvicorn tornado_ai.server:app --host 0.0.0.0 --port 8000 --reload
```

Visit `http://localhost:8000/console` for the advanced control surface.

## 3. Windows Setup

### 3.1 Install Python and Git

- Install **Python 3.11** from the Microsoft Store or python.org (ensure
  "Add Python to PATH" is checked).
- Install **Git for Windows**.
- Optionally install **Visual Studio Build Tools** with the C++ workload to
  build native wheels when required.

### 3.2 Bootstrap the Repository

```powershell
cd $HOME\Desktop
git clone https://github.com/your-org/Tornado.Ai.git
cd Tornado.Ai
py -3.11 -m venv .venv
.\.venv\Scripts\activate
python -m pip install --upgrade pip
pip install -e .[dev]
pytest
```

### 3.3 Configure Environment Variables

Create `.env` (PowerShell):

```powershell
@'
TORNADO_SERVER_HOST=0.0.0.0
TORNADO_SERVER_PORT=8000
TORNADO_SERVER_CORS=true
TORNADO_LOG_LEVEL=INFO
'@ | Out-File -FilePath .env -Encoding utf8
```

Run the server:

```powershell
uvicorn tornado_ai.server:app --host 0.0.0.0 --port 8000 --reload
```

Navigate to `http://localhost:8000/console` to manage features, roles, and scan
profiles.

## 4. Optional: Service Mode Deployment

For production, run behind a hardened ASGI server and process supervisor:

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

Enable and start:

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now tornado-ai
```

## 5. Post-Installation Validation

- `pytest` passes without failures.
- `curl http://localhost:8000/api/health/` returns a JSON payload containing the
  MCP registry summary.
- Browsing to `/console` renders the advanced UI and displays feature toggles.
- Updating a feature/role/scan via the UI results in activity feed entries.

## 6. Troubleshooting

| Symptom | Resolution |
| --- | --- |
| `ModuleNotFoundError: jinja2` | Ensure `pip install -e .[dev]` completed successfully. |
| UI shows blank cards | Verify the API is reachable at `/api/control/` (reverse proxy misconfiguration can block requests). |
| Native dependency build failures on Windows | Install Visual Studio Build Tools and rerun `pip install -e .[dev]`. |
| Uvicorn cannot bind to port | Change `TORNADO_SERVER_PORT` in `.env` or release the occupied port. |

## 7. Next Steps

- Review [`docs/API.md`](API.md) for payload contracts.
- Configure MCP integrations via [`docs/MCP.md`](MCP.md).
- Explore automation examples in [`docs/AI-CLIENTS.md`](AI-CLIENTS.md).
