from tornado_ai.shared.types import SecurityToolsCollection
from tornado_ai.tools.catalog import security_tools_collection


def test_catalog_matches_schema():
    assert isinstance(security_tools_collection, SecurityToolsCollection)


def test_category_counts_align_with_statistics():
    assert len(security_tools_collection.categories) == security_tools_collection.statistics.total_categories


def test_reported_tool_counts_are_consistent():
    total_listed = sum(len(cat.tools) for cat in security_tools_collection.categories)
    for category in security_tools_collection.categories:
        assert len(category.tools) <= category.tool_count
    assert total_listed <= security_tools_collection.statistics.total_tools
