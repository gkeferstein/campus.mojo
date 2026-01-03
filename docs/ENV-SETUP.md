# Campus.mojo Environment Setup

## Clerk Authentication (Single Sign-On)

Campus.mojo verwendet **Clerk** für Authentifizierung und teilt den Clerk-Account mit accounts.mojo für Single Sign-On.

### Erforderliche Environment-Variablen

```bash
# ============================================
# CLERK AUTHENTICATION
# ============================================
# WICHTIG: Diese Keys müssen identisch mit accounts.mojo sein!

# Clerk Secret Key für JWT-Verifizierung (Backend)
CLERK_SECRET_KEY=sk_live_xxxx

# Clerk Publishable Key für Frontend
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_xxxx
```

### Architektur

**accounts.mojo** ist die zentrale Stelle für Clerk Webhooks. Campus.mojo empfängt KEINE direkten Webhooks von Clerk.

```
Clerk → Webhooks → accounts.mojo → kontakte.mojo (SSOT)
                         ↓
                   User-Datenbank
```

Campus.mojo funktioniert so:
1. User meldet sich über Clerk an (SSO)
2. JWT wird bei API-Request mitgeschickt
3. Backend validiert JWT mit `CLERK_SECRET_KEY`
4. Bei erstem Zugriff: User wird on-the-fly in lokaler DB erstellt

### Alle Environment-Variablen

```bash
# ============================================
# DATABASE
# ============================================
POSTGRES_USER=campus
POSTGRES_PASSWORD=<secure-password>
POSTGRES_DB=campus_lms
# Connection Pooling: connection_limit (default: 10), pool_timeout (default: 10s)
# Für Production: connection_limit=20, pool_timeout=20
DATABASE_URL=postgresql://campus:<password>@db:5432/campus_lms?connection_limit=10&pool_timeout=20

# ============================================
# CLERK AUTHENTICATION
# ============================================
CLERK_SECRET_KEY=sk_live_xxxx
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_xxxx
CLERK_WEBHOOK_SECRET=whsec_xxxx

# ============================================
# SERVER
# ============================================
PORT=3001
HOST=0.0.0.0
LOG_LEVEL=info
CORS_ORIGIN=https://campus.mojo-institut.de

# ============================================
# DIRECTUS CMS
# ============================================
DIRECTUS_KEY=<random-string>
DIRECTUS_SECRET=<random-string>
DIRECTUS_ADMIN_EMAIL=admin@mojo-institut.de
DIRECTUS_ADMIN_PASSWORD=<secure-password>
DIRECTUS_ADMIN_TOKEN=<admin-token>

# ============================================
# WEBHOOKS
# ============================================
WEBHOOK_SECRET=<shared-webhook-secret>

# ============================================
# FRONTEND
# ============================================
NEXT_PUBLIC_API_URL=https://campus.mojo-institut.de/api

# ============================================
# MESSAGING (messaging.mojo Integration)
# ============================================
# Production
NEXT_PUBLIC_MESSAGING_API_URL=https://messaging.mojo-institut.de
NEXT_PUBLIC_MESSAGING_WS_URL=wss://messaging.mojo-institut.de

# Development (optional, falls messaging.mojo lokal läuft)
# NEXT_PUBLIC_MESSAGING_API_URL=http://localhost:3020
# NEXT_PUBLIC_MESSAGING_WS_URL=ws://localhost:3020
```

