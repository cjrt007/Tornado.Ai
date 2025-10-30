"""Advanced Process Management Engine (APME)."""
from __future__ import annotations

import itertools
from datetime import datetime, timezone
from typing import Dict, Iterable, List, Optional

from ...shared.types import ProcessRecord, ProcessStatusLiteral


class ProcessManager:
    def __init__(self) -> None:
        self._processes: Dict[str, ProcessRecord] = {}
        self._counter = itertools.count(1)
        self._bootstrap()

    def _bootstrap(self) -> None:
        # Seed synthetic processes for demos
        self.create("Baseline Recon", engine="AAAM", status="running", progress=45.0)
        self.create("Cloud Misconfig Review", engine="IBA", status="queued", progress=5.0)
        self.create("Exploit Development", engine="AEGDEM", status="running", progress=30.0)

    def create(
        self,
        name: str,
        engine: str,
        status: ProcessStatusLiteral,
        progress: float,
        owner: str = "system",
        tags: Optional[Iterable[str]] = None,
    ) -> ProcessRecord:
        now = datetime.now(timezone.utc).isoformat()
        process_id = f"proc-{next(self._counter)}"
        record = ProcessRecord(
            id=process_id,
            name=name,
            engine=engine,  # type: ignore[arg-type]
            status=status,
            progress=progress,
            createdAt=now,
            updatedAt=now,
            owner=owner,
            tags=list(tags or []),
        )
        self._processes[process_id] = record
        return record

    def list(self) -> List[ProcessRecord]:
        return list(self._processes.values())

    def get(self, process_id: str) -> ProcessRecord:
        if process_id not in self._processes:
            raise KeyError(f"Process {process_id} not found")
        return self._processes[process_id]

    def update(self, process_id: str, *, status: ProcessStatusLiteral, progress: float | None = None) -> ProcessRecord:
        record = self.get(process_id)
        updated = record.model_copy(update={
            "status": status,
            "progress": record.progress if progress is None else progress,
            "updatedAt": datetime.now(timezone.utc).isoformat(),
        })
        self._processes[process_id] = updated
        return updated

    def terminate(self, process_id: str) -> ProcessRecord:
        return self.update(process_id, status="terminated", progress=record.progress if (record := self.get(process_id)) else 100.0)


process_manager = ProcessManager()


__all__ = ["process_manager", "ProcessManager"]
