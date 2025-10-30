# Tornado.ai API Overview

| Method | Path                                | Description                                   |
| ------ | ----------------------------------- | --------------------------------------------- |
| POST   | /api/auth/register                  | Register a new user account                   |
| POST   | /api/auth/login                     | Authenticate and obtain JWT                   |
| POST   | /api/auth/logout                    | Invalidate current session                    |
| POST   | /api/auth/mfa/setup                 | Begin MFA setup flow                          |
| POST   | /api/auth/mfa/verify                | Verify MFA token                              |
| POST   | /api/auth/mfa/disable               | Disable MFA for current user                  |
| GET    | /api/auth/me                        | Retrieve authenticated user profile           |
| GET    | /health                             | Service health check                          |
| POST   | /api/intelligence/analyze-target    | Analyze target and build plan                 |
| POST   | /api/intelligence/select-tools      | Generate recommended tool plan                |
| POST   | /api/intelligence/optimize-parameters | Optimize tool parameters                     |
| POST   | /api/command                        | Execute a tool with approval context          |
| GET    | /api/telemetry                      | Fetch counters and histograms                 |
| GET    | /api/cache/stats                    | Cache metrics                                  |
| GET    | /api/processes/list                 | List execution processes                       |
| GET    | /api/processes/status/:id           | Inspect process status                         |
| POST   | /api/processes/terminate/:id        | Terminate process                              |
| GET    | /api/viz/dashboard                  | Dashboard data                                 |
| GET    | /api/viz/vuln-card/:id              | Vulnerability card detail                      |
| GET    | /api/checklists                     | List checklists                                |
| POST   | /api/checklists                     | Create checklist                               |
| GET    | /api/checklists/:id                 | Retrieve checklist                             |
| PUT    | /api/checklists/:id                 | Update checklist                               |
| DELETE | /api/checklists/:id                 | Delete checklist                               |
| POST   | /api/checklists/:id/import          | Import CSV checklist                           |
| GET    | /api/checklists/:id/export          | Export checklist                               |
| PATCH  | /api/checklists/:id/items/:itemId   | Update checklist item                          |
| GET    | /api/reports                        | List generated reports                         |
| POST   | /api/reports/generate               | Generate report                                |
| GET    | /api/reports/:id                    | Download report                                |
| DELETE | /api/reports/:id                    | Delete report                                  |
| GET    | /api/users                          | List users (admin)                             |
| POST   | /api/users                          | Create user (admin)                            |
| GET    | /api/users/:id                      | Get user (admin)                               |
| PUT    | /api/users/:id                      | Update user (admin)                            |
| DELETE | /api/users/:id                      | Delete user (admin)                            |
