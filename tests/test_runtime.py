from tornado_ai.tools.runtime import detect_kali_runtime


def test_detect_windows_requires_container():
    descriptor = detect_kali_runtime(platform_system="Windows", os_release="ID=windows\n", env={})
    assert descriptor.requires_container is True
    assert descriptor.container_image == "tornado-ai-kali:latest"
    assert "windows" in descriptor.host_os


def test_detect_kali_linux_prefers_host():
    descriptor = detect_kali_runtime(platform_system="Linux", os_release="ID=kali\n", env={})
    assert descriptor.requires_container is False
    assert descriptor.container_image is None


def test_environment_override_forces_container():
    descriptor = detect_kali_runtime(
        platform_system="Linux",
        os_release="ID=ubuntu\n",
        env={"TORNADO_KALI_MODE": "force-container"},
    )
    assert descriptor.requires_container is True
    assert descriptor.container_image == "tornado-ai-kali:latest"
