# Messaging Widget - Test Checklist

## ✅ Phase 1: Basis-Integration (ABGESCHLOSSEN)

### Implementierte Komponenten

- [x] TypeScript Types (`src/types/messaging.ts`)
- [x] Messaging API Client (`src/lib/messaging-api.ts`)
- [x] WebSocket Hook (`src/hooks/useMessaging.ts`)
- [x] Error Boundary (`src/components/messaging/MessagingErrorBoundary.tsx`)
- [x] MessagingWidget Component (`src/components/messaging/MessagingWidget.tsx`)
- [x] Header Integration
- [x] Environment Variables gesetzt
- [x] socket.io-client installiert

---

## 🧪 Test-Szenarien

### Test 1: Widget erscheint im Header

**Erwartung:**
- MessageCircle Icon rechts im Header
- Kein Badge (wenn keine ungelesenen Nachrichten)
- Kein Offline-Indicator (wenn messaging.mojo nicht erreichbar)

**Test:**
1. Öffne http://localhost:3002/dashboard
2. Prüfe ob Icon im Header erscheint
3. Prüfe Browser-Console auf Fehler

**Status:** ⏳ Zu testen

---

### Test 2: Dropdown öffnet sich

**Erwartung:**
- Klick auf Icon öffnet Dropdown
- Dropdown zeigt "Keine Nachrichten" (wenn messaging.mojo nicht läuft)
- Footer-Link "Alle Nachrichten öffnen" ist sichtbar

**Test:**
1. Klicke auf MessageCircle Icon
2. Prüfe ob Dropdown erscheint
3. Prüfe ob "Keine Nachrichten" angezeigt wird

**Status:** ⏳ Zu testen

---

### Test 3: Graceful Degradation (messaging.mojo nicht erreichbar)

**Erwartung:**
- Widget crasht nicht die App
- Keine Fehler in Console (nur Warnungen)
- Widget wird ausgeblendet oder zeigt "Nicht verfügbar"

**Test:**
1. Stelle sicher, dass messaging.mojo nicht läuft
2. Lade Dashboard
3. Prüfe Browser-Console
4. Widget sollte nicht sichtbar sein oder "Nicht verfügbar" zeigen

**Status:** ⏳ Zu testen

---

### Test 4: Mit messaging.mojo (wenn verfügbar)

**Voraussetzung:** messaging.mojo läuft auf localhost:3020

**Erwartung:**
- Widget lädt Konversationen
- Unread-Badge zeigt korrekte Zahl
- WebSocket verbindet
- Dropdown zeigt Konversationen

**Test:**
1. Starte messaging.mojo lokal (optional)
2. Lade Dashboard
3. Prüfe ob Konversationen geladen werden
4. Prüfe ob WebSocket verbindet (Network Tab)

**Status:** ⏳ Optional (wenn messaging.mojo lokal läuft)

---

## 🔍 Browser-Console Checks

### Erwartete Logs (wenn messaging.mojo nicht läuft):

```
[Messaging] Failed to load conversations: ...
```

### Keine Fehler sollten erscheinen:

- ❌ `Uncaught Error`
- ❌ `Cannot read property`
- ❌ React Errors

### Erlaubte Warnungen:

- ✅ `[Messaging] Failed to load conversations` (wenn API nicht erreichbar)
- ✅ `[Messaging] WebSocket connection error` (wenn WS nicht erreichbar)

---

## 📋 Manuelle Test-Checklist

### Visuell prüfen:

- [ ] MessageCircle Icon erscheint im Header (rechts)
- [ ] Icon ist klickbar
- [ ] Dropdown öffnet sich beim Klick
- [ ] Dropdown schließt sich beim Klick außerhalb
- [ ] "Alle Nachrichten öffnen" Link ist sichtbar

### Funktional prüfen:

- [ ] Keine JavaScript-Fehler in Console
- [ ] App crasht nicht wenn messaging.mojo nicht läuft
- [ ] Widget wird ausgeblendet bei Fehler (Graceful Degradation)

### Mit messaging.mojo (optional):

- [ ] Konversationen werden geladen
- [ ] Unread-Badge zeigt korrekte Zahl
- [ ] WebSocket verbindet (Network Tab)
- [ ] Neue Nachrichten erscheinen live

---

## 🐛 Bekannte Limitationen

1. **messaging.mojo muss laufen** für vollständige Funktionalität
2. **CORS** muss auf messaging.mojo konfiguriert sein für `localhost:3002`
3. **Clerk JWT** muss gültig sein für API-Calls

---

## 🚀 Nächste Schritte

1. **Testen** im Browser
2. **messaging.mojo lokal starten** (optional) für vollständigen Test
3. **Phase 2** implementieren (Community-Integration)

---

**Status:** ✅ Implementiert, ⏳ Zu testen

