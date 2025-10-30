"""Runtime detection for tool execution environments."""
from __future__ import annotations

import os
import platform
from dataclasses import dataclass, asdict
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


_KALI_IMAGE = "tornado-ai-kali:latest"
_KALI_LAUNCHER = "docker compose -f docker/kali/docker-compose.yml up -d"


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
    environ = env or os.environ

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
