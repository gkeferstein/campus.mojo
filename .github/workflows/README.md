# CI/CD Pipelines für campus.mojo

Dieses Projekt verwendet zwei separate CI/CD Pipelines:

1. **Basis-Pipeline** (`ci-cd.yml`) - Für `main` und `develop` Branches
2. **Release-Pipeline** (`ci-release.yml`) - Für Version Tags wie `v1.0.0`

## Basis-Pipeline (ci-cd.yml)

**Trigger:** Push zu `main` oder `develop` Branch

**Ziele:**
- ✅ Schnelle Feedback-Schleife (~10-15 Minuten)
- ✅ Basis-Qualitätsprüfungen
- ✅ Automatisches Deployment

**Pipeline-Übersicht:**
```
┌──────────────┐
│ Code Quality │ ──┐
│ (parallel)   │   │
└──────────────┘   │
                   ├─► Build Images ──► Deploy ──► Smoke Tests
┌──────────────┐   │
│ Backend      │ ──┤
│ Tests        │   │
└──────────────┘   │
                   │
┌──────────────┐   │
│ Frontend     │ ──┤
│ Checks       │   │
│ (conditional)│   │
└──────────────┘   │
                   │
┌──────────────┐   │
│ Database     │ ──┘
│ Checks       │
└──────────────┘
```

### Stages

#### 1. Code Quality Checks (parallel)
- **Matrix-Strategy** für beide Packages (api, frontend)
- TypeScript Compile Check
- ESLint
- Security Audit (High/Critical only)

#### 2. Backend Tests (parallel)
- Unit Tests mit Coverage
- PostgreSQL Service für Tests
- Prisma Migration Setup

#### 3. Frontend Checks (parallel, conditional)
- **Path-basiert:** Nur bei Änderungen in `packages/frontend/`
- Type Check
- Lint
- Build Test

#### 4. Database Checks (parallel)
- Prisma Migration Status
- Schema Validation

#### 5. Build & Push Docker Images
- **API Image:** `ghcr.io/{repo}/campus.mojo-api:latest`
- **Frontend Image:** `ghcr.io/{repo}/campus.mojo-frontend:latest`
- Environment-basierte Build-Args (main = prod, develop = dev)

#### 6. Auto-Deploy
- **main** → Production (`campus.mojo-institut.de`)
- **develop** → Development (`dev.campus.mojo-institut.de`)
- Docker Compose Deployment
- Health-Checks mit Rollback
- Prisma Migrations

#### 7. Smoke Tests
- API Health Check (`/api/health`)
- Frontend Check
- Directus CMS Check (optional)

## Branch-Strategie

| Branch | Deployment | Zielumgebung | URL |
|--------|------------|--------------|-----|
| `main` | ✅ Automatisch | Production | `https://campus.mojo-institut.de` |
| `develop` | ✅ Automatisch | Staging | `https://dev.campus.mojo-institut.de` |
| `feature/*` | ❌ Kein Auto-Deploy | Lokal | - |

## Erforderliche GitHub Secrets

### Basis-Pipeline (ci-cd.yml)

| Secret | Beschreibung | Pflicht |
|--------|-------------|---------|
| `DEPLOY_SERVER` | Server-IP oder Hostname | ✅ Ja |
| `SSH_PRIVATE_KEY` | SSH Private Key für Deployment | ✅ Ja |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk Publishable Key (für Frontend Build) | ✅ Ja |
| `EMAIL_USERNAME` | SMTP Username (optional, für Notifications) | ❌ Nein |
| `EMAIL_PASSWORD` | SMTP Password (optional) | ❌ Nein |
| `EMAIL_RECIPIENT` | Empfänger-Email (optional) | ❌ Nein |

### Release-Pipeline (ci-release.yml)

| Secret | Beschreibung | Pflicht |
|--------|-------------|---------|
| `DEPLOY_SERVER` | Server-IP oder Hostname | ✅ Ja |
| `SSH_PRIVATE_KEY` | SSH Private Key für Deployment | ✅ Ja |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk Publishable Key | ✅ Ja |
| `EMAIL_USERNAME` | SMTP Username (optional) | ❌ Nein |
| `EMAIL_PASSWORD` | SMTP Password (optional) | ❌ Nein |
| `EMAIL_RECIPIENT` | Empfänger-Email (optional) | ❌ Nein |

**Setup in GitHub:**
1. Repository → Settings → Secrets and variables → Actions
2. "New repository secret" klicken
3. Secrets hinzufügen

## Unterschiede zu payments.mojo

### Monorepo-spezifisch

1. **Matrix-Strategy für Packages:**
   - Code Quality Checks für beide Packages parallel
   - Separate Tests für API und Frontend

2. **Docker Compose Deployment:**
   - Verwendet `docker-compose.yml` statt einzelner Container
   - Startet alle Services: db, directus, api, frontend
   - Health-Checks für alle Container

3. **Prisma statt Knex:**
   - `prisma migrate deploy` statt `knex migrate:latest`
   - `prisma validate` für Schema-Validierung
   - `prisma migrate status` für Migration-Checks

4. **Next.js Frontend:**
   - Next.js Build statt Vite
   - Environment-Variablen für Next.js (`NEXT_PUBLIC_*`)
   - Design-System Checkout (optional)

5. **Path-basierte Optimierungen:**
   - Frontend-Checks nur bei Änderungen in `packages/frontend/`
   - Reduziert Pipeline-Zeit bei Backend-only Changes

6. **Environment-basierte Deployment:**
   - `main` → Production automatisch
   - `develop` → Development automatisch
   - Automatische URL-Erkennung

## Troubleshooting

### Deployment schlägt fehl

1. **SSH-Verbindung prüfen:**
   ```bash
   ssh -i ~/.ssh/deploy_key root@$DEPLOY_SERVER
   ```

2. **Docker Network prüfen:**
   ```bash
   docker network inspect mojo-network
   ```

3. **Container-Logs prüfen:**
   ```bash
   cd /root/projects/campus.mojo
   docker compose logs
   ```

### Health-Checks schlagen fehl

1. **API nicht erreichbar:**
   - Prüfe API-Container: `docker compose ps api`
   - Prüfe Logs: `docker compose logs api`
   - Prüfe Traefik-Routing

2. **Frontend nicht erreichbar:**
   - Prüfe Frontend-Container: `docker compose ps frontend`
   - Prüfe Build-Logs: `docker compose logs frontend`

3. **Directus nicht erreichbar:**
   - Nicht kritisch, aber prüfe: `docker compose logs directus`

## Manuelles Deployment

Falls die Pipeline nicht verwendet wird:

```bash
cd /root/projects/campus.mojo
git pull origin main  # oder develop
docker compose down
docker compose build --no-cache
docker compose up -d
```

## Release-Pipeline (ci-release.yml)

**Trigger:** Push von Tags im Format `v1.0.0` oder manuell via `workflow_dispatch`

**Ziele:**
- ✅ Umfassende Qualitätssicherung
- ✅ Production-Ready Validierung
- ✅ Automatisches Release & Deployment

**Pipeline-Übersicht:**
```
┌──────────────┐
│ Prepare      │
│ Release      │
└──────┬───────┘
       │
       ├─► Code Quality (Strict) ──┐
       ├─► Backend Tests ──────────┤
       ├─► Frontend Tests ──────────┤
       ├─► Security Scans ──────────┤
       └─► Migration Tests ────────┤
                                   │
                                   ▼
                          ┌─────────────────┐
                          │ Build & Push    │
                          │ Docker Images   │
                          └────────┬────────┘
                                   │
                                   ▼
                          ┌─────────────────┐
                          │ Create Release  │
                          └────────┬────────┘
                                   │
                                   ▼
                          ┌─────────────────┐
                          │ Deploy Prod     │
                          └─────────────────┘
```

**Schritte:**

1. **Prepare Release**
   - Version-Extraktion aus Tag
   - Version-Validierung (Format: v1.0.0)

2. **Strict Code Quality** (parallel)
   - Strict TypeScript Checks für beide Packages
   - ESLint
   - Dependency Vulnerability Scans

3. **Comprehensive Backend Tests** (parallel)
   - Unit Tests mit Coverage
   - PostgreSQL Service für Tests

4. **Frontend Tests** (parallel)
   - Strict Type Check
   - Lint
   - Build Test

5. **Security Scans** (parallel)
   - npm Audit für beide Packages
   - Trivy Security Scan
   - Secrets Scanning (TruffleHog)

6. **Database Migration Tests**
   - Database Backup vor Migration
   - Migration Execution
   - Schema Validation

7. **Build & Push Release Images** (mit Signierung)
   - API Image mit Version Tags
   - Frontend Image mit Version Tags
   - Image Signierung (cosign)
   - Container Scanning

8. **Create GitHub Release**
   - Automatische Release-Erstellung
   - Changelog aus CHANGELOG.md oder Git Commits
   - Docker Image Tags in Release Notes

9. **Deploy to Production**
   - Database Backup vor Migration
   - Pull Versioned Images
   - Docker Compose Deployment
   - Health-Check mit Rollback bei Fehlern
   - Prisma Migrations

10. **Notifications**
    - Email bei Release-Pipeline-Fehlern

### Docker Image Tags (Release)

- **API:** `v1.0.0`, `1.0`, `{sha}`
- **Frontend:** `v1.0.0`, `1.0`, `{sha}`

### Manueller Trigger

Die Release-Pipeline kann manuell getriggert werden:
1. GitHub Actions → Workflows → "CI - Release Pipeline"
2. "Run workflow" → Version eingeben (z.B. `v1.0.0`)

### Release erstellen

```bash
# 1. Version in package.json aktualisieren (optional)
# 2. Tag erstellen
git tag v1.0.0
git push origin v1.0.0
```

Die Pipeline startet automatisch und:
- Führt alle Tests durch
- Baut Docker Images
- Erstellt GitHub Release
- Deployed zu Production

## Docker Image Tags

### Basis-Pipeline:
- **API:** `latest`, `{sha}`
- **Frontend:** `latest`, `{sha}`

### Release-Pipeline:
- **API:** `v1.0.0`, `1.0`, `{sha}`
- **Frontend:** `v1.0.0`, `1.0`, `{sha}`

## Performance-Optimierungen

- ✅ Parallele Ausführung von Jobs wo möglich
- ✅ Docker Layer Caching (GitHub Actions Cache)
- ✅ npm Cache (GitHub Actions Cache)
- ✅ Frontend-Checks nur bei Frontend-Änderungen
- ✅ Path-basierte Ignore-Liste (docs, scripts, etc.)

## Monitoring

Nach Deployment:
- **API Health:** `https://campus.mojo-institut.de/api/health`
- **Frontend:** `https://campus.mojo-institut.de`
- **Directus:** `https://campus.mojo-institut.de/cms`

**Development:**
- **API Health:** `https://dev.campus.mojo-institut.de/api/health`
- **Frontend:** `https://dev.campus.mojo-institut.de`
- **Directus:** `https://dev.campus.mojo-institut.de/cms`

