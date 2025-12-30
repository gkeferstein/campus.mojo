# Interactive Tools

Das MOJO Campus LMS unterstützt interaktive Tools, die in Lektionen eingebettet werden können. User-Eingaben werden automatisch in der Datenbank persistiert und sind beim nächsten Besuch wieder verfügbar.

## Architektur

```
┌─────────────────────────────────────────────────────────────────┐
│                         Lesson Page                              │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                    LessonRenderer                        │    │
│  │  ┌─────────────────────────────────────────────────────┐│    │
│  │  │        content_block: interactive_tool              ││    │
│  │  │  ┌─────────────────────────────────────────────┐   ││    │
│  │  │  │              ToolRenderer                    │   ││    │
│  │  │  │  ┌─────────────────────────────────────┐    │   ││    │
│  │  │  │  │         VO2MaxCalculator            │    │   ││    │
│  │  │  │  │                                     │    │   ││    │
│  │  │  │  │   useToolVariables Hook             │    │   ││    │
│  │  │  │  │         ↕                           │    │   ││    │
│  │  │  │  │   /user-variables API               │    │   ││    │
│  │  │  │  └─────────────────────────────────────┘    │   ││    │
│  │  │  └─────────────────────────────────────────────┘   ││    │
│  │  └─────────────────────────────────────────────────────┘│    │
│  └─────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                     PostgreSQL (UserVariable)                    │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ user_id | tool_slug        | key     | value           │    │
│  ├─────────┼─────────────────┼─────────┼─────────────────┤    │
│  │ uuid    │ vo2max-calculator│ age     │ 35              │    │
│  │ uuid    │ vo2max-calculator│ steps   │ 8000            │    │
│  │ uuid    │ vo2max-calculator│ stairs  │ 0               │    │
│  └─────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
```

## Komponenten

### ToolRenderer

Zentrale Komponente, die Tools basierend auf `toolSlug` lädt.

**Pfad:** `packages/frontend/src/components/tools/ToolRenderer.tsx`

```typescript
interface ToolRendererProps {
  toolSlug: string;
  config?: Record<string, unknown>;
  lessonId?: string;
  courseId?: string;
}
```

**Tool-Registry:**
```typescript
const toolComponents: Record<string, React.ComponentType<Props>> = {
  "vo2max-calculator": VO2MaxCalculator,
  // Weitere Tools hier registrieren
};
```

**Features:**
- Lazy Loading via `next/dynamic`
- Loading-Spinner während Tool lädt
- Fallback-UI für unbekannte Tools
- Kontext-Weitergabe (lessonId, courseId)

### useToolVariables Hook

React Hook für persistente Tool-Variablen.

**Pfad:** `packages/frontend/src/components/tools/useToolVariables.ts`

```typescript
interface UseToolVariablesOptions {
  toolSlug: string;
  lessonId?: string;
  courseId?: string;
  debounceMs?: number;  // Default: 500ms
}

function useToolVariables<T extends Record<string, unknown>>(
  options: UseToolVariablesOptions
): {
  variables: T;
  updateVariable: <K extends keyof T>(key: K, value: T[K]) => void;
  updateVariables: (updates: Partial<T>) => void;
  saveNow: () => Promise<void>;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
}
```

**Features:**
- Automatisches Laden beim Mount
- Debounced Speichern (500ms default)
- Bulk-Updates für Performance
- Error Handling mit Retry-Queue
- Flush bei Unmount

**Beispiel:**
```typescript
const { variables, updateVariable, isLoading } = useToolVariables<{
  age: number;
  steps: number;
}>({
  toolSlug: "vo2max-calculator",
  lessonId,
  courseId,
});

// Variable aktualisieren (debounced auto-save)
updateVariable("age", 35);
```

---

## Verfügbare Tools

### vo2max-calculator

VO2max Alltags-Schätzer mit 12-Wochen Trainingsplaner.

**Slug:** `vo2max-calculator`

**Pfad:** `packages/frontend/src/components/tools/vo2max/VO2MaxCalculator.tsx`

**Features:**
1. **Alltags-Schätzer**
   - Alter, Schritte/Tag, Treppen, Walk-Talk-Test, Sport-Sessions
   - Berechnet geschätztes VO2max-Band (A-G)
   - Confidence-Indikator

2. **12-Wochen Trainingsplaner**
   - Zeitbudget (60-150+ Min/Woche)
   - Präferenz (Gehen, Rad, Laufen, Mixed)
   - Knie/Orthopädie-Berücksichtigung
   - Ziel: +1 Band in 12 Wochen

**Gespeicherte Variablen:**
| Key | Typ | Beschreibung |
|-----|-----|--------------|
| `age` | number | Alter in Jahren (18-80) |
| `steps` | number | Schritte pro Tag |
| `stairs` | number | Treppen-Belastung (0-2) |
| `walkTalk` | number | Walk-Talk-Belastung (0-2) |
| `sessions` | number | Sport-Sessions/Woche (0-3) |
| `timeBudget` | number | Zeitbudget Min/Woche |
| `pref` | string | Präferenz (walk/bike/run/mixed) |
| `knee` | number | Knie-sensibel (0/1) |
| `overrideStart` | boolean | Start-Band manuell setzen |
| `startBandOverride` | string | Manuelles Start-Band (A-G) |
| `targetBand` | string | Ziel-Band |

**VO2max-Bänder:**
| Band | VO2max | Index |
|------|--------|-------|
| A | < 25 | 0-22 |
| B | 25-30 | 23-34 |
| C | 30-35 | 35-46 |
| D | 35-40 | 47-58 |
| E | 40-45 | 59-70 |
| F | 45-50 | 71-82 |
| G | 50+ | 83-100 |

**Einbettung:**
```json
{
  "type": "interactive_tool",
  "data": {
    "toolSlug": "vo2max-calculator"
  }
}
```

---

## Neues Tool erstellen

### 1. Tool-Komponente erstellen

```
packages/frontend/src/components/tools/
├── index.ts
├── ToolRenderer.tsx
├── useToolVariables.ts
└── mein-tool/
    └── MeinTool.tsx
```

```typescript
// packages/frontend/src/components/tools/mein-tool/MeinTool.tsx
"use client";

import { useToolVariables } from "../useToolVariables";

interface MeinToolVariables {
  eingabe1: string;
  eingabe2: number;
}

const defaultValues: MeinToolVariables = {
  eingabe1: "",
  eingabe2: 0,
};

interface Props {
  lessonId?: string;
  courseId?: string;
  config?: Record<string, unknown>;
}

export function MeinTool({ lessonId, courseId }: Props) {
  const { variables, updateVariable, isLoading, isSaving } = 
    useToolVariables<MeinToolVariables>({
      toolSlug: "mein-tool",
      lessonId,
      courseId,
    });

  const state = { ...defaultValues, ...variables };

  if (isLoading) {
    return <div>Laden...</div>;
  }

  return (
    <div className="rounded-xl border p-6">
      <h3>Mein Tool</h3>
      
      <input
        type="text"
        value={state.eingabe1}
        onChange={(e) => updateVariable("eingabe1", e.target.value)}
      />
      
      <input
        type="number"
        value={state.eingabe2}
        onChange={(e) => updateVariable("eingabe2", parseInt(e.target.value))}
      />
      
      {isSaving && <span>Speichern...</span>}
    </div>
  );
}
```

### 2. Tool in ToolRenderer registrieren

```typescript
// packages/frontend/src/components/tools/ToolRenderer.tsx

const MeinTool = dynamic(
  () => import("./mein-tool/MeinTool").then((mod) => mod.MeinTool),
  { loading: () => <LoadingSpinner /> }
);

const toolComponents: Record<string, React.ComponentType<Props>> = {
  "vo2max-calculator": VO2MaxCalculator,
  "mein-tool": MeinTool,  // Neu hinzufügen
};
```

### 3. In Lektion einbetten

```json
{
  "type": "interactive_tool",
  "data": {
    "toolSlug": "mein-tool",
    "config": {
      "optionaleKonfiguration": true
    }
  }
}
```

---

## API-Referenz

### GET /user-variables

Lädt alle Variablen eines Tools für den aktuellen User.

**Query:** `?toolSlug=vo2max-calculator`

**Response:**
```json
{
  "age": 35,
  "steps": 8000,
  "stairs": 0
}
```

### PUT /user-variables

Speichert eine einzelne Variable.

**Body:**
```json
{
  "toolSlug": "vo2max-calculator",
  "key": "age",
  "value": 35,
  "lessonId": "uuid",
  "courseId": "uuid"
}
```

### POST /user-variables/bulk

Speichert mehrere Variablen auf einmal (vom Hook verwendet).

**Body:**
```json
{
  "toolSlug": "vo2max-calculator",
  "variables": {
    "age": 35,
    "steps": 8000,
    "stairs": 0
  },
  "lessonId": "uuid",
  "courseId": "uuid"
}
```

---

## Datenbank-Schema

```prisma
model UserVariable {
  id        String   @id @default(uuid())
  userId    String   @map("user_id")
  toolSlug  String   @map("tool_slug")
  key       String
  value     Json
  lessonId  String?  @map("lesson_id")
  courseId  String?  @map("course_id")
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  user User @relation(...)

  @@unique([userId, toolSlug, key])
  @@index([userId, toolSlug])
  @@map("user_variables")
}
```

**Constraints:**
- Eindeutig pro User + Tool + Key
- Index für schnelle Tool-Abfragen
- JSON-Wert für flexible Datentypen

---

## Best Practices

### 1. Default Values definieren

```typescript
const defaultValues: MyVariables = {
  option: "default",
  count: 0,
};

const state = { ...defaultValues, ...variables };
```

### 2. Loading State handhaben

```typescript
if (isLoading) {
  return <Skeleton />;
}
```

### 3. Optimistic Updates

Der Hook aktualisiert den lokalen State sofort, speichert aber debounced. Das fühlt sich schneller an.

### 4. Error Handling

```typescript
const { error } = useToolVariables(...);

{error && <ErrorMessage>{error}</ErrorMessage>}
```

### 5. Cleanup bei Unmount

Der Hook flusht automatisch ausstehende Updates beim Unmount.

---

## Geplante Tools

Potenzielle zukünftige Tools:

| Slug | Beschreibung |
|------|--------------|
| `calorie-calculator` | Kalorienberechner |
| `sleep-tracker` | Schlaf-Tracker |
| `electrolyte-checker` | Elektrolyt-Balance |
| `symptom-checker` | Symptom-Muster-Analyse |
| `breathing-timer` | Atemübungs-Timer |

---

## Debugging

### Variablen inspizieren

```bash
# Alle Variablen eines Users für ein Tool
curl -H "Authorization: Bearer <token>" \
  "http://localhost:3001/user-variables?toolSlug=vo2max-calculator"
```

### Datenbank prüfen

```sql
SELECT * FROM user_variables 
WHERE tool_slug = 'vo2max-calculator' 
AND user_id = 'uuid';
```

### React DevTools

Der Hook speichert den State in React State, sichtbar in React DevTools unter dem Tool-Komponenten-Namen.





