from tornado_ai.core.cache import ContentAddressedCache


def test_cache_store_and_retrieve():
    cache: ContentAddressedCache[str] = ContentAddressedCache(default_ttl_seconds=60)
    key = ContentAddressedCache.key_for("tool", {"a": 1})
    cache.set(key, "value", ttl_seconds=60)
    assert cache.get(key) == "value"
