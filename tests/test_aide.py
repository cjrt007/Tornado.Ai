from tornado_ai.core.decision import aide
from tornado_ai.shared.types import PriorToolResult, TargetProfile


def make_profile(**overrides):
    base = {
        "targetId": "app-01",
        "assetKind": "webapp",
        "environment": "staging",
        "cvss": 7.2,
        "criticality": "high",
        "tags": [],
        "description": None,
        "metadata": {},
    }
    base.update(overrides)
    return TargetProfile.model_validate(base)


def test_aide_returns_plan_and_graph():
    profile = make_profile()
    history: list[PriorToolResult] = []
    result = aide.analyze(profile, history)
    assert result.plan.steps
    categories = {step.category for step in result.plan.steps}
    assert "webapp" in categories
    assert result.graph.nodes
    assert result.recommendedConcurrency >= 1


def test_aide_skips_successful_tools():
    profile = make_profile()
    history = [
        PriorToolResult.model_validate(
            {
                "toolId": "nuclei_scan.sim",
                "success": True,
                "findings": [],
                "severity": "medium",
            }
        )
    ]
    result = aide.analyze(profile, history)
    ids = {step.toolId for step in result.plan.steps}
    assert "nuclei_scan.sim" not in ids
