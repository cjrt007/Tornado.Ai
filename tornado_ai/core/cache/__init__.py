"""In-memory content addressed cache."""
from __future__ import annotations

from dataclasses import dataclass
from hashlib import sha256
from time import time
from typing import Dict, Generic, Optional, TypeVar

T = TypeVar("T")


@dataclass
class _CacheEntry(Generic[T]):
    value: T
    expires_at: float


class ContentAddressedCache(Generic[T]):
    """A TTL cache keyed by the hash of the payload."""

    def __init__(self, default_ttl_seconds: int) -> None:
        self._default_ttl = default_ttl_seconds
        self._store: Dict[str, _CacheEntry[T]] = {}

    @staticmethod
    def key_for(tool_id: str, params: Optional[object]) -> str:
        stable = repr(params if params is not None else {})
        payload = f"{tool_id}:{stable}"
        digest = sha256(payload.encode("utf-8"))
        return digest.hexdigest()

    def set(self, key: str, value: T, ttl_seconds: Optional[int] = None) -> None:
        ttl = ttl_seconds if ttl_seconds is not None else self._default_ttl
        self._store[key] = _CacheEntry(value=value, expires_at=time() + ttl)

    def get(self, key: str) -> Optional[T]:
        entry = self._store.get(key)
        if entry is None:
            return None
        if time() > entry.expires_at:
            self._store.pop(key, None)
            return None
        return entry.value

    def stats(self) -> Dict[str, int]:
        return {"size": len(self._store)}
