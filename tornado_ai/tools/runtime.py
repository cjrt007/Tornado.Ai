"""Runtime detection for tool execution environments."""
from __future__ import annotations

import logging
import os
import platform
import shutil
import subprocess
from dataclasses import asdict, dataclass
from functools import lru_cache
from pathlib import Path
from typing import Dict, Mapping, Optional


@dataclass(frozen=True)
class RuntimeDescriptor:
    """Description of how tools should execute for the current host."""

    host_os: str
    distribution: Optional[str]
    requires_container: bool
    container_image: Optional[str]
    launcher_hint: Optional[str]
    notes: tuple[str, ...]

    def to_dict(self) -> Dict[str, object]:
        data = asdict(self)
        # Convert tuple to list for JSON compatibility
        data["notes"] = list(self.notes)
        return data


_LOGGER = logging.getLogger(__name__)

_KALI_IMAGE = "tornado-ai-kali:latest"
_KALI_LAUNCHER = "docker compose -f docker/kali/docker-compose.yml up -d"
_KALI_CONTAINER_NAME = "tornado-ai-kali"

_AUTO_START_ATTEMPTED = False


def _read_os_release(path: Path = Path("/etc/os-release")) -> str:
    try:
        return path.read_text(encoding="utf-8")
    except FileNotFoundError:
        return ""


def _parse_os_id(os_release: str) -> Optional[str]:
    for line in os_release.splitlines():
        if line.startswith("ID="):
            return line.split("=", 1)[1].strip().strip('"')
    return None


def detect_kali_runtime(
    platform_system: Optional[str] = None,
    os_release: Optional[str] = None,
    env: Optional[Mapping[str, str]] = None,
) -> RuntimeDescriptor:
    system = (platform_system or platform.system()).lower()
    release_blob = os_release if os_release is not None else _read_os_release()
    distro = _parse_os_id(release_blob)
    environ = env if env is not None else os.environ

    override = environ.get("TORNADO_KALI_MODE", "").strip().lower()
    notes: list[str] = []

    requires_container = False
    if override in {"force-container", "container"}:
        requires_container = True
        notes.append("Runtime forced into Kali container mode via TORNADO_KALI_MODE")
    elif override in {"force-host", "host"}:
        requires_container = False
        notes.append("Runtime forced to host execution via TORNADO_KALI_MODE")
    elif system == "windows":
        requires_container = True
        notes.append("Windows hosts delegate tool execution to the Kali GUI container")
    else:
        if system == "linux" and distro == "kali":
            notes.append("Native Kali Linux installation detected; host execution enabled")
        else:
            notes.append("Host supports native execution; Kali container optional")

    if requires_container:
        _auto_start_if_enabled(environ)

    container_image = _KALI_IMAGE if requires_container else None
    launcher = _KALI_LAUNCHER if requires_container else None

    return RuntimeDescriptor(
        host_os=system,
        distribution=distro,
        requires_container=requires_container,
        container_image=container_image,
        launcher_hint=launcher,
        notes=tuple(notes),
    )


class KaliToolRuntime:
    """Singleton helper for describing tool runtime behaviour."""

    def __init__(self) -> None:
        self._descriptor = self._detect()

    @staticmethod
    @lru_cache(maxsize=1)
    def _detect() -> RuntimeDescriptor:
        return detect_kali_runtime()

    def describe(self) -> RuntimeDescriptor:
        return self._descriptor

    def refresh(self) -> RuntimeDescriptor:
        # bust cache to recompute detection (useful for long running processes/tests)
        self._detect.cache_clear()  # type: ignore[attr-defined]
        self._descriptor = self._detect()
        return self._descriptor


tool_runtime = KaliToolRuntime()

__all__ = ["RuntimeDescriptor", "detect_kali_runtime", "tool_runtime"]


def _auto_start_if_enabled(environ: Mapping[str, str]) -> None:
    """Start the Kali container when auto-start is enabled."""

    if not _should_auto_start(environ):
        return

    _ensure_kali_container(environ)


def _should_auto_start(environ: Mapping[str, str]) -> bool:
    flag = environ.get("TORNADO_KALI_AUTOSTART", "1").strip().lower()
    return flag not in {"0", "false", "no", "off"}


def _ensure_kali_container(environ: Mapping[str, str]) -> None:
    global _AUTO_START_ATTEMPTED

    if _AUTO_START_ATTEMPTED:
        return

    _AUTO_START_ATTEMPTED = True

    docker_binary = shutil.which("docker")
    if not docker_binary:
        _LOGGER.warning(
            "Docker binary not found; unable to auto-start Kali container. "
            "Set TORNADO_KALI_AUTOSTART=0 to disable this warning."
        )
        return

    if _is_container_running(docker_binary):
        _LOGGER.debug("Kali container already running; auto-start skipped")
        return

    compose_cmd = [
        docker_binary,
        "compose",
        "-f",
        str(Path("docker/kali/docker-compose.yml")),
        "up",
        "-d",
        "--pull",
        "missing",
    ]

    try:
        subprocess.run(
            compose_cmd,
            check=True,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
        )
        _LOGGER.info("Started Kali GUI container via docker compose")
    except (OSError, subprocess.CalledProcessError) as exc:
        _LOGGER.error("Failed to start Kali GUI container: %s", exc)


def _is_container_running(docker_binary: str) -> bool:
    ps_cmd = [
        docker_binary,
        "ps",
        "-q",
        "-f",
        f"name={_KALI_CONTAINER_NAME}",
    ]

    try:
        result = subprocess.run(
            ps_cmd,
            check=True,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
        )
        return bool(result.stdout.strip())
    except (OSError, subprocess.CalledProcessError):
        return False
