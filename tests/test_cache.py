import time

from tornado_ai.core.cache import ContentAddressedCache


def test_cache_store_and_retrieve():
    cache: ContentAddressedCache[str] = ContentAddressedCache(default_ttl_seconds=60, max_entries=2)
    key = ContentAddressedCache.key_for("tool", {"a": 1})
    cache.set(key, "value", ttl_seconds=60)
    assert cache.get(key) == "value"
    stats = cache.stats()
    assert stats["hits"] == 1
    assert stats["misses"] == 0


def test_cache_ttl_and_lru_evicts_old_entries():
    cache: ContentAddressedCache[str] = ContentAddressedCache(default_ttl_seconds=1, max_entries=2)
    first = ContentAddressedCache.key_for("tool", {"index": 1})
    second = ContentAddressedCache.key_for("tool", {"index": 2})
    third = ContentAddressedCache.key_for("tool", {"index": 3})

    cache.set(first, "a")
    cache.set(second, "b")
    cache.set(third, "c")

    assert cache.get(first) is None  # evicted via LRU
    assert cache.get(second) == "b"

    time.sleep(1.1)
    assert cache.get(third) is None  # expired via TTL
    stats = cache.stats()
    assert stats["evictions"] >= 1
