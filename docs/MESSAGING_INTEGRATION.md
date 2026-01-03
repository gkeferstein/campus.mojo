# messaging.mojo Integration Plan

## Übersicht

Integration von `messaging.mojo` in `campus.mojo` für private Kommunikation, ergänzend zur öffentlichen Community.

## Architektur

```
campus.mojo (Frontend)
  ├── Community (öffentlich) → campus.mojo API
  └── Messaging (privat) → messaging.mojo API + WebSocket
```

**Zwei getrennte Systeme:**
- **Community** = Öffentliche Posts, Kommentare, Success Stories
- **Messaging** = Private Chats, Workshop-Chats, Support

---

## Phase 1: Basis-Integration (Widget in Header)

### 1.1 Environment Variables

```bash
# .env
NEXT_PUBLIC_MESSAGING_API_URL=https://messaging.mojo-institut.de
NEXT_PUBLIC_MESSAGING_WS_URL=wss://messaging.mojo-institut.de

# Development
# NEXT_PUBLIC_MESSAGING_API_URL=http://localhost:3020
# NEXT_PUBLIC_MESSAGING_WS_URL=ws://localhost:3020
```

### 1.2 TypeScript Types

**Datei:** `packages/frontend/src/types/messaging.ts`

Kopiere die Types aus `/Users/g/MOJO/messaging.mojo/docs/types.ts`

### 1.3 Messaging Widget Component

**Datei:** `packages/frontend/src/components/messaging/MessagingWidget.tsx`

**Features:**
- Icon in Header (MessageCircle)
- Unread-Badge (1-99+)
- Dropdown mit 5 letzten Konversationen
- Online-Status-Indicator
- Graceful Degradation (Error Boundary)

**Position:** Header rechts, vor Notifications

### 1.4 Header Integration

**Datei:** `packages/frontend/src/components/layout/Header.tsx`

```tsx
// Reihenfolge: [Search] ... [MessagingWidget] [Notifications] [UserMenu]
<MessagingWidget />
```

---

## Phase 2: Community-Integration ("Nachricht senden")

### 2.1 Community Post Actions

**Datei:** `packages/frontend/src/app/community/page.tsx`

**Neue Funktion:**
- "Nachricht senden" Button bei jedem Post-Author
- Öffnet messaging.mojo mit vorausgefüllter Konversation

**API-Call:**
```typescript
// Prüfe ob Konversation existiert
GET /api/v1/contacts/can-message/:userId

// Falls nicht: Kontaktanfrage senden
POST /api/v1/contacts/requests
{
  toUserId: string,
  message: "Hallo! Ich habe deinen Post gesehen..."
}

// Falls ja: Direktnachricht öffnen
GET /api/v1/conversations?type=DIRECT&participantIds=[userId]
```

### 2.2 Success Story Integration

Bei Erfolgsgeschichten:
- "Gratuliere! Nachricht senden" Button
- Automatische Nachricht: "Hallo! Ich habe deine Erfolgsgeschichte gelesen und bin beeindruckt..."

---

## Phase 3: Workshop-Chats (RESILIENZ)

### 3.1 Workshop Chat Component

**Datei:** `packages/frontend/src/components/workshops/WorkshopChat.tsx`

**Features:**
- Live-Chat während Workshops
- Typing-Indicators
- Read Receipts
- Nur für gebuchte Teilnehmer

**Integration:**
```typescript
// Beim Workshop-Booking: Automatisch GROUP-Conversation erstellen
POST /api/v1/conversations
{
  type: "GROUP",
  name: "Workshop: Morgenroutine Masterclass",
  participantIds: [workshop.participants]
}
```

### 3.2 Workshop Page Integration

**Datei:** `packages/frontend/src/app/workshops/[id]/page.tsx`

- Chat-Panel rechts neben Workshop-Details
- Nur sichtbar wenn gebucht
- WebSocket-Verbindung für Echtzeit

---

## Phase 4: LEBENSENERGIE Circles (RESILIENZ)

### 4.1 Circle Chat

**Datei:** `packages/frontend/src/components/circles/CircleChat.tsx`

**Features:**
- Persistente Gruppen-Chats für Circles
- Max 8 Teilnehmer
- Moderierte Chats (Admin kann löschen)

**Integration:**
```typescript
// Circle erstellen = GROUP-Conversation
POST /api/v1/conversations
{
  type: "GROUP",
  name: "LEBENSENERGIE Circle #23",
  participantIds: [circle.members]
}
```

---

## Phase 5: Support-Chat

### 5.1 Support Widget

**Datei:** `packages/frontend/src/components/support/SupportChat.tsx`

**Features:**
- Immer verfügbar (auch für Free-Tier)
- Öffnet SUPPORT-Conversation
- System-Ankündigungen werden hier angezeigt

**Integration:**
```typescript
// Support-Conversation (immer verfügbar)
GET /api/v1/conversations?type=SUPPORT
```

---

## Technische Implementierung

### API Client

**Datei:** `packages/frontend/src/lib/messaging-api.ts`

```typescript
const MESSAGING_API = process.env.NEXT_PUBLIC_MESSAGING_API_URL;

export const messagingApi = {
  // Conversations
  getConversations: (token: string) => 
    fetch(`${MESSAGING_API}/api/v1/conversations`, {
      headers: { Authorization: `Bearer ${token}` }
    }),
  
  // Messages
  getMessages: (conversationId: string, token: string) =>
    fetch(`${MESSAGING_API}/api/v1/conversations/${conversationId}/messages`, {
      headers: { Authorization: `Bearer ${token}` }
    }),
  
  // Contact Requests
  canMessage: (userId: string, token: string) =>
    fetch(`${MESSAGING_API}/api/v1/contacts/can-message/${userId}`, {
      headers: { Authorization: `Bearer ${token}` }
    }),
  
  sendContactRequest: (toUserId: string, message: string, token: string) =>
    fetch(`${MESSAGING_API}/api/v1/contacts/requests`, {
      method: 'POST',
      headers: { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ toUserId, message })
    }),
};
```

### WebSocket Hook

**Datei:** `packages/frontend/src/hooks/useMessaging.ts`

```typescript
import { useEffect, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import type { ServerToClientEvents, ClientToServerEvents } from '@/types/messaging';

export function useMessaging(token: string | null, tenantId?: string) {
  const [socket, setSocket] = useState<Socket<ServerToClientEvents, ClientToServerEvents> | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  
  useEffect(() => {
    if (!token) return;
    
    const ws = io(process.env.NEXT_PUBLIC_MESSAGING_WS_URL!, {
      auth: { token, tenantId },
      transports: ['websocket'],
      reconnection: true,
    });
    
    ws.on('connect', () => setIsConnected(true));
    ws.on('disconnect', () => setIsConnected(false));
    
    setSocket(ws);
    return () => ws.close();
  }, [token, tenantId]);
  
  const sendMessage = useCallback((conversationId: string, content: string) => {
    socket?.emit('message:send', { conversationId, content });
  }, [socket]);
  
  return { socket, isConnected, sendMessage };
}
```

### Error Boundary

**Datei:** `packages/frontend/src/components/messaging/MessagingErrorBoundary.tsx`

```tsx
'use client';

import { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
}

export class MessagingErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('[Messaging] Error:', error, errorInfo);
    // Optional: Error Reporting (Sentry, etc.)
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || null; // Widget ausblenden bei Fehler
    }

    return this.props.children;
  }
}
```

---

## Use Cases

### Use Case 1: User sieht Community-Post

1. User liest Post von "Maria S."
2. Klickt "Nachricht senden"
3. System prüft: `GET /api/v1/contacts/can-message/:userId`
4. Falls Kontaktanfrage nötig: Dialog öffnen
5. Falls bereits Kontakt: Direktnachricht öffnen

### Use Case 2: Workshop-Chat

1. User bucht Workshop
2. System erstellt automatisch GROUP-Conversation
3. Alle Teilnehmer werden hinzugefügt
4. Chat-Panel erscheint auf Workshop-Detail-Seite
5. WebSocket verbindet für Echtzeit-Messaging

### Use Case 3: LEBENSENERGIE Circle

1. User startet Circle (RESILIENZ)
2. System erstellt GROUP-Conversation
3. Max 8 Teilnehmer
4. Persistenter Chat für Circle-Dauer

### Use Case 4: Support-Anfrage

1. User klickt "Support" Button
2. System öffnet SUPPORT-Conversation
3. Automatische Nachricht: "Hallo! Wie kann ich dir helfen?"
4. Support-Team antwortet

---

## Schrittweise Umsetzung

### ✅ Schritt 1: Basis-Setup
- [ ] Environment Variables hinzufügen
- [ ] TypeScript Types kopieren
- [ ] Messaging API Client erstellen
- [ ] Error Boundary erstellen

### ✅ Schritt 2: Widget in Header
- [ ] MessagingWidget Component
- [ ] Header Integration
- [ ] WebSocket Hook
- [ ] Unread-Count Polling (Fallback)

### ✅ Schritt 3: Community-Integration
- [ ] "Nachricht senden" Button
- [ ] Kontaktanfrage-Dialog
- [ ] Direktnachricht öffnen

### ✅ Schritt 4: Workshop-Chats
- [ ] WorkshopChat Component
- [ ] Auto-Conversation beim Booking
- [ ] Chat-Panel auf Workshop-Seite

### ✅ Schritt 5: Circles & Support
- [ ] Circle Chat
- [ ] Support Widget
- [ ] System-Ankündigungen

---

## Graceful Degradation

### Fallback-Strategien

1. **API nicht erreichbar:**
   - Widget ausblenden
   - Kein Crash der App

2. **WebSocket nicht verfügbar:**
   - Polling alle 30s für Unread-Count
   - Nachrichten nicht live, nur bei Öffnen

3. **Clerk Token ungültig:**
   - Widget ausblenden
   - Keine Fehler in Console

4. **Permission verweigert:**
   - Zeige Info: "Kontaktanfrage erforderlich"
   - Keine Fehler

---

## Performance

### Optimierungen

1. **Lazy Loading:**
   ```tsx
   const MessagingWidget = lazy(() => import('./MessagingWidget'));
   ```

2. **WebSocket nur wenn sichtbar:**
   ```tsx
   useEffect(() => {
     if (!isOpen) return; // Nur verbinden wenn Dropdown offen
     // ... WebSocket connection
   }, [isOpen]);
   ```

3. **Debouncing:**
   - Typing-Events: 300ms
   - Unread-Fetch: 1s

4. **Caching:**
   - Conversations: 5 Minuten
   - Unread-Count: 30 Sekunden

---

## Testing

### Test-Szenarien

1. **Widget lädt korrekt**
2. **Unread-Badge aktualisiert**
3. **Dropdown zeigt Konversationen**
4. **WebSocket verbindet**
5. **Nachricht senden funktioniert**
6. **Graceful Degradation bei Fehlern**

---

## Deployment

### Environment Variables (Production)

```bash
NEXT_PUBLIC_MESSAGING_API_URL=https://messaging.mojo-institut.de
NEXT_PUBLIC_MESSAGING_WS_URL=wss://messaging.mojo-institut.de
```

### CORS (messaging.mojo)

muss `campus.mojo-institut.de` als erlaubte Origin haben.

---

## Monitoring

### Metriken

- Widget-Ladezeit
- WebSocket-Verbindungsrate
- API-Fehlerrate
- Unread-Count Genauigkeit

### Logging

```typescript
console.log('[Messaging] Widget loaded');
console.error('[Messaging] API Error:', error);
console.warn('[Messaging] WebSocket disconnected');
```

---

## Nächste Schritte

1. **Phase 1 implementieren** (Widget in Header)
2. **Testing** (Lokale Entwicklung)
3. **Phase 2** (Community-Integration)
4. **Phase 3** (Workshop-Chats)
5. **Production Deployment**

---

**Status:** 📋 Plan erstellt  
**Nächster Schritt:** Phase 1 implementieren

