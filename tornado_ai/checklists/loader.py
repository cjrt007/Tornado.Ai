"""Checklist loader that defaults to OWASP Top 10 web and mobile data."""
from __future__ import annotations

import csv
from pathlib import Path
from typing import Dict, Iterable, List

from ..shared.types import ChecklistEntryTemplate, ChecklistTemplate

DATA_DIR = Path(__file__).resolve().parent.parent / "data" / "checklists"

_DEFAULT_TEMPLATES = {
    "owasp_web_top10": DATA_DIR / "owasp_web_top10.csv",
    "owasp_mobile_top10": DATA_DIR / "owasp_mobile_top10.csv",
}


def _load_csv(path: Path, template_id: str, domain: str) -> ChecklistTemplate:
    items: List[ChecklistEntryTemplate] = []
    with path.open(encoding="utf-8") as handle:
        reader = csv.DictReader(handle)
        for row in reader:
            items.append(
                ChecklistEntryTemplate(
                    id=row["id"],
                    title=row["title"],
                    category=row["category"],
                    description=row["description"],
                    severity=row["severity"],
                    references=[ref.strip() for ref in row["references"].split(" ") if ref],
                )
            )
    return ChecklistTemplate(
        id=template_id,
        name="OWASP " + ("Web" if domain == "web" else "Mobile") + " Top 10",
        source=str(path),
        domain="web" if domain == "web" else "mobile",
        items=items,
    )


def default_templates() -> Dict[str, ChecklistTemplate]:
    return {
        "web": _load_csv(_DEFAULT_TEMPLATES["owasp_web_top10"], "owasp_web_top10", "web"),
        "mobile": _load_csv(_DEFAULT_TEMPLATES["owasp_mobile_top10"], "owasp_mobile_top10", "mobile"),
    }


def load_from_csv(path: Path, template_id: str, domain: str) -> ChecklistTemplate:
    return _load_csv(path, template_id, domain)


__all__ = ["default_templates", "load_from_csv"]
