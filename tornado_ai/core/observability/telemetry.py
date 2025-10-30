"""Observability utilities for structured telemetry."""
from __future__ import annotations

from collections import defaultdict
from contextlib import contextmanager
from dataclasses import dataclass, field
from statistics import mean
from time import perf_counter
from typing import Any, Dict, Iterator


@dataclass
class Histogram:
    name: str
    values: list[float] = field(default_factory=list)

    def observe(self, value: float) -> None:
        self.values.append(value)

    def snapshot(self) -> Dict[str, Any]:
        if not self.values:
            return {"count": 0, "avg": 0.0, "p95": 0.0, "min": 0.0, "max": 0.0}
        ordered = sorted(self.values)
        idx = int(0.95 * (len(ordered) - 1)) if ordered else 0
        return {
            "count": len(self.values),
            "avg": mean(self.values),
            "p95": ordered[idx],
            "min": ordered[0],
            "max": ordered[-1],
        }


@dataclass
class SpanRecord:
    name: str
    duration: float
    attributes: Dict[str, Any]


class TelemetryCenter:
    """Central telemetry sink with counters, histograms, and spans."""

    def __init__(self) -> None:
        self._counters: Dict[str, float] = defaultdict(float)
        self._histograms: Dict[str, Histogram] = {}
        self._spans: list[SpanRecord] = []

    def increment_counter(self, name: str, value: float = 1.0) -> None:
        self._counters[name] += value

    def observe_latency(self, name: str, latency: float) -> None:
        histogram = self._histograms.setdefault(name, Histogram(name))
        histogram.observe(latency)

    @contextmanager
    def span(self, name: str, **attributes: Any) -> Iterator[None]:
        start = perf_counter()
        try:
            yield
        finally:
            duration = perf_counter() - start
            self._spans.append(SpanRecord(name=name, duration=duration, attributes=attributes))
            self.observe_latency(f"span.{name}", duration)

    def reset(self) -> None:
        self._counters.clear()
        self._histograms.clear()
        self._spans.clear()

    def snapshot(self) -> Dict[str, Any]:
        return {
            "counters": dict(self._counters),
            "histograms": {name: histogram.snapshot() for name, histogram in self._histograms.items()},
            "spans": [
                {
                    "name": span.name,
                    "duration": span.duration,
                    "attributes": span.attributes,
                }
                for span in self._spans[-50:]
            ],
        }


telemetry_center = TelemetryCenter()


__all__ = ["telemetry_center", "TelemetryCenter", "Histogram", "SpanRecord"]
