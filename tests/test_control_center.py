from tornado_ai.core.control.center import ControlCenter


def test_default_surface_contains_expected_elements():
    center = ControlCenter()
    snapshot = center.snapshot()
    assert len(snapshot.features) > 0
    assert any(role.role == "admin" for role in snapshot.roles)
    assert len(snapshot.scanProfiles) > 0


def test_feature_updates_are_applied():
    center = ControlCenter()
    feature = center.snapshot().features[0]
    center.update_features([{"id": feature.id, "enabled": not feature.enabled}])
    updated = center.snapshot()
    updated_feature = next(item for item in updated.features if item.id == feature.id)
    assert updated_feature.enabled is (not feature.enabled)


def test_role_enforcement_patch_merges():
    center = ControlCenter()
    center.update_roles(
        [
            {
                "role": "viewer",
                "enforcement": {"mfaRequired": True, "sessionTimeoutMinutes": 45},
            }
        ]
    )
    updated = next(role for role in center.snapshot().roles if role.role == "viewer")
    assert updated.enforcement.mfaRequired is True
    assert updated.enforcement.sessionTimeoutMinutes == 45


def test_scan_profile_guardrails_can_be_updated():
    center = ControlCenter()
    profile = center.snapshot().scanProfiles[0]
    center.update_scan_profiles(
        [
            {
                "id": profile.id,
                "guardrails": {
                    "approvalsRequired": False,
                    "approvalsNeeded": 0,
                    "safeMode": False,
                    "maxParallelTasks": 5,
                },
            }
        ]
    )
    updated = next(p for p in center.snapshot().scanProfiles if p.id == profile.id)
    assert updated.guardrails.safeMode is False
    assert updated.guardrails.maxParallelTasks == 5
