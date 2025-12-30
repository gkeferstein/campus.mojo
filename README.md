# MOJO Campus - Learning Management System

Eine moderne headless LMS-Plattform mit Directus CMS, Fastify API und Next.js Frontend.

**Domain:** campus.mojo-institut.de  
**Status:** Production-Ready

---

## Architektur

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

---

## Features

### Core LMS
- **Multi-Tenant LMS** mit Kurs-, Modul- und Lektionsstruktur
- **Interaktive Tools** (z.B. VO2Max Calculator) mit persistenten User-Variablen
- **Quiz-System** mit Single/Multi-Choice und automatischer Bewertung
- **Progress-Tracking** für Lektionen und Kurse
- **Entitlement-System** für Kurszugriff (via Webhooks von payments.mojo)

### MOJO Graduierungssystem
- **6-Stufen Journey**: LEBENSENERGIE → CAMPUS → BOOTCAMP → RMOS → PRAXISZIRKEL → INKUBATOR
- **Kurskatalog** (`/catalog`) - Sales-orientierte Übersicht aller Stufen mit Preisen
- **Fortschritt** (`/progress`) - Visualisierung des Lernfortschritts durch alle Stufen
- **Zertifikate** (`/certificates`) - Gamification mit verdienten Auszeichnungen
- **Dashboard Quick-Overview** - Journey-Karte mit Schnellzugriff auf alle Bereiche

### Integrationen
- **Webhook-Integration** für Payments und CRM
- **Directus CMS** für Content-Management
- **Clerk SSO** für Authentifizierung
- **MOJO Design System** für konsistentes UI

---

## Frontend-Seiten

| Route | Beschreibung |
|-------|--------------|
| `/dashboard` | Haupt-Dashboard mit Kurs-Übersicht und Journey Quick-Overview |
| `/courses/:slug` | Kurs-Detailseite mit Modulen und Lektionen |
| `/courses/:slug/lessons/:slug` | Lektion mit Content-Blöcken und interaktiven Tools |
| `/catalog` | Kurskatalog - Sales-View aller 6 MOJO Stufen |
| `/progress` | Lern-Fortschritt durch das Graduierungssystem |
| `/certificates` | Verdiente und verfügbare Zertifikate |
| `/login` | Clerk SSO Login |
| `/register` | Clerk SSO Registrierung |

---

## Dokumentation

| Dokument | Beschreibung |
|----------|--------------|
| [docs/API.md](docs/API.md) | Vollständige API-Referenz |
| [docs/CONTENT-BLOCKS.md](docs/CONTENT-BLOCKS.md) | Content-Block-Typen für Lektionen |
| [docs/INTERACTIVE-TOOLS.md](docs/INTERACTIVE-TOOLS.md) | Tool-System und VO2Max Calculator |
| [docs/PORT.md](docs/PORT.md) | Port-Konfiguration und Routing |

---

## Lokale Entwicklung

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
nano .env
```

### 2. Docker-Netzwerk erstellen

```bash
docker network create mojo-campus-network
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
export DIRECTUS_TOKEN=<dein-token>
node scripts/seed-directus.js
```

### 6. Test-User erstellen

```bash
node scripts/create-test-user.js
```

### 7. Zugriff

- **Frontend:** http://localhost:3000
- **API:** http://localhost:3001
- **API Health:** http://localhost:3001/health
- **Directus Admin:** http://localhost:8055/admin

---

## Projektstruktur

```
campus.mojo/
├── docker-compose.yml        # Haupt-Orchestrierung
├── docker-compose.dev.yml    # Dev-Override
├── .env.example              # Umgebungsvariablen Template
├── packages/
│   ├── api/                  # Fastify LMS API
│   │   ├── src/
│   │   │   ├── routes/       # API Endpoints
│   │   │   ├── middleware/   # Auth, Validation, Webhooks
│   │   │   └── lib/          # Prisma, Directus Client
│   │   └── prisma/
│   │       └── schema.prisma # DB Schema
│   └── frontend/             # Next.js App Router
│       └── src/
│           ├── app/          # Seiten (dashboard, catalog, progress, certificates)
│           ├── components/   # UI + Interactive Tools
│           ├── providers/    # Auth, Progress Context
│           └── lib/          # API Client, Utils
├── directus/
│   ├── extensions/           # Custom Directus Extensions
│   ├── uploads/              # Media Storage
│   └── snapshots/            # Schema Backups
├── docs/                     # Dokumentation
└── scripts/                  # Utility-Skripte
```

---

## Datenbank-Schema (Prisma)

### Core Entities

| Entity | Beschreibung |
|--------|--------------|
| `Tenant` | Multi-Tenancy Unterstützung |
| `TenantMembership` | User-Tenant Zuordnung mit Rollen |
| `User` | User mit Clerk SSO (`clerkUserId`) |
| `Entitlement` | Kurszugriffsrechte (von payments.mojo via Webhook) |
| `Enrollment` | Kurs-Einschreibungen mit Progress |
| `LessonProgress` | Lektions-Fortschritt und Zeit-Tracking |
| `QuizAttempt` | Quiz-Versuche mit Score |
| `QuizResponse` | Einzelne Quiz-Antworten |
| `UserVariable` | Persistente Variablen für interaktive Tools |
| `WebhookEvent` | Webhook-Audit-Log |

---

## API Endpoints (Übersicht)

Vollständige Dokumentation: [docs/API.md](docs/API.md)

### Health

| Methode | Endpoint | Beschreibung |
|---------|----------|--------------|
| GET | `/health` | API Health-Check mit DB-Status |
| GET | `/ready` | Readiness-Probe |

### Auth

| Methode | Endpoint | Beschreibung |
|---------|----------|--------------|
| POST | `/auth/register` | Registrierung |
| POST | `/auth/login` | Anmeldung |
| POST | `/auth/refresh` | Token erneuern |

### User

| Methode | Endpoint | Beschreibung |
|---------|----------|--------------|
| GET | `/me` | Aktueller User |
| PATCH | `/me` | Profil aktualisieren |
| GET | `/me/enrollments` | Einschreibungen |
| GET | `/me/entitlements` | Berechtigungen |

### Courses

| Methode | Endpoint | Beschreibung |
|---------|----------|--------------|
| GET | `/courses` | Alle Kurse (mit Fortschritt) |
| GET | `/courses/:courseSlug` | Kurs-Details mit Content-Tree |
| POST | `/courses/:courseId/enroll` | In Kurs einschreiben |

### Lessons

| Methode | Endpoint | Beschreibung |
|---------|----------|--------------|
| GET | `/lessons/:lessonSlug` | Lektion mit Content-Blocks |
| POST | `/lessons/:lessonId/complete` | Lektion abschließen |
| POST | `/lessons/:lessonId/progress` | Zeit tracken |

### Quiz

| Methode | Endpoint | Beschreibung |
|---------|----------|--------------|
| POST | `/quiz/:quizId/start` | Quiz starten |
| POST | `/quiz/:quizId/submit` | Quiz abgeben |
| GET | `/quiz/:quizId/attempts` | Bisherige Versuche |

### User Variables (Interactive Tools)

| Methode | Endpoint | Beschreibung |
|---------|----------|--------------|
| GET | `/user-variables?toolSlug=xxx` | Tool-Variablen laden |
| PUT | `/user-variables` | Einzelne Variable speichern |
| POST | `/user-variables/bulk` | Mehrere Variablen speichern |

**User Variables Request/Response:**

```typescript
// PUT /user-variables
{
  "toolSlug": "vo2max-calculator",
  "key": "age",
  "value": 35,
  "lessonId": "uuid",     // optional
  "courseId": "uuid"      // optional
}

// POST /user-variables/bulk
{
  "toolSlug": "vo2max-calculator",
  "variables": {
    "age": 35,
    "steps": 12000,
    "startBand": 3
  },
  "lessonId": "uuid",
  "courseId": "uuid"
}

// GET /user-variables?toolSlug=vo2max-calculator
// Response:
{
  "age": 35,
  "steps": 12000,
  "startBand": 3
}
```

### Webhooks

| Methode | Endpoint | Beschreibung |
|---------|----------|--------------|
| POST | `/webhooks/payments` | Payment-Events (Entitlements) |
| POST | `/webhooks/crm` | CRM-Events |

---

## Content-Blöcke

Lektionen verwenden JSON-basierte `content_blocks`. Vollständige Dokumentation: [docs/CONTENT-BLOCKS.md](docs/CONTENT-BLOCKS.md)

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
| `interactive_tool` | Interaktive Tools (z.B. VO2Max) |

---

## Interactive Tools

Das LMS unterstützt interaktive Tools, die in Lektionen eingebettet werden können. User-Eingaben werden automatisch in `UserVariable` persistiert.

Dokumentation: [docs/INTERACTIVE-TOOLS.md](docs/INTERACTIVE-TOOLS.md)

**Verfügbare Tools:**
- `vo2max-calculator` - Fitness-Level Schätzer mit Trainingsplaner

**Funktionsweise:**
1. Tool wird als `interactive_tool` Content-Block in Lektion eingebunden
2. Frontend lädt bestehende Variablen via `GET /user-variables?toolSlug=xxx`
3. User-Eingaben werden via `PUT /user-variables` oder `POST /user-variables/bulk` gespeichert
4. Variablen sind pro User und Tool eindeutig (`userId + toolSlug + key`)

---

## MOJO Graduierungssystem

Das Campus LMS bildet das 6-stufige MOJO Graduierungssystem ab:

| Stufe | Name | Farbe | Beschreibung |
|-------|------|-------|--------------|
| 1 | LEBENSENERGIE | 🟢 Grün | Grundlagen der Regeneration |
| 2 | CAMPUS | ⚪ Weiß | Community & Biohacking |
| 3 | BUSINESS BOOTCAMP | 🔵 Blau | Gesundheits-Unternehmertum |
| 4 | RegenerationsmedizinOS | 🟣 Lila | Experten-Ausbildung |
| 5 | Praxiszirkel | 🟡 Gelb | Spezialisierung & Mentoring |
| 6 | MOJO Inkubator | ⚫ Schwarz | Franchise-Partner |

**Frontend-Seiten:**

- **`/catalog`** - Kurskatalog mit allen 6 Stufen, Preisen und "Zugang kaufen" CTAs
- **`/progress`** - Timeline-Visualisierung des Lernfortschritts (inspiriert von accounts.mojo Journey)
- **`/certificates`** - Gamification mit verdienten/gesperrten Zertifikaten
- **Dashboard** - Quick-Overview Karte mit Stufen-Fortschritt und Schnellzugriff

---

## Production Deployment

### 1. Server-Vorbereitung

```bash
curl -fsSL https://get.docker.com | sh
apt install docker-compose-plugin
mkdir -p /root/projects/campus.mojo
```

### 2. DNS konfigurieren

A-Record für `campus.mojo-institut.de` → Server-IP

### 3. Deployment

```bash
git clone <repo-url> .
cp .env.example .env
nano .env  # Secrets eintragen

docker network create mojo-campus-network
docker network connect mojo-campus-network mojo-traefik

docker compose up -d
docker compose logs -f
```

### 4. Backup-Strategie

```bash
# PostgreSQL Backup
docker exec campus-db pg_dump -U campus campus_lms > backup_$(date +%Y%m%d).sql

# Directus Uploads sichern
tar -czf uploads_$(date +%Y%m%d).tar.gz directus/uploads/
```

---

## Sicherheit

- Alle Secrets in `.env` definieren
- HTTPS via Traefik mit Let's Encrypt
- JWT-Tokens für API-Authentifizierung (Clerk SSO)
- Webhook-Signaturprüfung für externe Events
- Rate-Limiting auf API-Ebene (100 req/min)

---

## Environment-Variablen

| Variable | Beschreibung |
|----------|--------------|
| `POSTGRES_USER` | PostgreSQL User |
| `POSTGRES_PASSWORD` | PostgreSQL Passwort |
| `POSTGRES_DB` | Datenbank-Name |
| `DATABASE_URL` | PostgreSQL Connection String |
| `DIRECTUS_KEY` | Directus Key |
| `DIRECTUS_SECRET` | Directus Secret |
| `DIRECTUS_ADMIN_EMAIL` | Admin E-Mail |
| `DIRECTUS_ADMIN_PASSWORD` | Admin Passwort |
| `DIRECTUS_ADMIN_TOKEN` | API Token für Backend |
| `JWT_SECRET` | Secret für JWT-Signierung |
| `JWT_EXPIRES_IN` | Token-Ablaufzeit (default: 7d) |
| `WEBHOOK_SECRET` | Secret für Webhook-Validierung |
| `CLERK_SECRET_KEY` | Clerk Secret Key |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk Publishable Key |

---

**Zuletzt aktualisiert:** 2024-12-29
# Test
