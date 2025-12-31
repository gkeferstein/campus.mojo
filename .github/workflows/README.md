# CI/CD Pipelines für campus.mojo

Dieses Projekt verwendet die **einheitlichen MOJO Pipeline-Standards**:

1. **Staging-Pipeline** (`ci-staging.yml`) - Für `main` Branch
2. **Release-Pipeline** (`ci-release.yml`) - Für Version Tags wie `v1.0.0`

## Staging-Pipeline (ci-staging.yml)

**Trigger:** Push zu `main` Branch

**Ziele:**
- ✅ Code Quality Checks
- ✅ Docker Images bauen und taggen (`sha-{commit}`, `main-latest`)
- ✅ Blue/Green Deployment auf Staging
- ✅ Health Check Validation

**Pipeline-Übersicht:**
```
┌──────────────┐
│ Code Quality │
│ Checks       │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ Build & Push │
│ Images       │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ Deploy       │
│ Staging      │
│ (Blue/Green) │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ Health Check │
└──────────────┘
```

**Domain:** `campus.staging.mojo-institut.de`

**Image Tags:**
- `sha-{commit-sha}` (z.B. `sha-abc123def`)
- `main-latest`
- `{commit-sha}`

## Release-Pipeline (ci-release.yml)

**Trigger:** Release Tag `v*.*.*` (z.B. `v1.2.3`)

**Ziele:**
- ✅ Strict Code Quality Checks
- ✅ Image-Verifikation (pullt exakt gleiche Images wie Staging)
- ✅ Blue/Green Deployment auf Production
- ✅ Health Check Validation
- ✅ GitHub Release erstellen

**Pipeline-Übersicht:**
```
┌──────────────┐
│ Prepare      │
│ Release      │
└──────┬───────┘
       │
       ├─► Code Quality (Strict)
       ├─► Verify Images Exist
       │
       ▼
┌──────────────┐
│ Deploy       │
│ Production   │
│ (Blue/Green) │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ Health Check │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ Create       │
│ Release      │
└──────────────┘
```

**Domain:** `campus.mojo-institut.de`

**Image Strategy:** Build Once, Deploy Many
- Images werden in Staging gebaut und getestet
- Production pullt **exakt gleiche Images** (gleiche Tags)
- **Keine neuen Builds** in Production Pipeline

## Erforderliche GitHub Secrets

### Staging Secrets

| Secret | Beschreibung | Pflicht |
|--------|-------------|---------|
| `STAGING_SERVER` | Hostname/IP des Staging Servers | ✅ Ja |
| `STAGING_SSH_KEY` | SSH Private Key für Staging | ✅ Ja |
| `GHCR_TOKEN` | GitHub Container Registry Token | ✅ Ja |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk Publishable Key (für Frontend Build) | ✅ Ja |

### Production Secrets

| Secret | Beschreibung | Pflicht |
|--------|-------------|---------|
| `PRODUCTION_SERVER` | Hostname/IP des Production Servers | ✅ Ja |
| `PRODUCTION_SSH_KEY` | SSH Private Key für Production | ✅ Ja |
| `GHCR_TOKEN` | GitHub Container Registry Token | ✅ Ja |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk Publishable Key | ✅ Ja |

**Setup in GitHub:**
1. Repository → Settings → Secrets and variables → Actions
2. "New repository secret" klicken
3. Secrets hinzufügen gemäß obiger Tabelle

## Deployment-Strategie

### Blue/Green Deployment

Beide Umgebungen (Staging + Production) verwenden **Blue/Green Deployment**:

1. Pull Images (gleiche Tags)
2. Start Green Environment
3. Health Check Green
4. Switch Traffic (Traefik Router Update)
5. Stop Blue Environment
6. Rollback bei Fehler

**Script:** `/root/scripts/deploy-blue-green.sh`

## Docker Compose Files

- **Staging:** `docker-compose.staging.yml`
- **Production:** `docker-compose.production.yml`

## Release erstellen

```bash
# 1. Version in package.json aktualisieren (optional)
# 2. Tag erstellen
git tag v1.0.0
git push origin v1.0.0
```

Die Pipeline startet automatisch und:
- Verifiziert, dass Images mit diesem Tag existieren (aus Staging)
- Deployed zu Production (Blue/Green)
- Führt Health Checks durch
- Erstellt GitHub Release

## Monitoring

**Staging:**
- **API Health:** `https://campus.staging.mojo-institut.de/health`
- **Frontend:** `https://campus.staging.mojo-institut.de`
- **Directus:** `https://campus.staging.mojo-institut.de/cms`

**Production:**
- **API Health:** `https://campus.mojo-institut.de/health`
- **Frontend:** `https://campus.mojo-institut.de`
- **Directus:** `https://campus.mojo-institut.de/cms`

## Troubleshooting

### Deployment schlägt fehl

1. **SSH-Verbindung prüfen:**
   ```bash
   ssh -i ~/.ssh/staging_key root@$STAGING_SERVER
   ssh -i ~/.ssh/production_key root@$PRODUCTION_SERVER
   ```

2. **Docker Network prüfen:**
   ```bash
   docker network inspect mojo-network
   ```

3. **Container-Logs prüfen:**
   ```bash
   cd /root/projects/campus.mojo
   docker compose -f docker-compose.staging.yml logs
   docker compose -f docker-compose.production.yml logs
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

## Referenzen

- **Staging Server Konvention:** `/root/projects/STAGING_SERVER_CONVENTION.md`
- **Coding Standards:** `/root/projects/CODING_STANDARDS.md`
- **Deploy Script:** `/root/scripts/deploy-blue-green.sh`
