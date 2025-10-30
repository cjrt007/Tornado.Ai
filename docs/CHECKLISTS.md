# Checklist Management

Tornado.ai ships with default OWASP-aligned checklists and allows importing custom CSV-based
checklists. Checklist items follow the schema defined in `src/shared/types.ts` and support
tracking of status, severity, evidence attachments, and tester attribution.

## Default Checklists

1. **OWASP Web Application Testing** — imported from the official testing guide.
2. **OWASP Mobile Application Testing** — sourced from the MASTG project.
3. **OWASP Cheat Sheet Series** — provides reference-oriented tasks.

## Features

- CSV import/export with evidence retention.
- Progress tracking across `not_started`, `in_progress`, `completed`, `not_applicable`.
- Bulk update utilities to accelerate repetitive workflows.
- Evidence attachment references and note taking per item.

Future iterations will integrate with the reporting module to embed checklist outcomes into
executive and technical report templates.
