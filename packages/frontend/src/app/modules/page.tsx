"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Zap,
  Moon,
  Apple,
  Dumbbell,
  Brain,
  Heart,
  Sun,
  Clock,
  CheckCircle2,
  Lock,
  Play,
  ArrowRight,
  Sparkles,
  Trophy,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

// LEBENSENERGIE Module Definitions (B2C)
const LEBENSENERGIE_MODULES = [
  {
    id: "le-1",
    slug: "kraftquellen",
    title: "Deine Kraftquellen",
    subtitle: "Entdecke, was dir Energie gibt",
    description: "Lerne deine natürlichen Energiequellen kennen und wie du sie gezielt aktivieren kannst.",
    icon: Zap,
    duration: "10 Min",
    lessons: 3,
    color: "#66dd99",
    unlockDay: 0, // Sofort verfügbar
    topics: ["Energie-Mapping", "Kraftquellen identifizieren", "Energie-Rituale"],
  },
  {
    id: "le-2",
    slug: "schlaf-basics",
    title: "Regenerativer Schlaf",
    subtitle: "Die Basis für alles",
    description: "Optimiere deinen Schlaf mit einfachen, wissenschaftlich fundierten Methoden.",
    icon: Moon,
    duration: "15 Min",
    lessons: 4,
    color: "#6366f1",
    unlockDay: 1,
    topics: ["Schlafhygiene", "Einschlaf-Routine", "Schlafumgebung", "Schlaf-Tracking"],
  },
  {
    id: "le-3",
    slug: "energie-ernaehrung",
    title: "Energie durch Ernährung",
    subtitle: "Essen, das dich stärkt",
    description: "Welche Lebensmittel dir wirklich Energie geben – und welche sie rauben.",
    icon: Apple,
    duration: "12 Min",
    lessons: 3,
    color: "#22c55e",
    unlockDay: 1,
    topics: ["Energieräuber meiden", "Power-Foods", "Mahlzeiten-Timing"],
  },
  {
    id: "le-4",
    slug: "bewegung-aktivierung",
    title: "Bewegung als Energiequelle",
    subtitle: "Aktiviere deinen Körper",
    description: "Wie du mit minimaler Bewegung maximale Energie gewinnst – auch bei Erschöpfung.",
    icon: Dumbbell,
    duration: "10 Min",
    lessons: 3,
    color: "#f59e0b",
    unlockDay: 2,
    topics: ["Sanfte Aktivierung", "Energie-Übungen", "Bewegung im Alltag"],
  },
  {
    id: "le-5",
    slug: "stress-regulation",
    title: "Stress verstehen & regulieren",
    subtitle: "Finde deine Balance",
    description: "Lerne, wie Stress deine Energie beeinflusst und wie du ihn effektiv regulierst.",
    icon: Brain,
    duration: "15 Min",
    lessons: 4,
    color: "#8b5cf6",
    unlockDay: 2,
    topics: ["Stress-Signale erkennen", "Atemtechniken", "Entspannungsübungen", "Gedanken-Management"],
  },
  {
    id: "le-6",
    slug: "emotionale-energie",
    title: "Emotionale Energie",
    subtitle: "Gefühle als Kraftquelle",
    description: "Wie du emotionale Energie freisetzt und negative Muster durchbrichst.",
    icon: Heart,
    duration: "12 Min",
    lessons: 3,
    color: "#ec4899",
    unlockDay: 3,
    topics: ["Emotionen wahrnehmen", "Energie-Vampire", "Positive Emotionen kultivieren"],
  },
  {
    id: "le-7",
    slug: "morgen-routine",
    title: "Deine Morgen-Routine",
    subtitle: "Starte energiegeladen in den Tag",
    description: "Baue dir eine Morgenroutine, die dich für den ganzen Tag mit Energie versorgt.",
    icon: Sun,
    duration: "10 Min",
    lessons: 3,
    color: "#f97316",
    unlockDay: 3,
    topics: ["Aufwach-Ritual", "Erste Stunde optimieren", "Energie-Booster am Morgen"],
  },
  {
    id: "le-8",
    slug: "energie-management",
    title: "Energie-Management",
    subtitle: "Dein Tag, deine Energie",
    description: "Plane deinen Tag so, dass du deine Energie optimal nutzt und erhältst.",
    icon: Clock,
    duration: "12 Min",
    lessons: 3,
    color: "#14b8a6",
    unlockDay: 4,
    topics: ["Energie-Rhythmus", "Pausen planen", "Peak-Zeiten nutzen"],
  },
  {
    id: "le-9",
    slug: "ressourcen-aufbau",
    title: "Ressourcen aufbauen",
    subtitle: "Langfristig stark bleiben",
    description: "Wie du deine Energie-Reserven aufbaust und vor dem Burnout schützt.",
    icon: Trophy,
    duration: "15 Min",
    lessons: 4,
    color: "#eab308",
    unlockDay: 5,
    topics: ["Energie-Reserven", "Regeneration", "Nachhaltige Gewohnheiten", "Grenzen setzen"],
  },
  {
    id: "le-10",
    slug: "transformation",
    title: "Deine Transformation",
    subtitle: "Der Weg zur LEBENSENERGIE",
    description: "Fasse alles zusammen und erstelle deinen persönlichen LEBENSENERGIE-Plan.",
    icon: Sparkles,
    duration: "20 Min",
    lessons: 5,
    color: "#66dd99",
    unlockDay: 7,
    topics: ["Rückblick", "Persönlicher Plan", "Nächste Schritte", "Commitment", "Celebration"],
  },
];

// Mock user progress (will come from API)
const USER_MODULE_PROGRESS: Record<string, { completed: boolean; lessonsCompleted: number }> = {
  "le-1": { completed: true, lessonsCompleted: 3 },
  "le-2": { completed: false, lessonsCompleted: 2 },
  "le-3": { completed: false, lessonsCompleted: 0 },
};

// Mock: Days since first check-in
const DAYS_ACTIVE = 2;

export default function ModulesPage() {
  const [selectedModule, setSelectedModule] = useState<string | null>(null);

  // Calculate unlocked modules based on days active
  const unlockedModules = LEBENSENERGIE_MODULES.filter(m => m.unlockDay <= DAYS_ACTIVE);
  const lockedModules = LEBENSENERGIE_MODULES.filter(m => m.unlockDay > DAYS_ACTIVE);

  // Calculate overall progress
  const totalLessons = LEBENSENERGIE_MODULES.reduce((sum, m) => sum + m.lessons, 0);
  const completedLessons = Object.values(USER_MODULE_PROGRESS).reduce((sum, p) => sum + p.lessonsCompleted, 0);
  const overallProgress = (completedLessons / totalLessons) * 100;

  return (
    <div className="container mx-auto py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold mb-2">
          LEBENSENERGIE <span className="text-[#66dd99]">Toolbox</span>
        </h1>
        <p className="text-muted-foreground mb-6">
          10 Module für mehr Energie und Lebensqualität
        </p>

        {/* Overall Progress */}
        <Card className="bg-gradient-to-r from-[#66dd99]/10 to-emerald-50/30 border-[#66dd99]/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-muted-foreground">Gesamtfortschritt</p>
                <p className="text-2xl font-bold">{Math.round(overallProgress)}%</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Module freigeschaltet</p>
                <p className="text-2xl font-bold">{unlockedModules.length}/{LEBENSENERGIE_MODULES.length}</p>
              </div>
            </div>
            <Progress value={overallProgress} className="h-3" />
          </CardContent>
        </Card>
      </motion.div>

      {/* Unlocked Modules */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Zap className="w-5 h-5 text-[#66dd99]" />
          Verfügbare Module
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {unlockedModules.map((module, index) => {
            const Icon = module.icon;
            const progress = USER_MODULE_PROGRESS[module.id];
            const isCompleted = progress?.completed;
            const lessonsProgress = progress ? (progress.lessonsCompleted / module.lessons) * 100 : 0;

            return (
              <motion.div
                key={module.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Link href={`/courses/lebensenergie-${module.slug}`}>
                  <Card className={cn(
                    "h-full hover:shadow-lg hover:border-[#66dd99]/50 transition-all cursor-pointer group",
                    isCompleted && "bg-[#66dd99]/5 border-[#66dd99]/30"
                  )}>
                    <CardHeader className="pb-2">
                      <div className="flex items-start gap-3">
                        <div
                          className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                          style={{ backgroundColor: `${module.color}20` }}
                        >
                          <Icon className="w-6 h-6" style={{ color: module.color }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            {isCompleted && (
                              <CheckCircle2 className="w-4 h-4 text-[#66dd99]" />
                            )}
                            <CardTitle className="text-base group-hover:text-[#66dd99] transition-colors">
                              {module.title}
                            </CardTitle>
                          </div>
                          <CardDescription className="text-xs">
                            {module.subtitle}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-2">
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                        {module.description}
                      </p>
                      
                      <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {module.duration}
                        </span>
                        <span>{module.lessons} Lektionen</span>
                      </div>
                      
                      {progress && !isCompleted && (
                        <Progress value={lessonsProgress} className="h-1.5" />
                      )}
                      
                      {isCompleted && (
                        <div className="flex items-center gap-1 text-xs text-[#66dd99] font-medium">
                          <CheckCircle2 className="w-3 h-3" />
                          Abgeschlossen
                        </div>
                      )}
                      
                      {!progress && (
                        <Button size="sm" className="w-full mt-2 bg-[#66dd99] hover:bg-[#44cc88] text-black">
                          <Play className="w-4 h-4 mr-1" />
                          Starten
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Locked Modules */}
      {lockedModules.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Lock className="w-5 h-5 text-muted-foreground" />
            Bald verfügbar
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {lockedModules.map((module, index) => {
              const Icon = module.icon;
              const daysUntilUnlock = module.unlockDay - DAYS_ACTIVE;

              return (
                <motion.div
                  key={module.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                >
                  <Card className="h-full opacity-60 bg-muted/30">
                    <CardHeader className="pb-2">
                      <div className="flex items-start gap-3">
                        <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center shrink-0">
                          <Lock className="w-5 h-5 text-muted-foreground" />
                        </div>
                        <div className="flex-1">
                          <CardTitle className="text-base text-muted-foreground">
                            {module.title}
                          </CardTitle>
                          <CardDescription className="text-xs">
                            {module.subtitle}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-2">
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                        {module.description}
                      </p>
                      
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        Verfügbar in {daysUntilUnlock} {daysUntilUnlock === 1 ? "Tag" : "Tagen"}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </section>
      )}

      {/* CTA for Trial */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-12"
      >
        <Card className="bg-gradient-to-r from-[#66dd99]/10 to-purple-500/10 border-[#66dd99]/30">
          <CardContent className="p-8 text-center">
            <Sparkles className="w-12 h-12 text-[#66dd99] mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">
              Alle Module sofort freischalten?
            </h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Mit LEBENSENERGIE Premium bekommst du sofort Zugang zu allen 10 Modulen,
              der Community und dem Transformation Tracker.
            </p>
            <Button size="lg" className="bg-[#66dd99] hover:bg-[#44cc88] text-black">
              7 Tage kostenlos testen
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <p className="text-xs text-muted-foreground mt-3">
              Keine Kreditkarte nötig. Jederzeit kündbar.
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

