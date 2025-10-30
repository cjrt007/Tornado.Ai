"""Smart Caching Manager (SCM) built on the content-addressed cache."""
from __future__ import annotations

from dataclasses import dataclass
from typing import Any, Dict, Optional

from . import ContentAddressedCache


@dataclass
class CacheResult:
    key: str
    value: Any
    cached: bool


class SmartCachingManager:
    def __init__(self, default_ttl_seconds: int = 300, max_entries: int = 256) -> None:
        self._cache: ContentAddressedCache[Any] = ContentAddressedCache(
            default_ttl_seconds=default_ttl_seconds, max_entries=max_entries
        )

    def resolve(self, tool_id: str, params: Optional[Dict[str, Any]], producer) -> CacheResult:
        key = ContentAddressedCache.key_for(tool_id, params)
        cached_value = self._cache.get(key)
        if cached_value is not None:
            return CacheResult(key=key, value=cached_value, cached=True)
        value = producer()
        self._cache.set(key, value)
        return CacheResult(key=key, value=value, cached=False)

    def stats(self) -> Dict[str, int]:
        return self._cache.stats()

    def invalidate(self, tool_id: str, params: Optional[Dict[str, Any]] = None) -> None:
        key = ContentAddressedCache.key_for(tool_id, params)
        self._cache.invalidate(key)


scm = SmartCachingManager()


__all__ = ["SmartCachingManager", "CacheResult", "scm"]
