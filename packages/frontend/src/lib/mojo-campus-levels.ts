import type { LucideIcon } from "lucide-react";
import {
  Activity,
  Brain,
  Droplets,
  Flame,
  Sparkles,
  Wind,
} from "lucide-react";

export type MojoCampusLevel = {
  slug:
    | "lebensenergie"
    | "oelwechsel"
    | "mikronaehrstoffe"
    | "ein-und-aus"
    | "bewusstseinsalchemie"
    | "ketobrain";
  name: string;
  eyebrow: string;
  claim: string;
  teaser: string;
  outcomes: string[];
  icon: LucideIcon;
  accentClassName: string;
};

export const MOJO_CAMPUS_LEVELS: MojoCampusLevel[] = [
  {
    slug: "lebensenergie",
    name: "Lebensenergie",
    eyebrow: "Stufe 1 · Fundament",
    claim:
      "Der MOJO LEBENSENERGIE Lifestyle – kultiviere einen Alltag, von dem du dich gar nicht mehr erholen willst.",
    teaser:
      "Stabile Energie ist kein Mindset. Es sind Bedingungen: Nervensystem schalten, Entzündung lösen, Stoffwechsel verlässlich machen.",
    outcomes: [
      "Mehr Ruhe im System: weniger „Alarm“, mehr Regenerationsmodus",
      "Klarerer Kopf und stabilere Motivation (ohne Willenskraft-Drama)",
      "Energie, die im Alltag verfügbar bleibt – nicht nur am freien Tag",
      "Praxishebel für Licht, Timing, Nahrung, Bewegung & Hydration",
    ],
    icon: Flame,
    accentClassName: "from-primary/20 to-primary/5 border-primary/25",
  },
  {
    slug: "oelwechsel",
    name: "Ölwechsel",
    eyebrow: "Stufe 2 · Ernährung",
    claim:
      "Der MOJO ÖLWECHSEL – wenn Fett wieder dein Freund wird: Sättigung, Energie und ein ruhiges Immunsystem.",
    teaser:
      "Artgerechte Fette, echte Sättigung, weniger Entzündungsgrundlast – damit dein Körper wieder „auf Laden“ statt „auf Sparflamme“ schaltet.",
    outcomes: [
      "Mehr Sättigung und weniger Cravings (ohne Disziplin-Zwang)",
      "Bessere Verträglichkeit und weniger „nach dem Essen“-Schwere",
      "Klarheit rund um Cholesterin & Fett (ohne Dogmen)",
      "Ein Fett-Setup, das Energieproduktion unterstützt statt bremst",
    ],
    icon: Droplets,
    accentClassName: "from-emerald-500/20 to-emerald-500/5 border-emerald-500/25",
  },
  {
    slug: "mikronaehrstoffe",
    name: "Mikronährstoffe",
    eyebrow: "Stufe 3 · Zellbaukasten",
    claim:
      "Der MOJO MIKRONÄHRSTOFFGUIDE – iss so, dass deine Zellen „Ja“ sagen: Energie entsteht aus Baustoffen.",
    teaser:
      "Mikronährstoffe sind die Werkzeuge deiner Mitochondrien. Wenn ein Teil fehlt, läuft der Motor – aber ohne Zug.",
    outcomes: [
      "Klarheit, welche Nährstoffe wofür stehen (Symptom → Ursache → Quelle)",
      "Lebensmittel-Matches statt Supplement-Raten",
      "Weniger „totes Essen“, mehr bioverfügbare Dichte",
      "Praktische Orientierung, was du als Nächstes wirklich ändern solltest",
    ],
    icon: Sparkles,
    accentClassName: "from-purple-500/20 to-purple-500/5 border-purple-500/25",
  },
  {
    slug: "ein-und-aus",
    name: "Ein & Aus",
    eyebrow: "Stufe 4 · Nervensystem-Remote",
    claim:
      "MOJO EIN & AUS – Atmung als Fernbedienung: in Minuten von Druck zu Präsenz.",
    teaser:
      "Atmung ist Biologie in Echtzeit. Du lernst, wie du den Zustand deines Systems zuverlässig wechselst – ohne „positive Gedanken“.",
    outcomes: [
      "Schnellerer Switch aus Stress in Regulation (praktische Techniken)",
      "Mehr Fokus, weniger Tunnelblick",
      "Ruhigere Nächte durch bessere CO₂-Toleranz & Rhythmus",
      "Ein Protokoll, das in jeden Tag passt – auch wenn alles brennt",
    ],
    icon: Wind,
    accentClassName: "from-sky-500/20 to-sky-500/5 border-sky-500/25",
  },
  {
    slug: "bewusstseinsalchemie",
    name: "Bewusstseinsalchemie",
    eyebrow: "Stufe 5 · Integration",
    claim:
      "MOJO BEWUSSTSEINSALCHEMIE – 5 Minuten morgens, und dein Körper erinnert sich an Ruhe.",
    teaser:
      "Nicht noch mehr Wissen – sondern Verkörperung: kurze, teils „verrückte“ Übungen, die dein Nervensystem im Alltag neu verdrahten.",
    outcomes: [
      "Mehr innere Ruhe, die nicht von äußeren Umständen abhängt",
      "Bessere emotionale Regulation (Reiz → Pause → Wahl)",
      "Ein Morgen-Stack, der auch an schlechten Tagen funktioniert",
      "Spürbar weniger „Funktionsmodus“, mehr Lebensgefühl",
    ],
    icon: Activity,
    accentClassName: "from-amber-500/20 to-amber-500/5 border-amber-500/25",
  },
  {
    slug: "ketobrain",
    name: "KetoBrain",
    eyebrow: "Stufe 6 · Mentale Performance",
    claim:
      "MOJO KETOBRAIN – Ernährung für psychische Gesundheit: Fokus statt Nebel, Stabilität statt Achterbahn.",
    teaser:
      "Wenn der Kopf nicht mitmacht, ist selten „Motivation“ das Problem. Du lernst die Hebel, die Gehirnenergie und Stimmung stabilisieren können.",
    outcomes: [
      "Mehr mentale Klarheit und gleichmäßigere Stimmung",
      "Weniger Brain Fog – mehr „online“ im eigenen Tag",
      "Praxisnahe Ernährungskonzepte ohne religiöse Verbote",
      "Ein Verständnis, das entlastet: Symptome werden interpretierbar",
    ],
    icon: Brain,
    accentClassName: "from-fuchsia-500/20 to-fuchsia-500/5 border-fuchsia-500/25",
  },
];

export function getMojoCampusLevel(slug: string): MojoCampusLevel | undefined {
  return MOJO_CAMPUS_LEVELS.find((l) => l.slug === slug);
}

export function getMojoCampusLevelHref(slug: MojoCampusLevel["slug"]) {
  return `/landing/${slug}`;
}

