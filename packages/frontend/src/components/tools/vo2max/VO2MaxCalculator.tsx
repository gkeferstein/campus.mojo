"use client";

import { useMemo } from "react";
import { useToolVariables } from "../useToolVariables";
import { cn } from "@/lib/utils";
import { Loader2, Save, CheckCircle } from "lucide-react";

interface VO2MaxVariables {
  age: number;
  steps: number;
  stairs: number;
  walkTalk: number;
  sessions: number;
  timeBudget: number;
  pref: string;
  knee: number;
  overrideStart: boolean;
  startBandOverride: string;
  targetBand: string;
  [key: string]: unknown; // Index signature for Record<string, unknown> compatibility
}

const defaultValues: VO2MaxVariables = {
  age: 35,
  steps: 6000,
  stairs: 0,
  walkTalk: 0,
  sessions: 0,
  timeBudget: 90,
  pref: "walk",
  knee: 0,
  overrideStart: false,
  startBandOverride: "C",
  targetBand: "C",
};

interface Props {
  lessonId?: string;
  courseId?: string;
  config?: Record<string, unknown>;
}

// Band definitions
const bands = [
  { key: "A", label: "< 25", min: 0, max: 22, vo2: "< 25" },
  { key: "B", label: "25–30", min: 23, max: 34, vo2: "25–30" },
  { key: "C", label: "30–35", min: 35, max: 46, vo2: "30–35" },
  { key: "D", label: "35–40", min: 47, max: 58, vo2: "35–40" },
  { key: "E", label: "40–45", min: 59, max: 70, vo2: "40–45" },
  { key: "F", label: "45–50", min: 71, max: 82, vo2: "45–50" },
  { key: "G", label: "50+", min: 83, max: 100, vo2: "50+" },
];

// Calculation helpers
function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function bandFromIndex(idx: number) {
  const v = clamp(Math.round(idx), 0, 100);
  return bands.find((b) => v >= b.min && v <= b.max) || bands[0];
}

function ageAdj(age: number) {
  const a = clamp(age, 18, 80);
  return clamp(Math.round((35 - a) * 0.12), -7, 6);
}

function stepsScore(steps: number) {
  const s = clamp(steps, 0, 20000);
  const x = s / 20000;
  return Math.pow(x, 0.55) * 55;
}

function sessionScore(sessions: number) {
  return [0, 8, 14, 18][clamp(sessions, 0, 3)];
}

function breathPenalty(stairs: number, walkTalk: number) {
  const sum = clamp(stairs, 0, 2) + clamp(walkTalk, 0, 2);
  return [0, 6, 10, 14, 18][sum];
}

export function VO2MaxCalculator({ lessonId, courseId }: Props) {
  const { variables, updateVariable, isLoading, isSaving, error } = 
    useToolVariables<VO2MaxVariables>({
      toolSlug: "vo2max-calculator",
      lessonId,
      courseId,
    });

  // Merge with defaults
  const state = { ...defaultValues, ...variables };

  // Calculate estimated band
  const { startIndex, startBand, confidence } = useMemo(() => {
    const idx =
      20 +
      stepsScore(state.steps) +
      sessionScore(state.sessions) -
      breathPenalty(state.stairs, state.walkTalk) +
      ageAdj(state.age);

    const index = clamp(Math.round(idx), 0, 100);
    const band = bandFromIndex(index);

    let conf = "hoch";
    if (state.steps <= 0 || state.steps < 2000 || state.steps > 20000) conf = "mittel";
    if (state.stairs + state.walkTalk >= 3 && state.steps >= 12000) conf = "mittel";

    return { startIndex: index, startBand: band, confidence: conf };
  }, [state.age, state.steps, state.stairs, state.walkTalk, state.sessions]);

  // Effective start band (from estimate or override)
  const effectiveStartBand = state.overrideStart 
    ? bands.find(b => b.key === state.startBandOverride) || startBand
    : startBand;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="vo2max-calculator rounded-2xl bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-800 border border-slate-200 dark:border-slate-700 p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">
            VO₂max – Alltags-Schätzer
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Schätze dein Fitness-Level über Alltagssignale
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isSaving && (
            <span className="flex items-center gap-1 text-xs text-slate-500">
              <Save className="w-3 h-3 animate-pulse" />
              Speichern...
            </span>
          )}
          {!isSaving && !error && Object.keys(variables).length > 0 && (
            <span className="flex items-center gap-1 text-xs text-green-600">
              <CheckCircle className="w-3 h-3" />
              Gespeichert
            </span>
          )}
          {error && (
            <span className="text-xs text-red-500">{error}</span>
          )}
        </div>
      </div>

      {/* Step 1: Estimator */}
      <div className="bg-white dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 p-5 space-y-5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            1) Alltags-Schätzer
          </span>
          <span className="text-xs px-2 py-1 rounded-full border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-400">
            Start: Band {effectiveStartBand.key}
          </span>
        </div>

        {/* Age Slider */}
        <div className="grid grid-cols-1 md:grid-cols-[1.2fr_2fr] gap-4 items-start">
          <div>
            <div className="font-medium text-slate-800 dark:text-slate-200">Alter</div>
            <div className="text-xs text-slate-500 dark:text-slate-400">Für Norm-Anpassung</div>
          </div>
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm text-slate-600 dark:text-slate-300 font-medium">{state.age} Jahre</span>
            </div>
            <input
              type="range"
              min={18}
              max={80}
              value={state.age}
              onChange={(e) => updateVariable("age", parseInt(e.target.value))}
              className="w-full accent-green-500"
            />
          </div>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-[1.2fr_2fr] gap-4 items-start border-t border-slate-100 dark:border-slate-700 pt-4">
          <div>
            <div className="font-medium text-slate-800 dark:text-slate-200">Schritte pro Tag</div>
            <div className="text-xs text-slate-500 dark:text-slate-400">Grobe Orientierung</div>
          </div>
          <div className="space-y-2">
            <input
              type="number"
              min={0}
              max={30000}
              step={250}
              value={state.steps}
              onChange={(e) => updateVariable("steps", parseInt(e.target.value) || 0)}
              className="w-full border border-slate-300 dark:border-slate-600 dark:bg-slate-800 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
            <div className="flex flex-wrap gap-2">
              {[3000, 6000, 8000, 10000, 12000].map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => updateVariable("steps", v)}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-xs font-medium border transition-all",
                    state.steps === v
                      ? "bg-green-100 dark:bg-green-900/30 border-green-500 text-green-700 dark:text-green-400"
                      : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-400 hover:border-green-400"
                  )}
                >
                  {v / 1000}k
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Stairs */}
        <div className="grid grid-cols-1 md:grid-cols-[1.2fr_2fr] gap-4 items-start border-t border-slate-100 dark:border-slate-700 pt-4">
          <div>
            <div className="font-medium text-slate-800 dark:text-slate-200">Treppen: 2 Stockwerke zügig?</div>
            <div className="text-xs text-slate-500 dark:text-slate-400">Wie stark außer Atem?</div>
          </div>
          <div className="flex flex-wrap gap-2">
            {[
              { value: 0, label: "Kein Problem" },
              { value: 1, label: "Etwas außer Atem" },
              { value: 2, label: "Deutlich außer Atem" },
            ].map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => updateVariable("stairs", opt.value)}
                className={cn(
                  "px-3 py-2 rounded-full text-xs font-medium border transition-all",
                  state.stairs === opt.value
                    ? "bg-green-100 dark:bg-green-900/30 border-green-500 text-green-700 dark:text-green-400"
                    : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-400 hover:border-green-400"
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Walk Talk */}
        <div className="grid grid-cols-1 md:grid-cols-[1.2fr_2fr] gap-4 items-start border-t border-slate-100 dark:border-slate-700 pt-4">
          <div>
            <div className="font-medium text-slate-800 dark:text-slate-200">10 Min zügig gehen</div>
            <div className="text-xs text-slate-500 dark:text-slate-400">Kannst du dabei sprechen?</div>
          </div>
          <div className="flex flex-wrap gap-2">
            {[
              { value: 0, label: "Ja, normal" },
              { value: 1, label: "Nur kurze Sätze" },
              { value: 2, label: "Kaum möglich" },
            ].map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => updateVariable("walkTalk", opt.value)}
                className={cn(
                  "px-3 py-2 rounded-full text-xs font-medium border transition-all",
                  state.walkTalk === opt.value
                    ? "bg-green-100 dark:bg-green-900/30 border-green-500 text-green-700 dark:text-green-400"
                    : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-400 hover:border-green-400"
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Sessions */}
        <div className="grid grid-cols-1 md:grid-cols-[1.2fr_2fr] gap-4 items-start border-t border-slate-100 dark:border-slate-700 pt-4">
          <div>
            <div className="font-medium text-slate-800 dark:text-slate-200">Sport pro Woche</div>
            <div className="text-xs text-slate-500 dark:text-slate-400">Alles was Puls hebt</div>
          </div>
          <div className="flex flex-wrap gap-2">
            {[
              { value: 0, label: "0" },
              { value: 1, label: "1–2" },
              { value: 2, label: "3–4" },
              { value: 3, label: "5+" },
            ].map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => updateVariable("sessions", opt.value)}
                className={cn(
                  "px-3 py-2 rounded-full text-xs font-medium border transition-all",
                  state.sessions === opt.value
                    ? "bg-green-100 dark:bg-green-900/30 border-green-500 text-green-700 dark:text-green-400"
                    : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-400 hover:border-green-400"
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Result */}
        <div className="rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800 p-4 mt-4">
          <div className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Ergebnis</div>
          <div className="text-lg font-bold text-slate-900 dark:text-white">
            Geschätzt: Band {effectiveStartBand.key} ({effectiveStartBand.vo2}) · Confidence: {confidence}
          </div>
          <div className="text-sm text-slate-600 dark:text-slate-300 mt-2">
            Index: {startIndex}/100 – Dieses Band ist eine Alltags-Schätzung (kein Laborwert).
          </div>
          <div className="flex flex-wrap gap-2 mt-3">
            <span className="text-xs px-2 py-1 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600">
              Index: {startIndex}/100
            </span>
            <span className="text-xs px-2 py-1 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600">
              Band: {effectiveStartBand.key}
            </span>
            <span className="text-xs px-2 py-1 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600">
              {confidence === "hoch" ? "Signal konsistent" : confidence === "mittel" ? "Signal gemischt" : "Daten schwach"}
            </span>
          </div>
        </div>
      </div>

      {/* Step 2: Planner */}
      <div className="bg-white dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 p-5 space-y-5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            2) Upgrade Planner (12 Wochen)
          </span>
        </div>

        {/* Time Budget */}
        <div className="grid grid-cols-1 md:grid-cols-[1.2fr_2fr] gap-4 items-start">
          <div>
            <div className="font-medium text-slate-800 dark:text-slate-200">Zeitbudget pro Woche</div>
            <div className="text-xs text-slate-500 dark:text-slate-400">Summe Trainingszeit</div>
          </div>
          <div className="flex flex-wrap gap-2">
            {[60, 90, 120, 150].map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => updateVariable("timeBudget", v)}
                className={cn(
                  "px-3 py-2 rounded-full text-xs font-medium border transition-all",
                  state.timeBudget === v
                    ? "bg-green-100 dark:bg-green-900/30 border-green-500 text-green-700 dark:text-green-400"
                    : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-400 hover:border-green-400"
                )}
              >
                {v === 150 ? "150+" : v} Min
              </button>
            ))}
          </div>
        </div>

        {/* Preference */}
        <div className="grid grid-cols-1 md:grid-cols-[1.2fr_2fr] gap-4 items-start border-t border-slate-100 dark:border-slate-700 pt-4">
          <div>
            <div className="font-medium text-slate-800 dark:text-slate-200">Präferenz</div>
            <div className="text-xs text-slate-500 dark:text-slate-400">Deine bevorzugte Bewegung</div>
          </div>
          <div className="flex flex-wrap gap-2">
            {[
              { value: "walk", label: "Gehen" },
              { value: "bike", label: "Rad" },
              { value: "run", label: "Laufen" },
              { value: "mixed", label: "Mixed" },
            ].map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => updateVariable("pref", opt.value)}
                className={cn(
                  "px-3 py-2 rounded-full text-xs font-medium border transition-all",
                  state.pref === opt.value
                    ? "bg-green-100 dark:bg-green-900/30 border-green-500 text-green-700 dark:text-green-400"
                    : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-400 hover:border-green-400"
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Knee */}
        <div className="grid grid-cols-1 md:grid-cols-[1.2fr_2fr] gap-4 items-start border-t border-slate-100 dark:border-slate-700 pt-4">
          <div>
            <div className="font-medium text-slate-800 dark:text-slate-200">Knie/Orthopädie sensibel?</div>
            <div className="text-xs text-slate-500 dark:text-slate-400">Für konservativere Progression</div>
          </div>
          <div className="flex gap-2">
            {[
              { value: 0, label: "Nein" },
              { value: 1, label: "Ja" },
            ].map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => updateVariable("knee", opt.value)}
                className={cn(
                  "px-4 py-2 rounded-full text-xs font-medium border transition-all",
                  state.knee === opt.value
                    ? "bg-green-100 dark:bg-green-900/30 border-green-500 text-green-700 dark:text-green-400"
                    : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-400 hover:border-green-400"
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Plan Output */}
        <div className="rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 p-4 mt-4">
          <div className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Dein Plan</div>
          <div className="text-lg font-bold text-slate-900 dark:text-white">
            Start: Band {effectiveStartBand.key} → Ziel: +1 Band in 12 Wochen
          </div>
          <div className="text-sm text-slate-600 dark:text-slate-300 mt-2">
            Bei {state.timeBudget} Min/Woche mit Fokus auf {
              state.pref === "walk" ? "Gehen" : 
              state.pref === "bike" ? "Radfahren" : 
              state.pref === "run" ? "Laufen" : "Mixed Training"
            }
            {state.knee === 1 && " (knie-schonend)"}
          </div>
          <div className="flex flex-wrap gap-2 mt-3">
            <span className="text-xs px-2 py-1 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600">
              Start: Band {effectiveStartBand.key}
            </span>
            <span className="text-xs px-2 py-1 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600">
              Zeit: {state.timeBudget} Min/Woche
            </span>
            <span className="text-xs px-2 py-1 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600">
              Modus: {state.pref === "walk" ? "Gehen" : state.pref === "bike" ? "Rad" : state.pref === "run" ? "Laufen" : "Mixed"}
            </span>
          </div>
        </div>
      </div>

      <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
        Deine Eingaben werden automatisch gespeichert und sind beim nächsten Besuch wieder da.
      </p>
    </div>
  );
}
