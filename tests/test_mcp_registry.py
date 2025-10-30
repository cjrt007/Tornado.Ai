from tornado_ai.mcp.registry import list_tool_definitions, registry_size


def test_registry_size_matches_definitions():
    definitions = list_tool_definitions()
    assert registry_size() == len(definitions)
    assert all(defn.id.endswith('.sim') for defn in definitions)
