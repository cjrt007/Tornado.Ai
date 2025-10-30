from unittest.mock import patch

from tornado_ai.tools import runtime as runtime_mod
from tornado_ai.tools.runtime import detect_kali_runtime


def test_detect_windows_requires_container():
    runtime_mod._AUTO_START_ATTEMPTED = False
    descriptor = detect_kali_runtime(
        platform_system="Windows",
        os_release="ID=windows\n",
        env={"TORNADO_KALI_AUTOSTART": "0"},
    )
    assert descriptor.requires_container is True
    assert descriptor.container_image == "tornado-ai-kali:latest"
    assert "windows" in descriptor.host_os


def test_detect_kali_linux_prefers_host():
    runtime_mod._AUTO_START_ATTEMPTED = False
    descriptor = detect_kali_runtime(platform_system="Linux", os_release="ID=kali\n", env={})
    assert descriptor.requires_container is False
    assert descriptor.container_image is None


def test_environment_override_forces_container():
    runtime_mod._AUTO_START_ATTEMPTED = False
    descriptor = detect_kali_runtime(
        platform_system="Linux",
        os_release="ID=ubuntu\n",
        env={
            "TORNADO_KALI_MODE": "force-container",
            "TORNADO_KALI_AUTOSTART": "0",
        },
    )
    assert descriptor.requires_container is True
    assert descriptor.container_image == "tornado-ai-kali:latest"


def test_auto_start_invoked_when_enabled():
    runtime_mod._AUTO_START_ATTEMPTED = False
    with patch("tornado_ai.tools.runtime._ensure_kali_container") as starter:
        detect_kali_runtime(
            platform_system="Windows",
            os_release="ID=windows\n",
            env={"TORNADO_KALI_AUTOSTART": "1"},
        )
        starter.assert_called_once()
