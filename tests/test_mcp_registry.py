from tornado_ai.mcp.registry import list_tool_definitions, registry_as_json_schemas, registry_size


def test_registry_size_matches_definitions():
    definitions = list_tool_definitions()
    assert registry_size() == len(definitions)
    assert all(defn.id.endswith('.sim') for defn in definitions)
    schemas = registry_as_json_schemas()
    assert schemas[0]["input_schema"]
