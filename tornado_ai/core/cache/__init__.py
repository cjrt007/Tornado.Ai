"""In-memory content addressed cache."""
from __future__ import annotations

from collections import OrderedDict
from dataclasses import dataclass
from hashlib import sha256
from time import time
from typing import Dict, Generic, Optional, TypeVar

T = TypeVar("T")


@dataclass
class _CacheEntry(Generic[T]):
    value: T
    expires_at: float
    last_access: float


class ContentAddressedCache(Generic[T]):
    """A TTL cache keyed by the hash of the payload."""

    def __init__(self, default_ttl_seconds: int, max_entries: int = 256) -> None:
        self._default_ttl = default_ttl_seconds
        self._store: Dict[str, _CacheEntry[T]] = {}
        self._order: "OrderedDict[str, None]" = OrderedDict()
        self._max_entries = max_entries
        self._hits = 0
        self._misses = 0
        self._evictions = 0

    @staticmethod
    def key_for(tool_id: str, params: Optional[object]) -> str:
        stable = repr(params if params is not None else {})
        payload = f"{tool_id}:{stable}"
        digest = sha256(payload.encode("utf-8"))
        return digest.hexdigest()

    def set(self, key: str, value: T, ttl_seconds: Optional[int] = None) -> None:
        ttl = ttl_seconds if ttl_seconds is not None else self._default_ttl
        now = time()
        self._store[key] = _CacheEntry(value=value, expires_at=now + ttl, last_access=now)
        self._order[key] = None
        self._order.move_to_end(key)
        self._evict_if_needed()

    def get(self, key: str) -> Optional[T]:
        entry = self._store.get(key)
        if entry is None:
            self._misses += 1
            return None
        if time() > entry.expires_at:
            self._store.pop(key, None)
            self._order.pop(key, None)
            self._misses += 1
            return None
        entry.last_access = time()
        self._order.move_to_end(key)
        self._hits += 1
        return entry.value

    def invalidate(self, key: str) -> None:
        if key in self._store:
            self._store.pop(key, None)
            self._order.pop(key, None)

    def purge_expired(self) -> None:
        now = time()
        expired = [key for key, entry in self._store.items() if entry.expires_at < now]
        for key in expired:
            self.invalidate(key)

    def _evict_if_needed(self) -> None:
        self.purge_expired()
        while len(self._store) > self._max_entries:
            oldest_key, _ = self._order.popitem(last=False)
            self._store.pop(oldest_key, None)
            self._evictions += 1

    def stats(self) -> Dict[str, int]:
        return {
            "size": len(self._store),
            "hits": self._hits,
            "misses": self._misses,
            "evictions": self._evictions,
            "capacity": self._max_entries,
        }
