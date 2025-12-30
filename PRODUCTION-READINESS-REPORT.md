# Production-Readiness Report: campus.mojo

**Datum:** 2025-01-XX  
**Status:** ⚠️ **NICHT PRODUCTION-READY** - Kritische Probleme gefunden

---

## Executive Summary

Die Software hat eine solide Grundarchitektur, weist jedoch **kritische Sicherheits- und Resilienzprobleme** auf, die vor einem Production-Deployment behoben werden müssen.

### Kritische Probleme (Blocking)
- ❌ **Webhook Secret mit Fallback-Wert** - Sicherheitsrisiko
- ❌ **Fehlende Request-ID Propagation** - Debugging erschwert
- ❌ **Fehlende strukturierte Logging** - Monitoring nicht möglich
- ❌ **Fehlende Rate Limiting pro User/Tenant** - DDoS-Risiko
- ❌ **Fehlende Input-Validierung in einigen Routes** - Injection-Risiko
- ❌ **Fehlende Timeouts für externe Services** - Resilienz-Problem

### Wichtige Probleme (High Priority)
- ⚠️ **Console.log statt strukturiertem Logging** - Monitoring nicht möglich
- ⚠️ **Fehlende Error-Klassen** - Inkonsistente Fehlerbehandlung
- ⚠️ **Fehlende Database Connection Pooling Konfiguration** - Skalierbarkeit
- ⚠️ **Fehlende Health-Check Details** - Keine Dependency-Checks
- ⚠️ **Fehlende CORS-Validierung** - Sicherheitsrisiko

### Verbesserungen (Medium Priority)
- 💡 **TypeScript Strictness** - Fehlende noUncheckedIndexedAccess
- 💡 **Fehlende Request-Validierung** - Zod-Schemas nicht überall
- 💡 **Fehlende Retry-Logik** - Directus-Calls ohne Retry
- 💡 **Fehlende Circuit Breaker** - Keine Resilienz bei Directus-Ausfall

---

## 1. SICHERHEIT

### 1.1 Kritische Sicherheitsprobleme

#### ❌ Webhook Secret mit Fallback-Wert
**Datei:** `packages/api/src/middleware/webhook-verify.ts:4`

```typescript
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || 'development-webhook-secret';
```

**Problem:** In Production könnte der Fallback-Wert verwendet werden, wenn die Env-Variable fehlt. Dies ermöglicht Webhook-Spoofing.

**Lösung:**
```typescript
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;
if (!WEBHOOK_SECRET) {
  throw new Error('WEBHOOK_SECRET environment variable is required');
}
```

#### ❌ Fehlende CORS-Validierung
**Datei:** `packages/api/src/index.ts:24`

```typescript
origin: process.env.CORS_ORIGIN?.split(',') || true,
```

**Problem:** `true` erlaubt alle Origins in Production, wenn `CORS_ORIGIN` nicht gesetzt ist.

**Lösung:**
```typescript
const allowedOrigins = process.env.CORS_ORIGIN?.split(',').filter(Boolean) || [];
if (process.env.NODE_ENV === 'production' && allowedOrigins.length === 0) {
  throw new Error('CORS_ORIGIN must be set in production');
}
await fastify.register(cors, {
  origin: allowedOrigins.length > 0 ? allowedOrigins : false,
  credentials: true,
});
```

#### ⚠️ Fehlende Input-Validierung
**Problem:** Nicht alle Routes validieren Input mit Zod-Schemas.

**Beispiele:**
- `GET /courses/:courseSlug` - Keine Slug-Validierung
- `GET /lessons/:lessonSlug` - Keine Slug-Validierung
- `POST /courses/:courseId/enroll` - Keine UUID-Validierung

**Lösung:** Zod-Schemas für alle Route-Parameter hinzufügen.

#### ⚠️ Fehlende SQL-Injection-Schutz
**Status:** ✅ Prisma schützt vor SQL-Injection, aber:
- Direkte SQL-Queries in `prisma.$queryRaw` müssen manuell validiert werden
- Keine Prisma-Queries mit String-Interpolation gefunden ✅

### 1.2 Authentifizierung & Autorisierung

#### ✅ Clerk Integration korrekt implementiert
- JWT-Verifizierung vorhanden
- User-Provisioning funktioniert
- Soft-Delete wird respektiert

#### ⚠️ Fehlende Tenant-Isolation-Prüfung
**Problem:** In einigen Routes wird nicht geprüft, ob der User Zugriff auf den Tenant hat.

**Beispiel:** `packages/api/src/routes/courses.ts:25`
```typescript
const tenantId = request.user?.tenantId || undefined;
```

**Problem:** User könnte auf Kurse anderer Tenants zugreifen, wenn `tenantId` nicht korrekt validiert wird.

**Lösung:** Tenant-Membership prüfen:
```typescript
if (request.user?.tenantId) {
  const membership = await prisma.tenantMembership.findUnique({
    where: { userId_tenantId: { userId: request.user.id, tenantId: request.user.tenantId } }
  });
  if (!membership) {
    return reply.status(403).send({ error: 'No access to this tenant' });
  }
}
```

### 1.3 Secrets Management

#### ✅ Keine hardcodierten Secrets im Code
#### ⚠️ Fehlende Secrets-Validierung beim Start
**Problem:** App startet auch wenn kritische Secrets fehlen (z.B. `CLERK_SECRET_KEY`).

**Lösung:** Startup-Validierung hinzufügen:
```typescript
const requiredEnvVars = [
  'CLERK_SECRET_KEY',
  'DATABASE_URL',
  'WEBHOOK_SECRET',
];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
}
```

---

## 2. RESILIENZ

### 2.1 Error Handling

#### ❌ Fehlende strukturierte Error-Klassen
**Problem:** Keine Custom Error-Klassen wie in CODING_STANDARDS.md definiert.

**Aktuell:** `packages/api/src/middleware/error-handler.ts` behandelt nur ZodError und generische Fehler.

**Lösung:** Error-Klassen implementieren:
```typescript
// lib/errors.ts
export class AppError extends Error {
  constructor(
    public code: string,
    public message: string,
    public statusCode: number = 500,
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string, id?: string) {
    super('NOT_FOUND', `${resource} nicht gefunden`, 404);
  }
}

export class ValidationError extends AppError {
  constructor(fields: Record<string, string>) {
    super('VALIDATION_ERROR', 'Validierung fehlgeschlagen', 400, { fields });
  }
}
```

#### ⚠️ Fehlende Error-Logging-Struktur
**Problem:** Errors werden nur mit `console.error` geloggt, nicht strukturiert.

**Lösung:** Pino Logger verwenden (wie in Standards definiert).

### 2.2 Timeouts & Retries

#### ❌ Fehlende Timeouts für Directus-Calls
**Datei:** `packages/api/src/lib/directus.ts:26`

**Problem:** `fetch` hat keinen Timeout. Bei Directus-Ausfall hängen Requests.

**Lösung:**
```typescript
const controller = new AbortController();
const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout

try {
  const response = await fetch(`${DIRECTUS_URL}${endpoint}`, {
    ...options,
    signal: controller.signal,
  });
  clearTimeout(timeoutId);
  // ...
} catch (error) {
  if (error.name === 'AbortError') {
    throw new Error('Directus request timeout');
  }
  throw error;
}
```

#### ❌ Fehlende Retry-Logik
**Problem:** Keine Retry-Logik bei transienten Fehlern (Network, 5xx).

**Lösung:** Retry-Library verwenden (z.B. `p-retry`).

### 2.3 Graceful Degradation

#### ✅ Directus-Fallback vorhanden
**Datei:** `packages/api/src/routes/courses.ts:28-34`

```typescript
try {
  courses = await getCourses(tenantId);
} catch (error) {
  console.warn('Directus not available...');
  // Return empty array
}
```

**Status:** ✅ Gut implementiert, aber:
- ⚠️ `console.warn` statt strukturiertem Logging
- ⚠️ Keine Metriken für Directus-Ausfälle

### 2.4 Database Resilience

#### ⚠️ Fehlende Connection Pooling Konfiguration
**Datei:** `packages/api/src/lib/prisma.ts`

**Problem:** Prisma verwendet Default-Pooling. Für Production sollte Pooling konfiguriert werden.

**Lösung:**
```typescript
export const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
  // Connection pool configuration
  // (Prisma manages this via connection_limit in DATABASE_URL)
});
```

**Hinweis:** Prisma Pooling wird über `DATABASE_URL` konfiguriert:
```
DATABASE_URL=postgresql://user:pass@host:5432/db?connection_limit=10&pool_timeout=20
```

#### ⚠️ Fehlende Database Health-Check
**Datei:** `packages/api/src/routes/health.ts:8`

**Problem:** Health-Check prüft nur `SELECT 1`, nicht ob DB wirklich funktioniert.

**Lösung:** Mehr Details prüfen:
```typescript
const [dbCheck, directusCheck] = await Promise.allSettled([
  prisma.$queryRaw`SELECT 1`,
  fetch(`${DIRECTUS_URL}/server/health`).catch(() => null),
]);

return reply.send({
  status: dbCheck.status === 'fulfilled' ? 'healthy' : 'unhealthy',
  timestamp: new Date().toISOString(),
  service: 'campus-lms-api',
  version: '1.0.0',
  dependencies: {
    database: dbCheck.status === 'fulfilled' ? 'ok' : 'error',
    directus: directusCheck.status === 'fulfilled' ? 'ok' : 'error',
  },
});
```

---

## 3. KONSISTENZ

### 3.1 Code Standards

#### ⚠️ TypeScript Strictness
**Datei:** `packages/api/tsconfig.json`

**Problem:** Fehlende `noUncheckedIndexedAccess` (wie in Standards definiert).

**Lösung:**
```json
{
  "compilerOptions": {
    "noUncheckedIndexedAccess": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  }
}
```

#### ⚠️ Fehlende Request-ID Propagation
**Problem:** Keine Request-ID für Tracing (wie in Standards definiert).

**Lösung:** Fastify Plugin hinzufügen:
```typescript
fastify.addHook('onRequest', async (request) => {
  request.id = request.headers['x-request-id'] as string || randomUUID();
});

fastify.addHook('onSend', async (request, reply) => {
  reply.header('x-request-id', request.id);
});
```

### 3.2 Logging

#### ❌ Console.log statt strukturiertem Logging
**Gefunden in:**
- `packages/api/src/middleware/auth.ts:161, 214, 251, 252`
- `packages/api/src/routes/courses.ts:32`

**Problem:** Keine strukturierten Logs für Monitoring.

**Lösung:** Pino Logger implementieren (wie in Standards):
```typescript
import pino from 'pino';

export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  formatters: {
    level: (label) => ({ level: label }),
  },
  base: {
    service: 'campus-lms-api',
  },
  timestamp: pino.stdTimeFunctions.isoTime,
});
```

### 3.3 API Response Format

#### ⚠️ Inkonsistente Response-Formate
**Problem:** Nicht alle Responses folgen dem Standard-Format aus CODING_STANDARDS.md.

**Standard:**
```typescript
interface SuccessResponse<T> {
  success: true;
  data: T;
  meta?: {...};
}
```

**Aktuell:** Viele Routes senden direkt `data` ohne `success`-Wrapper.

**Lösung:** Response-Wrapper implementieren oder dokumentieren, dass Fastify-Standard verwendet wird.

### 3.4 Error Response Format

#### ⚠️ Inkonsistente Error-Responses
**Problem:** Error-Handler sendet `{ error: string }`, Standards definieren:
```typescript
{
  success: false,
  error: {
    code: string,
    message: string,
    details?: {...}
  }
}
```

**Lösung:** Error-Handler anpassen.

---

## 4. PERFORMANCE & SKALIERBARKEIT

### 4.1 Rate Limiting

#### ⚠️ Globales Rate Limiting
**Datei:** `packages/api/src/index.ts:32-35`

```typescript
await fastify.register(rateLimit, {
  max: 100,
  timeWindow: '1 minute',
});
```

**Problem:** Globales Limit, nicht pro User/Tenant. Ein User kann alle Requests verbrauchen.

**Lösung:** Rate Limiting pro User/Tenant:
```typescript
await fastify.register(rateLimit, {
  max: async (request) => {
    // Different limits for authenticated users
    return request.user ? 200 : 50;
  },
  timeWindow: '1 minute',
  keyGenerator: (request) => request.user?.id || request.ip,
});
```

### 4.2 Database Queries

#### ✅ Prisma verwendet (keine N+1-Probleme sichtbar)
#### ⚠️ Fehlende Query-Optimierung
**Problem:** Keine expliziten Indexes in Schema (außer Unique-Constraints).

**Lösung:** Indexes für häufige Queries hinzufügen:
```prisma
model Enrollment {
  // ...
  @@index([userId, courseId])
  @@index([courseId])
}

model LessonProgress {
  // ...
  @@index([userId, courseId])
  @@index([courseId, completed])
}
```

### 4.3 Caching

#### ❌ Kein Caching implementiert
**Problem:** Directus-Calls werden bei jedem Request neu ausgeführt.

**Lösung:** Redis-Caching für Course/Lesson-Daten (optional, aber empfohlen für Production).

---

## 5. MONITORING & OBSERVABILITY

### 5.1 Health Checks

#### ⚠️ Health-Check zu einfach
**Datei:** `packages/api/src/routes/health.ts`

**Problem:** Prüft nur DB, nicht Directus oder andere Dependencies.

**Lösung:** Siehe Abschnitt 2.4.

### 5.2 Logging

#### ❌ Kein strukturiertes Logging
**Problem:** Siehe Abschnitt 3.2.

### 5.3 Metrics

#### ❌ Keine Metriken
**Problem:** Keine Performance-Metriken, Request-Duration, etc.

**Lösung:** Fastify Metrics Plugin oder Prometheus-Integration.

### 5.4 Tracing

#### ❌ Kein Distributed Tracing
**Problem:** Keine Request-ID-Propagation (siehe 3.1).

---

## 6. DEPLOYMENT & INFRASTRUCTUR

### 6.1 Docker

#### ✅ Multi-Stage Builds vorhanden
#### ✅ Health-Checks konfiguriert
#### ⚠️ Fehlende Non-Root-User im API-Container
**Datei:** `packages/api/Dockerfile`

**Problem:** Container läuft als Root (Sicherheitsrisiko).

**Lösung:**
```dockerfile
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nodejs
USER nodejs
```

**Hinweis:** Frontend-Dockerfile hat bereits Non-Root-User ✅

### 6.2 Environment Variables

#### ⚠️ Fehlende .env.example
**Problem:** Keine Dokumentation welche Env-Vars benötigt werden.

**Lösung:** `.env.example` erstellen.

### 6.3 Database Migrations

#### ✅ Prisma Migrations vorhanden
#### ✅ Migrations laufen automatisch im Dockerfile
#### ⚠️ Fehlende Migration-Rollback-Strategie
**Problem:** Keine Dokumentation für Rollbacks.

---

## 7. TESTING

### 7.1 Unit Tests

#### ❌ Keine Tests vorhanden
**Problem:** Kein Test-Setup gefunden.

**Lösung:** Jest/Vitest Setup hinzufügen.

### 7.2 Integration Tests

#### ❌ Keine Integration Tests
**Problem:** Keine API-Tests.

### 7.3 E2E Tests

#### ❌ Keine E2E Tests

---

## 8. DOKUMENTATION

### 8.1 API-Dokumentation

#### ⚠️ Teilweise vorhanden
**Datei:** `docs/API.md`

**Problem:** Nicht vollständig, keine OpenAPI/Swagger-Spec.

**Lösung:** Fastify Swagger Plugin hinzufügen.

### 8.2 Code-Dokumentation

#### ⚠️ Teilweise vorhanden
**Problem:** Nicht alle Funktionen dokumentiert.

---

## PRIORISIERTE TO-DO LISTE

### 🔴 KRITISCH (Blocking für Production)

1. **Webhook Secret Validierung** - `packages/api/src/middleware/webhook-verify.ts`
2. **CORS-Validierung** - `packages/api/src/index.ts`
3. **Strukturiertes Logging** - Alle `console.log` ersetzen
4. **Request-ID Propagation** - Fastify Plugin hinzufügen
5. **Error-Klassen** - `lib/errors.ts` erstellen
6. **Secrets-Validierung beim Start** - Startup-Check hinzufügen
7. **Timeouts für Directus** - `packages/api/src/lib/directus.ts`
8. **Rate Limiting pro User** - `packages/api/src/index.ts`

### 🟡 WICHTIG (High Priority)

9. **Health-Check erweitern** - Dependencies prüfen
10. **Tenant-Isolation prüfen** - Membership-Validierung
11. **Input-Validierung** - Zod-Schemas für alle Routes
12. **TypeScript Strictness** - `noUncheckedIndexedAccess` aktivieren
13. **Database Connection Pooling** - Konfigurieren
14. **Non-Root-User im API-Container** - Dockerfile anpassen

### 🟢 VERBESSERUNGEN (Medium Priority)

15. **Retry-Logik** - Für Directus-Calls
16. **Caching** - Redis für Course-Daten
17. **Metrics** - Prometheus-Integration
18. **Tests** - Unit/Integration Tests
19. **API-Dokumentation** - OpenAPI/Swagger
20. **.env.example** - Dokumentation

---

## FAZIT

Die Software hat eine **solide Grundarchitektur** und folgt vielen Best Practices, ist jedoch **nicht production-ready** aufgrund von:

1. **Kritischen Sicherheitsproblemen** (Webhook Secret, CORS)
2. **Fehlendem strukturiertem Logging** (Monitoring nicht möglich)
3. **Fehlender Resilienz** (Timeouts, Retries)
4. **Fehlender Konsistenz** (Error-Handling, Response-Formate)

**Empfehlung:** Mindestens die **kritischen Probleme** beheben, bevor Production-Deployment.

**Geschätzter Aufwand:** 2-3 Tage für kritische Probleme, 1 Woche für alle wichtigen Verbesserungen.

