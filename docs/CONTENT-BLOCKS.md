# Content-Blöcke

Lektionen im MOJO Campus LMS verwenden ein JSON-basiertes Content-Block-System. Jede Lektion enthält ein Array von `content_blocks`, die vom Frontend (`LessonRenderer`) gerendert werden.

## Übersicht

| Typ | Beschreibung | Verwendung |
|-----|--------------|------------|
| `heading` | Überschrift | Strukturierung, Kapitel |
| `paragraph` | Absatz | Fließtext |
| `callout` | Hinweis-Box | Info, Warnung, Tipp |
| `code_block` | Code-Snippet | Technische Beispiele |
| `image` | Bild | Illustrationen, Screenshots |
| `video_embed` | Video | YouTube, Vimeo |
| `divider` | Trennlinie | Visuelle Trennung |
| `card_grid` | Karten-Raster | Features, Übersichten |
| `pro_tip` | Pro-Tipp | Experten-Hinweise |
| `quiz_embed` | Quiz | Wissenstest einbetten |
| `interactive_tool` | Interaktives Tool | Rechner, Checker |

---

## Block-Typen im Detail

### heading

Überschrift mit konfigurierbarem Level (1-6).

```json
{
  "type": "heading",
  "data": {
    "level": 2,
    "text": "Kapitel: Grundlagen"
  }
}
```

**Properties:**
| Property | Typ | Beschreibung |
|----------|-----|--------------|
| `level` | number | 1-6 (entspricht h1-h6) |
| `text` | string | Überschrift-Text |

**Styling:**
- Level 1: `text-4xl font-bold`
- Level 2: `text-3xl font-bold`
- Level 3: `text-2xl font-semibold`
- Level 4: `text-xl font-semibold`
- Level 5: `text-lg font-medium`
- Level 6: `text-base font-medium`

---

### paragraph

Einfacher Textabsatz.

```json
{
  "type": "paragraph",
  "data": {
    "text": "Dies ist ein Absatz mit Fließtext. Er kann beliebig lang sein."
  }
}
```

**Properties:**
| Property | Typ | Beschreibung |
|----------|-----|--------------|
| `text` | string | Absatz-Inhalt |

**Hinweis:** HTML-Tags werden derzeit nicht unterstützt. Für Rich-Text sollte Markdown im CMS verwendet werden.

---

### callout

Hervorgehobene Hinweis-Box in drei Varianten.

```json
{
  "type": "callout",
  "data": {
    "variant": "info",
    "text": "Wichtiger Hinweis: Diese Information ist essentiell."
  }
}
```

**Properties:**
| Property | Typ | Beschreibung |
|----------|-----|--------------|
| `variant` | string | `info`, `warning`, `tip` |
| `text` | string | Hinweis-Text |

**Varianten:**
| Variant | Icon | Farbe |
|---------|------|-------|
| `info` | Info-Icon | Blau |
| `warning` | Warnung-Icon | Gelb |
| `tip` | Glühbirne | Grün |

---

### code_block

Code-Snippet mit Syntax-Highlighting-Label.

```json
{
  "type": "code_block",
  "data": {
    "language": "typescript",
    "code": "function greet(name: string): string {\n  return `Hallo, ${name}!`;\n}"
  }
}
```

**Properties:**
| Property | Typ | Beschreibung |
|----------|-----|--------------|
| `language` | string | Sprache (für Label) |
| `code` | string | Code-Inhalt |

**Unterstützte Sprachen (Label):**
- `javascript`, `typescript`, `python`, `bash`, `json`, `css`, `html`, etc.

**Hinweis:** Syntax-Highlighting wird derzeit über CSS-Klassen realisiert. Für echtes Highlighting könnte Prism.js oder Shiki integriert werden.

---

### image

Bild mit optionaler Bildunterschrift.

```json
{
  "type": "image",
  "data": {
    "src": "https://campus.mojo-institut.de/cms/assets/uuid",
    "alt": "Beschreibung des Bildes",
    "caption": "Abb. 1: Diagramm der Zellstruktur"
  }
}
```

**Properties:**
| Property | Typ | Beschreibung |
|----------|-----|--------------|
| `src` | string | Bild-URL |
| `alt` | string | Alt-Text für Accessibility |
| `caption` | string | Bildunterschrift (optional) |

**Tipp:** Für Bilder aus Directus die Asset-URL verwenden:
`https://campus.mojo-institut.de/cms/assets/<file-uuid>`

---

### video_embed

Eingebettetes Video von YouTube oder Vimeo.

```json
{
  "type": "video_embed",
  "data": {
    "url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    "title": "Einführungsvideo"
  }
}
```

**Properties:**
| Property | Typ | Beschreibung |
|----------|-----|--------------|
| `url` | string | YouTube oder Vimeo URL |
| `title` | string | Video-Titel (für iframe) |

**Unterstützte URL-Formate:**
- YouTube: `https://www.youtube.com/watch?v=VIDEO_ID`
- YouTube Short: `https://youtu.be/VIDEO_ID`
- Vimeo: `https://vimeo.com/VIDEO_ID`

Das Frontend konvertiert diese automatisch in Embed-URLs.

---

### divider

Horizontale Trennlinie.

```json
{
  "type": "divider",
  "data": {}
}
```

**Properties:** Keine

**Verwendung:** Visuelle Trennung zwischen Abschnitten.

---

### card_grid

Raster aus Karten für Features, Vorteile oder Übersichten.

```json
{
  "type": "card_grid",
  "data": {
    "cards": [
      {
        "title": "Frühe Fehlererkennung",
        "description": "Finde Bugs bereits während der Entwicklung."
      },
      {
        "title": "Bessere IDE-Unterstützung",
        "description": "Profitiere von Autovervollständigung."
      },
      {
        "title": "Selbstdokumentierender Code",
        "description": "Typen machen Code lesbarer."
      },
      {
        "title": "Große Community",
        "description": "Tausende typisierte Bibliotheken."
      }
    ]
  }
}
```

**Properties:**
| Property | Typ | Beschreibung |
|----------|-----|--------------|
| `cards` | array | Array von Card-Objekten |

**Card-Objekt:**
| Property | Typ | Beschreibung |
|----------|-----|--------------|
| `title` | string | Karten-Titel |
| `description` | string | Karten-Beschreibung |
| `icon` | string | Icon-Name (optional, nicht implementiert) |

**Layout:** 1 Spalte (mobil), 2 Spalten (Desktop)

---

### pro_tip

Hervorgehobener Experten-Tipp mit Gradient-Background.

```json
{
  "type": "pro_tip",
  "data": {
    "text": "TypeScript kann schrittweise in JavaScript-Projekte eingeführt werden!"
  }
}
```

**Properties:**
| Property | Typ | Beschreibung |
|----------|-----|--------------|
| `text` | string | Tipp-Text |

**Styling:** Gradient von Primary zu Purple mit "PRO TIP" Badge.

---

### quiz_embed

Eingebettete Quiz-Referenz mit Link zum Quiz-Start.

```json
{
  "type": "quiz_embed",
  "data": {
    "quizId": "550e8400-e29b-41d4-a716-446655440040"
  }
}
```

**Properties:**
| Property | Typ | Beschreibung |
|----------|-----|--------------|
| `quizId` | string | UUID des Quiz aus Directus |

**Verhalten:** Zeigt eine Karte mit "Quiz starten"-Button, der zu `/quiz/{quizId}` navigiert.

---

### interactive_tool

Einbettung eines interaktiven Tools wie dem VO2Max Calculator.

```json
{
  "type": "interactive_tool",
  "data": {
    "toolSlug": "vo2max-calculator",
    "config": {
      "showPlanner": true
    }
  }
}
```

**Properties:**
| Property | Typ | Beschreibung |
|----------|-----|--------------|
| `toolSlug` | string | Identifier des Tools |
| `config` | object | Tool-spezifische Konfiguration (optional) |

**Verfügbare Tools:**
| Slug | Beschreibung |
|------|--------------|
| `vo2max-calculator` | VO2Max Alltags-Schätzer mit Trainingsplaner |

**Kontext:** Das Tool erhält automatisch `lessonId` und `courseId` für die Variable-Persistenz.

Siehe [INTERACTIVE-TOOLS.md](INTERACTIVE-TOOLS.md) für Details zum Tool-System.

---

## Beispiel: Vollständige Lektion

```json
{
  "content_blocks": [
    {
      "type": "heading",
      "data": { "level": 2, "text": "Was ist TypeScript?" }
    },
    {
      "type": "paragraph",
      "data": { "text": "TypeScript ist eine von Microsoft entwickelte Programmiersprache..." }
    },
    {
      "type": "callout",
      "data": { 
        "variant": "info", 
        "text": "TypeScript wird zu JavaScript kompiliert." 
      }
    },
    {
      "type": "heading",
      "data": { "level": 3, "text": "Vorteile" }
    },
    {
      "type": "card_grid",
      "data": {
        "cards": [
          { "title": "Typsicherheit", "description": "Frühe Fehlererkennung" },
          { "title": "Tooling", "description": "Bessere IDE-Unterstützung" }
        ]
      }
    },
    {
      "type": "divider",
      "data": {}
    },
    {
      "type": "code_block",
      "data": {
        "language": "typescript",
        "code": "const greeting: string = 'Hallo Welt';"
      }
    },
    {
      "type": "pro_tip",
      "data": { "text": "Nutze strict mode für maximale Typsicherheit!" }
    },
    {
      "type": "interactive_tool",
      "data": { "toolSlug": "vo2max-calculator" }
    },
    {
      "type": "quiz_embed",
      "data": { "quizId": "550e8400-e29b-41d4-a716-446655440040" }
    }
  ]
}
```

---

## Neue Block-Typen hinzufügen

1. **Frontend:** Block-Komponente in `LessonRenderer.tsx` hinzufügen
2. **Directus:** Schema für `content_blocks` JSON anpassen
3. **Dokumentation:** Dieses Dokument aktualisieren

```typescript
// packages/frontend/src/components/LessonRenderer.tsx
case "new_block_type":
  return <NewBlockComponent data={block.data} />;
```

---

## Validierung

Content-Blocks werden nicht automatisch validiert. Best Practices:

1. **In Directus:** Beispiel-JSON als Vorlage bereitstellen
2. **Im Frontend:** Fallback für unbekannte Block-Typen (gibt `null` zurück)
3. **Seed-Script:** Valide Beispiele in `scripts/seed-directus.js`

