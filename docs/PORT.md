# Port-Konfiguration

**Projekt:** campus.mojo  
**Domain:** campus.mojo-institut.de  
**Status:** 🚀 Docker + Traefik

## Service-Details

| Service | Container | Interner Port | Traefik Route | Beschreibung |
|---------|-----------|---------------|---------------|--------------|
| **Frontend** | campus-frontend | 3000 | `campus.mojo-institut.de` | Next.js App Router |
| **LMS API** | campus-api | 3001 | `campus.mojo-institut.de/api/*` | Fastify REST API |
| **Directus** | campus-directus | 8055 | `campus.mojo-institut.de/cms/*` | Content Management |
| **PostgreSQL** | campus-db | 5432 | Nur intern | Datenbank |

## Öffentlicher Zugriff (HTTPS)

- **Frontend:** https://campus.mojo-institut.de/
- **API:** https://campus.mojo-institut.de/api/
- **Directus Admin:** https://campus.mojo-institut.de/cms/admin/
- **API Health:** https://campus.mojo-institut.de/api/health

## Lokaler Zugriff (Development)

```bash
# Mit docker-compose.dev.yml
curl http://localhost:3000/       # Frontend
curl http://localhost:3001/health # API
curl http://localhost:8055/admin  # Directus Admin
psql -h localhost -p 5433 -U campus campus_lms  # PostgreSQL
```

## Docker + Traefik Routing

Das Projekt verwendet das serverseitige Traefik-Setup:

- **Netzwerk:** `mojo-campus-network`
- **Traefik:** Automatisches Routing über Docker Labels
- **SSL:** Let's Encrypt via Traefik

### Start-Befehle

```bash
# Production
cd /root/projects/campus.mojo
docker compose up -d

# Development (mit lokalem Port-Expose)
docker compose -f docker-compose.yml -f docker-compose.dev.yml up

# Logs anzeigen
docker compose logs -f

# Status prüfen
docker compose ps
```

### Netzwerk-Setup

```bash
# Netzwerk erstellen (einmalig)
docker network create mojo-campus-network

# Traefik mit Netzwerk verbinden (einmalig)
docker network connect mojo-campus-network mojo-traefik
```

**Zuletzt aktualisiert:** $(date +%Y-%m-%d)


