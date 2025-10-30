from tornado_ai.core.policy.rbac import has_permission, list_permissions


def test_admin_has_wildcard_access():
    assert "manage_users" in list_permissions("admin")
    assert has_permission("admin", "configure_system") is True


def test_viewer_is_restricted():
    assert list_permissions("viewer") == ["view_dashboards"]
    assert has_permission("viewer", "execute_tools") is False
