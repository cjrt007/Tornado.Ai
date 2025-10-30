# Checklist Management

Tornado.ai now ships with CSV-backed OWASP Top 10 templates for both web and
mobile assessments. The loader in `tornado_ai.checklists.loader` converts those
CSV files into structured `ChecklistTemplate` objects that downstream tooling or
LLM agents can consume.

## Default Templates

- **Web (OWASP Top 10 2021)** – `data/checklists/owasp_web_top10.csv` maps each
  A01–A10 control to a checklist entry with severity guidance and source links.
- **Mobile (OWASP Mobile Top 10 2024)** – `data/checklists/owasp_mobile_top10.csv`
  mirrors the official OWASP spreadsheet with emphasis on platform usage,
  authentication, cryptography, and extraneous functionality.

Fetch both templates via the `/api/checklists/default` endpoint. The response is
JSON shaped like:

```json
{
  "web": {
    "id": "owasp_web_top10",
    "domain": "web",
    "items": [
      {
        "id": "A01",
        "title": "Injection Prevention",
        "severity": "high",
        "references": ["https://owasp.org/Top10/A03_2021-Injection/"]
      }
    ]
  },
  "mobile": { "id": "owasp_mobile_top10", "domain": "mobile", "items": [...] }
}
```

## Extending the Loader

To introduce a custom checklist:

1. Create a CSV with headers `id,title,category,description,severity,references`.
2. Place the file anywhere and call
   `tornado_ai.checklists.loader.load_from_csv(Path(...), "custom_id", "web")`.
3. Serve the resulting `ChecklistTemplate` through a bespoke endpoint or merge it
   with the defaults before responding to agents.

References to the OWASP Testing Guide v5 spreadsheet and the Cheat Sheet Series
are embedded within each default entry to streamline analyst workflows.
