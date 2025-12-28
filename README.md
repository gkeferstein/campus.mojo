# MOJO Campus - Learning Management System

Eine moderne headless LMS-Plattform mit Directus CMS, Fastify API und Next.js Frontend.

## 🏗 Architektur

```
┌─────────────────────────────────────────────────────────────────┐
│                        Traefik Reverse Proxy                     │
│                     campus.mojo-institut.de                      │
├─────────────┬─────────────┬─────────────┬─────────────────────────┤
│    /        │   /api/*    │   /cms/*    │        (intern)        │
│  Frontend   │   LMS API   │  Directus   │      PostgreSQL        │
│  (Next.js)  │  (Fastify)  │    CMS      │                        │
│   :3000     │    :3001    │   :8055     │        :5432           │
└─────────────┴─────────────┴─────────────┴─────────────────────────┘
```

## 🚀 Lokale Entwicklung

### Voraussetzungen

- Docker und Docker Compose
- Node.js 22+ (für lokale Entwicklung)
- Git

### 1. Repository klonen und konfigurieren

```bash
cd /root/projects/campus.mojo

# Environment-Variablen kopieren
cp .env.example .env

# Secrets generieren (anpassen!)
# POSTGRES_PASSWORD=<sicheres-passwort>
# DIRECTUS_KEY=$(openssl rand -hex 32)
# DIRECTUS_SECRET=$(openssl rand -hex 32)
# JWT_SECRET=$(openssl rand -hex 64)
# WEBHOOK_SECRET=$(openssl rand -hex 32)
nano .env
```

### 2. Docker-Netzwerk erstellen

```bash
# Netzwerk für alle Campus-Services
docker network create mojo-campus-network

# Traefik mit Netzwerk verbinden
docker network connect mojo-campus-network mojo-traefik
```

### 3. Services starten

```bash
# Development-Modus (mit Port-Expose)
docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d

# Logs beobachten
docker compose logs -f
```

### 4. Directus einrichten

1. Öffne http://localhost:8055/admin
2. Melde dich mit den Credentials aus `.env` an
3. Erstelle einen API-Token unter Settings > Access Tokens
4. Füge den Token in `.env` als `DIRECTUS_ADMIN_TOKEN` hinzu

### 5. Content seeden

```bash
# Directus-Token setzen
export DIRECTUS_TOKEN=<dein-token>

# Schema und Beispieldaten erstellen
node scripts/seed-directus.js
```

### 6. Test-User erstellen

```bash
node scripts/create-test-user.js
```

### 7. Frontend aufrufen

- Frontend: http://localhost:3000
- API: http://localhost:3001
- Directus Admin: http://localhost:8055/admin

## 📦 Projektstruktur

```
campus.mojo/
├── docker-compose.yml        # Haupt-Orchestrierung
├── docker-compose.dev.yml    # Dev-Override
├── .env.example              # Umgebungsvariablen Template
├── packages/
│   ├── api/                  # Fastify LMS API
│   │   ├── src/
│   │   │   ├── routes/       # API Endpoints
│   │   │   ├── middleware/   # Auth, Validation
│   │   │   └── lib/          # Prisma, Directus Client
│   │   ├── prisma/
│   │   │   └── schema.prisma # DB Schema
│   │   └── Dockerfile
│   └── frontend/             # Next.js App Router
│       ├── src/
│       │   ├── app/          # Seiten
│       │   ├── components/   # UI Komponenten
│       │   ├── providers/    # Auth, Progress Context
│       │   └── lib/          # API Client, Utils
│       └── Dockerfile
├── directus/
│   ├── extensions/           # Custom Directus Extensions
│   ├── uploads/              # Media Storage
│   └── snapshots/            # Schema Backups
└── scripts/
    ├── seed-directus.js      # Content Seeding
    └── create-test-user.js   # Test-User Setup
```

## 🔌 API Endpoints

### Auth
- `POST /auth/register` - Registrierung
- `POST /auth/login` - Anmeldung
- `POST /auth/refresh` - Token erneuern

### User
- `GET /me` - Aktuelle User-Info
- `PATCH /me` - Profil aktualisieren
- `GET /me/enrollments` - Einschreibungen
- `GET /me/entitlements` - Berechtigungen

### Courses
- `GET /courses` - Alle Kurse (mit Fortschritt)
- `GET /courses/:slug` - Kurs-Details mit Content-Tree
- `POST /courses/:id/enroll` - In Kurs einschreiben

### Lessons
- `GET /lessons/:slug` - Lektion mit Content-Blocks
- `POST /lessons/:id/complete` - Lektion abschließen
- `POST /lessons/:id/progress` - Zeit tracken

### Quiz
- `POST /quiz/:id/start` - Quiz starten
- `POST /quiz/:id/submit` - Quiz abgeben
- `GET /quiz/:id/attempts` - Bisherige Versuche

### Webhooks
- `POST /webhooks/payments` - Payment-Events
- `POST /webhooks/crm` - CRM-Events

## 🚢 Production Deployment

### 1. Server-Vorbereitung (Hetzner)

```bash
# Docker installieren
curl -fsSL https://get.docker.com | sh

# Docker Compose installieren
apt install docker-compose-plugin

# Verzeichnis erstellen
mkdir -p /root/projects/campus.mojo
cd /root/projects/campus.mojo
```

### 2. DNS konfigurieren

A-Record für `campus.mojo-institut.de` → Server-IP

### 3. Deployment

```bash
# Projekt klonen
git clone <repo-url> .

# Environment setzen
cp .env.example .env
nano .env  # Secrets eintragen

# Netzwerk erstellen
docker network create mojo-campus-network
docker network connect mojo-campus-network mojo-traefik

# Production starten
docker compose up -d

# Logs prüfen
docker compose logs -f
```

### 4. Backup-Strategie

```bash
# PostgreSQL Backup
docker exec campus-db pg_dump -U campus campus_lms > backup_$(date +%Y%m%d).sql

# Directus Uploads sichern
tar -czf uploads_$(date +%Y%m%d).tar.gz directus/uploads/
```

## 🔐 Sicherheit

- Alle Secrets müssen in `.env` definiert werden
- HTTPS wird von Traefik mit Let's Encrypt bereitgestellt
- JWT-Tokens für API-Authentifizierung
- Webhook-Signaturprüfung für externe Events
- Rate-Limiting auf API-Ebene

## 🧩 Content-Blöcke

Lessons verwenden JSON-basierte `content_blocks`:

| Typ | Beschreibung |
|-----|--------------|
| `heading` | Überschrift (Level 1-6) |
| `paragraph` | Absatz |
| `callout` | Info/Warning/Tip Box |
| `code_block` | Code mit Syntax-Highlighting |
| `image` | Bild mit Caption |
| `video_embed` | YouTube/Vimeo Embed |
| `divider` | Trennlinie |
| `card_grid` | Karten-Raster |
| `pro_tip` | Hervorgehobener Tipp |
| `quiz_embed` | Eingebettetes Quiz |

## 🔄 Webhooks

### Payment Webhook
```json
{
  "event": "payment.completed",
  "data": {
    "email": "user@example.com",
    "courseId": "uuid",
    "paymentId": "pay_123"
  }
}
```

### CRM Webhook
```json
{
  "event": "membership.changed",
  "data": {
    "email": "user@example.com",
    "tenantSlug": "mojo-team",
    "role": "member"
  }
}
```

## 📝 Entwicklung

### API entwickeln

```bash
cd packages/api
npm install
npm run dev
```

### Frontend entwickeln

```bash
cd packages/frontend
npm install
npm run dev
```

### Datenbank-Migrationen

```bash
cd packages/api
npx prisma migrate dev --name <migration-name>
```

---

**Zuletzt aktualisiert:** 2024-12-28

