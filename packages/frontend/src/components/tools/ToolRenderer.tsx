"use client";

import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";

// Lazy load tool components
const VO2MaxCalculator = dynamic(
  () => import("./vo2max/VO2MaxCalculator").then((mod) => mod.VO2MaxCalculator),
  {
    loading: () => (
      <div className="flex items-center justify-center p-12 bg-slate-50 rounded-xl">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    ),
  }
);

interface ToolRendererProps {
  toolSlug: string;
  config?: Record<string, unknown>;
  lessonId?: string;
  courseId?: string;
}

const toolComponents: Record<string, React.ComponentType<{
  lessonId?: string;
  courseId?: string;
  config?: Record<string, unknown>;
}>> = {
  "vo2max-calculator": VO2MaxCalculator,
  // Weitere Tools hier hinzufügen:
  // "calorie-calculator": CalorieCalculator,
  // "sleep-tracker": SleepTracker,
};

export function ToolRenderer({ toolSlug, config, lessonId, courseId }: ToolRendererProps) {
  const ToolComponent = toolComponents[toolSlug];

  if (!ToolComponent) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 text-center">
        <p className="text-yellow-800 font-medium">Tool nicht gefunden</p>
        <p className="text-yellow-600 text-sm mt-1">
          Das Tool &quot;{toolSlug}&quot; ist nicht verfügbar.
        </p>
      </div>
    );
  }

  return <ToolComponent lessonId={lessonId} courseId={courseId} config={config} />;
}
