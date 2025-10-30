# syntax=docker/dockerfile:1

FROM node:18-bullseye AS build
WORKDIR /app

ENV COREPACK_ENABLE_DOWNLOAD_PROMPT=0

COPY . .

RUN corepack enable \
 && corepack prepare pnpm@10.20.0 --activate \
 && pnpm install \
 && pnpm build

FROM node:18-bullseye AS runtime
WORKDIR /app
ENV NODE_ENV=production

COPY --from=build /app/package.json ./
COPY --from=build /app/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/.env.example ./.env.example

EXPOSE 7700
CMD ["node", "dist/server.js"]
