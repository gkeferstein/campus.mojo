# Tool-Suites und Tools Schema für Directus

Dieses Dokument beschreibt die Directus Collections, die für die Verwaltung von Tool-Suites und Tools benötigt werden.

## Collections

### 1. `tool_suites`

Die Hauptkategorien für Tools (z.B. "Gesundheitsanalysen", "Trainingsplaner", "Finanzen").

**Felder:**
- `id` (UUID, Primary Key)
- `name` (String, Required) - Name der Suite (z.B. "Gesundheitsanalysen")
- `slug` (String, Unique, Required) - URL-freundlicher Identifier (z.B. "health")
- `description` (Text) - Beschreibung der Suite
- `icon` (String) - Icon-Name (z.B. "heart", "dumbbell", "wallet")
- `color` (String) - Farbe für die Suite (z.B. "red", "blue", "green")
- `order_index` (Integer) - Sortierreihenfolge
- `published` (Boolean, Default: false) - Ob die Suite veröffentlicht ist
- `tenant_id` (UUID, Foreign Key → tenants) - Optional: Tenant-spezifische Suite
- `created_at` (Timestamp)
- `updated_at` (Timestamp)

**Beziehungen:**
- `tools` (One-to-Many → tools) - Tools in dieser Suite

### 2. `tools`

Einzelne Tools innerhalb einer Suite.

**Felder:**
- `id` (UUID, Primary Key)
- `suite_id` (UUID, Foreign Key → tool_suites, Required)
- `name` (String, Required) - Name des Tools (z.B. "VO2Max Rechner")
- `slug` (String, Required) - URL-freundlicher Identifier (z.B. "vo2max")
- `description` (Text) - Beschreibung des Tools
- `icon` (String) - Icon-Name
- `component_slug` (String) - Identifier für die React-Komponente (z.B. "vo2max-calculator")
- `status` (String, Default: "coming-soon") - Status: "available", "coming-soon", "beta", "deprecated"
- `order_index` (Integer) - Sortierreihenfolge innerhalb der Suite
- `config` (JSON) - Tool-spezifische Konfiguration
- `published` (Boolean, Default: false) - Ob das Tool veröffentlicht ist
- `created_at` (Timestamp)
- `updated_at` (Timestamp)

**Beziehungen:**
- `suite` (Many-to-One → tool_suites) - Zugehörige Suite

## Directus Setup

### Schritt 1: Collections erstellen

1. Öffne Directus Admin Panel
2. Gehe zu Settings → Data Model
3. Erstelle die Collections wie oben beschrieben

### Schritt 2: Beziehungen konfigurieren

1. In `tools` Collection:
   - Erstelle Relation Field `suite_id` → `tool_suites.id`
   - Setze Type: "Many to One"
   - Setze Delete Rule: "Set Null" oder "Cascade" (je nach Anforderung)

### Schritt 3: Initiale Daten importieren

Verwende die folgenden Seed-Daten:

**tool_suites:**
```json
[
  {
    "name": "Gesundheitsanalysen",
    "slug": "health",
    "description": "Umfassende Tools zur Analyse und Optimierung deiner Gesundheit",
    "icon": "heart",
    "color": "red",
    "order_index": 1,
    "published": true
  },
  {
    "name": "Trainingsplaner",
    "slug": "training",
    "description": "Professionelle Tools für dein Training und deine Fitness",
    "icon": "dumbbell",
    "color": "blue",
    "order_index": 2,
    "published": true
  },
  {
    "name": "Finanzen",
    "slug": "finance",
    "description": "Tools für deine finanzielle Planung und Optimierung",
    "icon": "wallet",
    "color": "green",
    "order_index": 3,
    "published": true
  }
]
```

**tools:**
```json
[
  {
    "suite_id": "<health-suite-id>",
    "name": "VO2Max Rechner",
    "slug": "vo2max",
    "description": "Berechne deine maximale Sauerstoffaufnahme basierend auf deinen Fitnessdaten",
    "icon": "activity",
    "component_slug": "vo2max-calculator",
    "status": "available",
    "order_index": 1,
    "published": true
  },
  {
    "suite_id": "<health-suite-id>",
    "name": "Schlafanalyse",
    "slug": "sleep",
    "description": "Analysiere deine Schlafqualität und optimiere deine Regeneration",
    "icon": "moon",
    "component_slug": "sleep-analyzer",
    "status": "coming-soon",
    "order_index": 2,
    "published": false
  }
]
```

## API Integration

Die API sollte Funktionen bereitstellen, um Tool-Suites und Tools aus Directus zu laden:

```typescript
// In packages/api/src/lib/directus.ts

export interface ToolSuite {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  color: string | null;
  order_index: number;
  published: boolean;
  tenant_id: string | null;
  tools?: Tool[];
}

export interface Tool {
  id: string;
  suite_id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  component_slug: string;
  status: 'available' | 'coming-soon' | 'beta' | 'deprecated';
  order_index: number;
  config: Record<string, unknown> | null;
  published: boolean;
}

export async function getToolSuites(tenantId?: string): Promise<ToolSuite[]> {
  const filter = tenantId 
    ? `&filter[_or][0][tenant_id][_null]=true&filter[_or][1][tenant_id][_eq]=${tenantId}`
    : '&filter[tenant_id][_null]=true';
  
  return directusFetch<ToolSuite[]>(
    `/items/tool_suites?filter[published][_eq]=true${filter}&sort=order_index&fields=*,tools.id,tools.name,tools.slug,tools.description,tools.icon,tools.component_slug,tools.status,tools.order_index,tools.published&deep[tools][_sort]=order_index`
  );
}

export async function getToolSuiteBySlug(slug: string): Promise<ToolSuite | null> {
  const suites = await directusFetch<ToolSuite[]>(
    `/items/tool_suites?filter[slug][_eq]=${slug}&filter[published][_eq]=true&fields=*,tools.id,tools.name,tools.slug,tools.description,tools.icon,tools.component_slug,tools.status,tools.order_index,tools.published&deep[tools][_sort]=order_index`
  );
  return suites[0] || null;
}

export async function getToolBySlug(suiteSlug: string, toolSlug: string): Promise<Tool | null> {
  const suite = await getToolSuiteBySlug(suiteSlug);
  if (!suite || !suite.tools) return null;
  return suite.tools.find(t => t.slug === toolSlug) || null;
}
```

## Frontend Integration

Die Frontend-Seiten können dann dynamisch aus Directus geladen werden:

```typescript
// In packages/frontend/src/app/tools/page.tsx
import { getToolSuites } from '@/lib/api';

export default async function ToolsPage() {
  const suites = await getToolSuites();
  // Render suites dynamically
}
```

## Migration von Hardcoded zu Dynamic

Aktuell sind die Tool-Suites hardcodiert in den React-Komponenten. Für eine vollständige Migration:

1. ✅ Directus Schema erstellen (dieses Dokument)
2. ⏳ API-Funktionen implementieren (siehe oben)
3. ⏳ Frontend-Seiten auf dynamische Daten umstellen
4. ⏳ Seed-Daten in Directus importieren

