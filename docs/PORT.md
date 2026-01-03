# Routing (Traefik) & interne Ports

> **⚠️ WICHTIG:** Siehe `/MOJO/PORT-CONVENTIONS.md` für zentrale Portkonventionen im MOJO-Ökosystem.

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

## Lokales Development (OHNE Docker für Frontend/API)

> **⚠️ WICHTIG:** Lokale Entwicklung läuft **OHNE Docker** für Frontend und API (Hot Reload mit `npm run dev`).  
> Nur die Datenbank läuft in Docker. Staging/Production nutzen Docker + Traefik.

**Setup:**
- Frontend: `npm run dev` auf Port **3002** (lokal, kein Docker)
- API: `npm run dev` auf Port **3003** (lokal, kein Docker)
- Database: Docker Container auf Port **5434** (siehe `docker-compose.local-db.yml`)
- Directus: Optional in Docker auf Port **8055** (falls benötigt)

> **Portkonventionen:** Diese Ports sind gemäß `/MOJO/PORT-CONVENTIONS.md` zugewiesen, um Konflikte mit anderen MOJO-Projekten zu vermeiden.

| Local URL | Service | Host-Port | Interner Port |
|----------|---------|-----------|---------------|
| `http://localhost:3002` | Frontend | **3002** | 3000 |
| `http://localhost:3003` | API | **3003** | 3001 |
| `http://localhost:3003/health` | API Health | **3003** | 3001 |
| `http://localhost:8055/admin` | Directus Admin | **8055** | 8055 |
| `postgres://localhost:5434` | DB | **5434** | 5432 |

**Hinweis:** Die Ports 3002, 3003 und 5434 wurden gewählt, um Konflikte mit `payments.mojo` (Ports 3000, 5433) zu vermeiden.

> Hinweis: Das Repo nutzt ein Docker-Netzwerk `mojo-network`. Wenn es extern definiert ist (Compose: `external: true`), muss es vorher existieren: `docker network create mojo-network`.

