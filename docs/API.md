# API-Referenz

Vollständige Dokumentation der MOJO Campus LMS REST API.

**Base URL:** `https://campus.mojo-institut.de/api` (Production) oder `http://localhost:3001` (Development)

## Authentifizierung

Die API verwendet JWT Bearer Tokens. Nach Login/Registrierung erhältst du einen Token, der im `Authorization` Header mitgesendet werden muss:

```
Authorization: Bearer <token>
```

Token-Ablaufzeit: 7 Tage (konfigurierbar via `JWT_EXPIRES_IN`)

---

## Health

### GET /health

Health-Check mit Datenbank-Status.

**Authentifizierung:** Keine

**Response (200):**
```json
{
  "status": "healthy",
  "timestamp": "2024-12-28T10:30:00.000Z",
  "service": "campus-lms-api",
  "version": "1.0.0"
}
```

**Response (503 - Database Error):**
```json
{
  "status": "unhealthy",
  "timestamp": "2024-12-28T10:30:00.000Z",
  "error": "Database connection failed"
}
```

### GET /ready

Einfache Readiness-Probe für Load Balancer.

**Response (200):**
```json
{
  "ready": true
}
```

---

## Auth

### POST /auth/register

Neuen Benutzer registrieren.

**Authentifizierung:** Keine

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "mindestens8zeichen",
  "firstName": "Max",      // optional
  "lastName": "Mustermann" // optional
}
```

**Response (201):**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "Max",
    "lastName": "Mustermann",
    "tenantId": null,
    "createdAt": "2024-12-28T10:30:00.000Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Fehler:**
- `409` - Email bereits registriert

### POST /auth/login

Benutzer anmelden.

**Authentifizierung:** Keine

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "geheimespasswort"
}
```

**Response (200):**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "Max",
    "lastName": "Mustermann",
    "tenantId": null
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Fehler:**
- `401` - Invalid credentials

### POST /auth/refresh

JWT Token erneuern.

**Authentifizierung:** Bearer Token (auch wenn abgelaufen)

**Response (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Fehler:**
- `401` - Invalid token / User not found

---

## User (Me)

### GET /me

Aktuellen Benutzer mit Tenant-Memberships abrufen.

**Authentifizierung:** Bearer Token

**Response (200):**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "firstName": "Max",
  "lastName": "Mustermann",
  "avatarUrl": "https://...",
  "tenantId": null,
  "createdAt": "2024-12-28T10:30:00.000Z",
  "memberships": [
    {
      "role": "member",
      "tenant": {
        "id": "uuid",
        "name": "MOJO Team",
        "slug": "mojo-team"
      }
    }
  ]
}
```

### PATCH /me

Benutzerprofil aktualisieren.

**Authentifizierung:** Bearer Token

**Request Body:**
```json
{
  "firstName": "Maxine",           // optional
  "lastName": "Musterfrau",        // optional
  "avatarUrl": "https://..."       // optional, muss gültige URL sein
}
```

**Response (200):**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "firstName": "Maxine",
  "lastName": "Musterfrau",
  "avatarUrl": "https://...",
  "tenantId": null
}
```

### GET /me/enrollments

Alle Kurs-Einschreibungen des Benutzers.

**Authentifizierung:** Bearer Token

**Response (200):**
```json
[
  {
    "id": "uuid",
    "userId": "uuid",
    "courseId": "uuid",
    "progressPercent": 45,
    "enrolledAt": "2024-12-28T10:30:00.000Z",
    "completedAt": null,
    "lastAccessedAt": "2024-12-28T12:00:00.000Z"
  }
]
```

### GET /me/entitlements

Aktive Kurs-Berechtigungen des Benutzers.

**Authentifizierung:** Bearer Token

**Response (200):**
```json
[
  {
    "id": "uuid",
    "userId": "uuid",
    "tenantId": null,
    "courseId": "uuid",
    "source": "payment",
    "sourceRef": "pay_123",
    "validFrom": "2024-12-28T10:30:00.000Z",
    "validUntil": null,
    "createdAt": "2024-12-28T10:30:00.000Z",
    "revokedAt": null
  }
]
```

---

## Courses

### GET /courses

Alle verfügbaren Kurse mit Fortschritt (falls eingeloggt).

**Authentifizierung:** Optional (Bearer Token)

**Response (200) - Nicht eingeloggt:**
```json
[
  {
    "id": "uuid",
    "title": "LEBENSENERGIE",
    "slug": "lebensenergie",
    "description": "...",
    "thumbnail": "uuid",
    "published": true,
    "tenant_id": null,
    "enrolled": false,
    "progress": 0,
    "hasAccess": false
  }
]
```

**Response (200) - Eingeloggt:**
```json
[
  {
    "id": "uuid",
    "title": "LEBENSENERGIE",
    "slug": "lebensenergie",
    "description": "...",
    "thumbnail": "uuid",
    "published": true,
    "tenant_id": null,
    "enrolled": true,
    "progress": 45,
    "hasAccess": true
  }
]
```

### GET /courses/:courseSlug

Einzelnen Kurs mit vollständigem Content-Tree abrufen.

**Authentifizierung:** Bearer Token

**URL Parameter:**
- `courseSlug` - Slug des Kurses (z.B. `lebensenergie`)

**Response (200):**
```json
{
  "id": "uuid",
  "title": "LEBENSENERGIE",
  "slug": "lebensenergie",
  "description": "...",
  "thumbnail": "uuid",
  "published": true,
  "tenant_id": null,
  "enrolled": true,
  "progress": 45,
  "hasAccess": true,
  "modules": [
    {
      "id": "uuid",
      "course_id": "uuid",
      "title": "Grundlagen",
      "slug": "grundlagen",
      "order_index": 0,
      "lessons": [
        {
          "id": "uuid",
          "module_id": "uuid",
          "title": "Einführung",
          "slug": "einfuehrung",
          "duration_minutes": 15,
          "order_index": 0,
          "completed": true
        }
      ]
    }
  ]
}
```

**Fehler:**
- `404` - Course not found
- `403` - No access to this course

### POST /courses/:courseId/enroll

In einen Kurs einschreiben.

**Authentifizierung:** Bearer Token

**URL Parameter:**
- `courseId` - UUID des Kurses

**Response (201):**
```json
{
  "id": "uuid",
  "userId": "uuid",
  "courseId": "uuid",
  "progressPercent": 0,
  "enrolledAt": "2024-12-28T10:30:00.000Z",
  "completedAt": null,
  "lastAccessedAt": "2024-12-28T10:30:00.000Z"
}
```

**Fehler:**
- `403` - No access to this course (keine Entitlement)

---

## Lessons

### GET /lessons/:lessonSlug

Lektion mit Content-Blocks abrufen.

**Authentifizierung:** Bearer Token

**URL Parameter:**
- `lessonSlug` - Slug der Lektion (z.B. `einfuehrung`)

**Response (200):**
```json
{
  "id": "uuid",
  "module_id": "uuid",
  "title": "Einführung",
  "slug": "einfuehrung",
  "description": "...",
  "duration_minutes": 15,
  "order_index": 0,
  "content_blocks": [
    {
      "type": "heading",
      "data": { "level": 2, "text": "Willkommen" }
    },
    {
      "type": "paragraph",
      "data": { "text": "..." }
    },
    {
      "type": "interactive_tool",
      "data": { "toolSlug": "vo2max-calculator" }
    }
  ],
  "completed": false,
  "timeSpentSeconds": 120,
  "completedAt": null
}
```

**Fehler:**
- `404` - Lesson not found
- `403` - No access to this lesson

### POST /lessons/:lessonId/complete

Lektion als abgeschlossen markieren.

**Authentifizierung:** Bearer Token

**URL Parameter:**
- `lessonId` - UUID der Lektion

**Request Body:**
```json
{
  "timeSpentSeconds": 900  // optional
}
```

**Response (200):**
```json
{
  "id": "uuid",
  "userId": "uuid",
  "lessonId": "uuid",
  "courseId": "uuid",
  "completed": true,
  "timeSpentSeconds": 900,
  "completedAt": "2024-12-28T10:45:00.000Z",
  "createdAt": "2024-12-28T10:30:00.000Z",
  "updatedAt": "2024-12-28T10:45:00.000Z"
}
```

**Hinweis:** Der Kurs-Fortschritt wird automatisch neu berechnet.

### POST /lessons/:lessonId/progress

Zeit für Lektion tracken (ohne abzuschließen).

**Authentifizierung:** Bearer Token

**URL Parameter:**
- `lessonId` - UUID der Lektion

**Request Body:**
```json
{
  "timeSpentSeconds": 60,
  "courseId": "uuid"
}
```

**Response (200):**
```json
{
  "id": "uuid",
  "userId": "uuid",
  "lessonId": "uuid",
  "courseId": "uuid",
  "completed": false,
  "timeSpentSeconds": 180,
  "completedAt": null,
  "createdAt": "2024-12-28T10:30:00.000Z",
  "updatedAt": "2024-12-28T10:31:00.000Z"
}
```

---

## Quiz

### POST /quiz/:quizId/start

Quiz starten oder bestehenden Versuch fortsetzen.

**Authentifizierung:** Bearer Token

**URL Parameter:**
- `quizId` - UUID des Quiz

**Response (201 - Neuer Versuch):**
```json
{
  "attemptId": "uuid",
  "startedAt": "2024-12-28T10:30:00.000Z",
  "quiz": {
    "id": "uuid",
    "title": "Wissenstest Grundlagen",
    "timeLimit": 10,
    "questions": [
      {
        "id": "uuid",
        "type": "single_choice",
        "prompt": "Was ist der Hauptvorteil von...?",
        "options": [
          { "id": "uuid", "label": "Option A" },
          { "id": "uuid", "label": "Option B" }
        ]
      }
    ]
  }
}
```

**Response (200 - Bestehender Versuch):**
Gleiche Struktur wie oben.

### POST /quiz/:quizId/submit

Quiz-Antworten abgeben.

**Authentifizierung:** Bearer Token

**URL Parameter:**
- `quizId` - UUID des Quiz

**Request Body:**
```json
{
  "responses": [
    {
      "questionId": "uuid",
      "answer": "uuid"  // Option-ID für single_choice
    },
    {
      "questionId": "uuid",
      "answer": ["uuid", "uuid"]  // Option-IDs für multi_choice
    },
    {
      "questionId": "uuid",
      "answer": "Freitext"  // Für short_answer
    }
  ]
}
```

**Response (200):**
```json
{
  "attemptId": "uuid",
  "score": 80,
  "passed": true,
  "passingScore": 70,
  "results": [
    {
      "questionId": "uuid",
      "correct": true,
      "explanation": "Richtig! Der Grund ist..."
    },
    {
      "questionId": "uuid",
      "correct": false,
      "explanation": "Die korrekte Antwort wäre..."
    }
  ]
}
```

**Fehler:**
- `404` - Quiz not found
- `400` - No active quiz attempt found
- `400` - Time limit exceeded

### GET /quiz/:quizId/attempts

Alle bisherigen Quiz-Versuche des Benutzers.

**Authentifizierung:** Bearer Token

**URL Parameter:**
- `quizId` - UUID des Quiz

**Response (200):**
```json
[
  {
    "id": "uuid",
    "userId": "uuid",
    "quizId": "uuid",
    "score": 80,
    "passed": true,
    "startedAt": "2024-12-28T10:30:00.000Z",
    "completedAt": "2024-12-28T10:40:00.000Z",
    "responses": [
      {
        "id": "uuid",
        "attemptId": "uuid",
        "questionId": "uuid",
        "answer": "uuid",
        "correct": true
      }
    ]
  }
]
```

---

## User Variables (Interactive Tools)

Speichert und lädt Benutzereingaben für interaktive Tools wie den VO2Max Calculator.

### GET /user-variables

Tool-Variablen eines Benutzers laden.

**Authentifizierung:** Bearer Token

**Query Parameter:**
- `toolSlug` - Identifier des Tools (z.B. `vo2max-calculator`)

**Response (200):**
```json
{
  "age": 35,
  "steps": 8000,
  "stairs": 0,
  "walkTalk": 1,
  "sessions": 2
}
```

**Fehler:**
- `400` - toolSlug query parameter required

### PUT /user-variables

Einzelne Variable speichern.

**Authentifizierung:** Bearer Token

**Request Body:**
```json
{
  "toolSlug": "vo2max-calculator",
  "key": "age",
  "value": 35,
  "lessonId": "uuid",    // optional
  "courseId": "uuid"     // optional
}
```

**Response (200):**
```json
{
  "key": "age",
  "value": 35,
  "updatedAt": "2024-12-28T10:30:00.000Z"
}
```

### POST /user-variables/bulk

Mehrere Variablen auf einmal speichern.

**Authentifizierung:** Bearer Token

**Request Body:**
```json
{
  "toolSlug": "vo2max-calculator",
  "variables": {
    "age": 35,
    "steps": 8000,
    "stairs": 0
  },
  "lessonId": "uuid",    // optional
  "courseId": "uuid"     // optional
}
```

**Response (200):**
```json
{
  "updated": 3,
  "variables": [
    { "key": "age", "value": 35 },
    { "key": "steps", "value": 8000 },
    { "key": "stairs", "value": 0 }
  ]
}
```

---

## Webhooks

### POST /webhooks/payments

Webhook für Payment-Events (Stripe, PayPal, etc.).

**Authentifizierung:** Webhook-Signatur via `X-Webhook-Secret` Header

**Request Body:**
```json
{
  "event": "payment.completed",
  "data": {
    "userId": "uuid",        // optional, wenn email gegeben
    "email": "user@example.com",
    "courseId": "uuid",
    "paymentId": "pay_123",
    "validUntil": "2025-12-28T00:00:00.000Z"  // optional, null = lifetime
  }
}
```

**Events:**
- `payment.completed` - Gewährt Entitlement
- `payment.refunded` - Widerruft Entitlement
- `subscription.cancelled` - Widerruft Entitlement

**Response (200):**
```json
{
  "success": true,
  "eventId": "uuid"
}
```

### POST /webhooks/crm

Webhook für CRM-Events (HubSpot, Pipedrive, etc.).

**Authentifizierung:** Webhook-Signatur via `X-Webhook-Secret` Header

**Request Body:**
```json
{
  "event": "membership.changed",
  "data": {
    "email": "user@example.com",
    "firstName": "Max",
    "lastName": "Mustermann",
    "tenantId": "uuid",       // optional
    "tenantSlug": "mojo-team", // optional, wird zu tenantId aufgelöst
    "role": "member"           // admin, instructor, member
  }
}
```

**Events:**
- `contact.created` - Erstellt/aktualisiert User-Profil
- `contact.updated` - Aktualisiert User-Profil
- `membership.changed` - Ändert Tenant-Mitgliedschaft

**Response (200):**
```json
{
  "success": true,
  "eventId": "uuid"
}
```

---

## Fehler-Codes

| Code | Beschreibung |
|------|--------------|
| 400 | Bad Request - Ungültige Eingabedaten |
| 401 | Unauthorized - Token fehlt oder ungültig |
| 403 | Forbidden - Keine Berechtigung |
| 404 | Not Found - Ressource nicht gefunden |
| 409 | Conflict - Ressource existiert bereits |
| 422 | Unprocessable Entity - Validierungsfehler |
| 429 | Too Many Requests - Rate Limit erreicht |
| 503 | Service Unavailable - Datenbank nicht erreichbar |

**Fehler-Response-Format:**
```json
{
  "error": "Beschreibung des Fehlers"
}
```

---

## Rate Limiting

- **Limit:** 100 Requests pro Minute pro IP
- **Header:** `X-RateLimit-Remaining` zeigt verbleibende Requests
- **Response bei Überschreitung:** 429 Too Many Requests

