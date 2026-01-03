# Phase 3: Workshops-Integration - ABGESCHLOSSEN ✅

## Implementierte Features

### 1. "Nachricht senden" Button beim Workshop-Host

- **Komponente:** `MessageButton` (wiederverwendet aus Phase 2)
- **Funktionalität:**
  - Prüft ob Kontakt zum Host existiert
  - Öffnet Direktnachricht wenn Kontakt vorhanden
  - Zeigt Kontaktanfrage-Dialog wenn kein Kontakt
  - Pre-filled Nachricht: "Ich interessiere mich für den Workshop..."

- **Integration:**
  - Bei jedem Workshop (rechts neben Host-Info)
  - Nur sichtbar wenn User nicht der Host ist
  - Kompakt als Icon-Button (8x8)

---

### 2. Direktnachricht an Workshop-Host

- **Logik:**
  1. Prüft ob Kontakt existiert (`canMessage`)
  2. Sucht nach existierender DIRECT-Konversation
  3. Öffnet existierende Konversation in neuem Tab
  4. Falls keine existiert: Erstellt neue Konversation
  5. Fallback: Zeigt Kontaktanfrage-Dialog

- **Pre-filled Nachricht:**
  ```
  Hallo [HostName]! Ich interessiere mich für den Workshop "[Workshop-Titel]" 
  und hätte gerne mehr Informationen.
  ```

---

### 3. Gruppen-Chat für Workshop-Teilnehmer

- **Komponente:** `WorkshopGroupChatButton` (`src/components/messaging/WorkshopGroupChatButton.tsx`)
- **Funktionalität:**
  - Erstellt oder öffnet GROUP-Konversation für Workshop-Teilnehmer
  - Nur sichtbar bei gebuchten Workshops
  - Sucht nach existierender Konversation (anhand Workshop-Titel)
  - Erstellt neue GROUP-Konversation falls keine existiert

- **Integration:**
  - Bei gebuchten Workshops (unter "Zum Meeting" Button)
  - Vollbreite Button mit "Gruppen-Chat" Label
  - Disabled wenn keine Teilnehmer vorhanden

---

## Erweiterte Features

### ContactRequestDialog - Workshop-Support

- **Erweiterung:**
  - Neue `postType: 'workshop'` Unterstützung
  - Workshop-spezifische Pre-filled Nachricht
  - Kontextuelle Nachricht basierend auf Workshop-Typ

---

## Code-Struktur

```
packages/frontend/src/
├── components/
│   └── messaging/
│       ├── MessageButton.tsx              # Wiederverwendet (Phase 2)
│       ├── ContactRequestDialog.tsx       # Erweitert (Workshop-Support)
│       └── WorkshopGroupChatButton.tsx   # Neu (Gruppen-Chat)
├── app/
│   └── workshops/
│       └── page.tsx                       # Erweitert (MessageButton + GroupChat)
└── lib/
    └── messaging-api.ts                   # Wiederverwendet (Phase 1)
```

---

## User Flow

### Szenario 1: Nachricht an Host senden

1. User sieht Workshop mit Host-Info
2. Klickt auf MessageButton (rechts neben Host)
3. `canMessage` → Prüft Kontakt
4. **Kontakt existiert:**
   - Öffnet Direktnachricht in neuem Tab
5. **Kein Kontakt:**
   - Kontaktanfrage-Dialog öffnet sich
   - Pre-filled: "Ich interessiere mich für den Workshop..."
   - User sendet Kontaktanfrage

### Szenario 2: Gruppen-Chat für gebuchten Workshop

1. User hat Workshop gebucht
2. "Gruppen-Chat" Button erscheint unter "Zum Meeting"
3. User klickt auf Button
4. **Existierende Konversation:**
   - Öffnet existierende GROUP-Konversation
5. **Neue Konversation:**
   - Erstellt neue GROUP-Konversation
   - Name: Workshop-Titel
   - Teilnehmer: Alle gebuchten Teilnehmer
   - Öffnet in neuem Tab

---

## Mock-Daten Erweiterung

### Workshop-Schema erweitert:

```typescript
{
  id: string;
  title: string;
  // ... existing fields ...
  hostName: string;
  hostId: string;        // NEU: Für MessageButton
  // ... rest ...
}
```

---

## API-Integration

### Verwendete messaging.mojo Endpoints:

1. **`GET /api/v1/contacts/can-message/:userId`**
   - Prüft ob User Nachricht senden kann
   - Verwendung: Host-Kontakt prüfen

2. **`POST /api/v1/contacts/requests`**
   - Sendet Kontaktanfrage an Host
   - Body: `{ toUserId: string, message: string }`

3. **`GET /api/v1/conversations`**
   - Holt alle Konversationen
   - Filtert nach GROUP-Konversationen (Workshop-Titel)

4. **`POST /api/v1/conversations`**
   - Erstellt neue GROUP-Konversation
   - Body: `{ type: 'GROUP', name: string, participantIds: string[] }`

---

## UI/UX Details

### MessageButton beim Host

- **Position:** Rechts neben Host-Info
- **Größe:** 8x8 (kompakt)
- **Variant:** `ghost`
- **Icon:** MessageCircle
- **Conditional:** Nur wenn User nicht Host ist

### WorkshopGroupChatButton

- **Position:** Unter "Zum Meeting" Button (bei gebuchten Workshops)
- **Größe:** Vollbreite
- **Variant:** `outline`
- **Icon:** Users
- **Label:** "Gruppen-Chat"
- **Conditional:** Nur bei gebuchten Workshops

---

## Testing

### Manuelle Tests:

1. **Workshop-Host - Nachricht senden**
   - [ ] Button erscheint bei fremden Workshops
   - [ ] Button erscheint NICHT bei eigenen Workshops
   - [ ] Klick öffnet Dialog oder Konversation
   - [ ] Pre-filled Nachricht ist sinnvoll

2. **Gruppen-Chat**
   - [ ] Button erscheint nur bei gebuchten Workshops
   - [ ] Button ist disabled wenn keine Teilnehmer
   - [ ] Klick erstellt/öffnet GROUP-Konversation
   - [ ] Konversation hat korrekten Namen (Workshop-Titel)

3. **Graceful Degradation**
   - [ ] Keine Fehler wenn messaging.mojo nicht läuft
   - [ ] Fallback-Dialog wird angezeigt
   - [ ] Toast bei Fehler

---

## Bekannte Limitationen

1. **Teilnehmer-Liste:** `participantIds` ist aktuell leer (Mock)
   - TODO: Lade echte Teilnehmer-Liste von API

2. **Workshop-Metadaten:** `metadata` nicht in Types definiert
   - Workaround: Suche nach Konversation anhand Name (Workshop-Titel)

3. **Host-ID:** Mock `hostId` (z.B. "host-sarah-weber")
   - TODO: Echte Host-IDs von API laden

---

## Nächste Schritte (Phase 4+)

- [ ] Phase 4: Notifications-Integration
- [ ] Phase 5: Full Chat UI (optional)
- [ ] Teilnehmer-Liste von API laden
- [ ] Echte Host-IDs verwenden

---

**Status:** ✅ Phase 3 abgeschlossen

