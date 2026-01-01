# Routing (Traefik) & interne Ports

Dieses Dokument beschreibt **das Traefik-Routing** in Staging/Production (Default) sowie die **internen Service-Ports** innerhalb des Docker-Netzwerks.
Port-Mappings auf den Host (`ports:` in Compose) sind **nur für lokales Development** nötig/gedacht.

## Services & interne Ports

| Service | Container | Interner Port | Zweck |
|--------|-----------|---------------|------|
| PostgreSQL | `campus-db*` | `5432` | Datenbank |
| Directus | `campus-directus*` | `8055` | CMS Admin + API |
| LMS API (Fastify) | `campus-api*` | `3001` | REST API |
| Frontend (Next.js) | `campus-frontend*` | `3000` | Web-App |

## Traefik Routing (Staging/Production)

Die Deployments sind für Traefik ausgelegt (Labels in `docker-compose*.yml`). In Staging/Production werden Services **im Regelfall nicht direkt via Host-Ports exponiert**, sondern ausschließlich über Traefik geroutet.

### Production (`campus.mojo-institut.de`)

| Public Route | Zielservice | Hinweis |
|------------|-------------|--------|
| `/` | Frontend | Catch-all (ohne `/api`, `/cms`, `/health`) |
| `/api/*` | API | Strip-Prefix `/api` |
| `/cms/*` | Directus | Strip-Prefix `/cms` |
| `/health` | API | eigener Router für Health |

Relevante Datei: `docker-compose.production.yml` (und/oder `docker-compose.yml` je nach Deployment-Setup).

### Staging (`campus.staging.mojo-institut.de`)

Gleiches Routing wie Production, zusätzlich typischerweise mit Basic-Auth Middleware (siehe Labels).

Relevante Datei: `docker-compose.staging.yml`.

## Optional: Lokales Development (Ports exponieren)

Für lokales Dev **ohne** externen Traefik kannst du Ports direkt auf `localhost` mappen (siehe `docker-compose.dev.yml`). Das ist **nicht** Teil des Server-Deployments.

| Local URL | Service |
|----------|---------|
| `http://localhost:3000` | Frontend |
| `http://localhost:3001` | API |
| `http://localhost:3001/health` | API Health |
| `http://localhost:8055/admin` | Directus Admin |
| `postgres://localhost:5432` | DB (optional, z.B. für lokale Tools) |

> Hinweis: Das Repo nutzt ein Docker-Netzwerk `mojo-network`. Wenn es extern definiert ist (Compose: `external: true`), muss es vorher existieren: `docker network create mojo-network`.

