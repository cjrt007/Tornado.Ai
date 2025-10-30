# Deployment Guide

1. Provision infrastructure with Node.js 18+, SQLite or PostgreSQL, and configure
   environment variables from `.env.example`.
2. Install dependencies with `pnpm install` and build the project using `pnpm build`.
3. Launch the Fastify server with `node dist/server.js` or a process manager.
4. Configure HTTPS termination and load balancing as required.
5. For production, enable PostgreSQL by setting `DATABASE_TYPE=postgres` and providing the
   connection string via environment variables.
6. Deploy the React UI (in `ui/`) using a static hosting provider or containerized runtime.
7. Monitor logs (Pino) and metrics endpoints for observability, and configure audit log
   storage in the `data/` directory or an external logging service.
