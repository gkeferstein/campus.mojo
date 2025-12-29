'use client';

/**
 * MOJO Learning Journey Page
 * Visualizes the user's progress through the MOJO education system
 * Inspired by the accounts.mojo MOJO Journey design
 */

import { motion } from 'framer-motion';
import { 
  Check, 
  Lock, 
  ChevronRight, 
  Zap, 
  Users, 
  Briefcase, 
  Cpu, 
  Target,
  Building2,
  Trophy,
  Flame,
  Star,
  BookOpen,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

// MOJO Learning Stages - Maps to the graduation system
const LEARNING_STAGES = [
  {
    id: 'lebensenergie',
    name: 'LEBENSENERGIE',
    subtitle: 'Finde dein MOJO (wieder)',
    color: '#66dd99',
    textColor: '#000000',
    icon: Zap,
    description: 'Der Beginn deiner Transformation. Hier lernst du die Grundlagen der Regeneration und findest zurück zu deiner natürlichen Lebensenergie.',
    modules: [
      { id: 'le-1', name: 'Energie-Assessment', description: 'Analysiere deinen aktuellen Energielevel', lessons: 5 },
      { id: 'le-2', name: 'Schlaf-Optimierung', description: 'Implementiere die MOJO Schlafstrategie', lessons: 8 },
      { id: 'le-3', name: 'Ernährungsgrundlagen', description: 'Verstehe die Basics der regenerativen Ernährung', lessons: 12 },
      { id: 'le-4', name: 'Bewegungsroutine', description: 'Etabliere deine tägliche Bewegungspraxis', lessons: 6 },
      { id: 'le-5', name: 'Stressmanagement', description: 'Lerne Techniken zur Stressregulation', lessons: 7 },
      { id: 'le-6', name: 'MOJO Mindset', description: 'Verankere das MOJO Mindset in deinem Alltag', lessons: 4 },
    ],
  },
  {
    id: 'campus',
    name: 'CAMPUS',
    subtitle: 'Vernetze dich und optimiere deine Regeneration',
    color: '#ffffff',
    textColor: '#000000',
    borderColor: '#e5e5e5',
    icon: Users,
    description: 'Werde Teil der MOJO Community. Vertiefe dein Wissen und verbinde dich mit Gleichgesinnten auf dem Weg zur optimalen Gesundheit.',
    modules: [
      { id: 'ca-1', name: 'Community Onboarding', description: 'Trete der MOJO Community bei', lessons: 3 },
      { id: 'ca-2', name: 'Mastermind-Teilnahme', description: 'Nimm an deiner ersten Mastermind teil', lessons: 4 },
      { id: 'ca-3', name: 'Regenerations-Tracking', description: 'Implementiere fortgeschrittenes Tracking', lessons: 9 },
      { id: 'ca-4', name: 'Biohacking Basics', description: 'Erlerne grundlegende Biohacking-Techniken', lessons: 11 },
      { id: 'ca-5', name: 'Peer Support', description: 'Unterstütze andere auf ihrer Journey', lessons: 5 },
      { id: 'ca-6', name: 'Campus Graduation', description: 'Schließe alle Campus-Module ab', lessons: 2 },
    ],
  },
  {
    id: 'bootcamp',
    name: 'BUSINESS BOOTCAMP',
    subtitle: 'Starte dein eigenes Gesundheitsbusiness',
    color: '#0d63bf',
    textColor: '#ffffff',
    icon: Briefcase,
    description: 'Transformiere dein Wissen in ein Business. Lerne die Grundlagen des Gesundheits-Unternehmertums.',
    modules: [
      { id: 'bb-1', name: 'Business Vision', description: 'Definiere deine Geschäftsidee', lessons: 6 },
      { id: 'bb-2', name: 'Zielgruppen-Analyse', description: 'Identifiziere deine idealen Klienten', lessons: 5 },
      { id: 'bb-3', name: 'Angebotsstruktur', description: 'Entwickle dein Produktportfolio', lessons: 8 },
      { id: 'bb-4', name: 'Marketing Fundamentals', description: 'Lerne die MOJO Marketing-Strategie', lessons: 12 },
      { id: 'bb-5', name: 'Erste Klienten', description: 'Gewinne deine ersten zahlenden Klienten', lessons: 7 },
      { id: 'bb-6', name: 'Business Launch', description: 'Launche offiziell dein Business', lessons: 4 },
    ],
  },
  {
    id: 'rmos',
    name: 'RegenerationsmedizinOS',
    subtitle: 'Das Betriebssystem für chronische Gesundheit',
    color: '#873acf',
    textColor: '#ffffff',
    icon: Cpu,
    description: 'Installiere das komplette Betriebssystem der Regenerationsmedizin. Verstehe die tieferen Zusammenhänge und werde zum Experten.',
    modules: [
      { id: 'rm-1', name: 'System-Grundlagen', description: 'Verstehe das RMOS Framework', lessons: 10 },
      { id: 'rm-2', name: 'Diagnostik-Protokolle', description: 'Lerne fortgeschrittene Diagnostik', lessons: 15 },
      { id: 'rm-3', name: 'Interventions-Strategien', description: 'Meistere die Interventionsprotokolle', lessons: 18 },
      { id: 'rm-4', name: 'Fallstudien', description: 'Analysiere komplexe Patientenfälle', lessons: 12 },
      { id: 'rm-5', name: 'Supervision', description: 'Führe eigene Fälle unter Supervision', lessons: 8 },
      { id: 'rm-6', name: 'RMOS Zertifizierung', description: 'Erhalte deine RMOS Zertifizierung', lessons: 3 },
    ],
  },
  {
    id: 'praxiszirkel',
    name: 'Praxiszirkel',
    subtitle: 'Behandle Menschen unter Fachleuten',
    color: '#f5bb00',
    textColor: '#000000',
    icon: Target,
    description: 'Werde Teil des exklusiven Praxiszirkels. Lerne von Experten krankheitsspezifische Behandlungsstrategien.',
    modules: [
      { id: 'pz-1', name: 'Zirkel-Aufnahme', description: 'Werde in den Praxiszirkel aufgenommen', lessons: 2 },
      { id: 'pz-2', name: 'Spezialisierung wählen', description: 'Wähle dein Fachgebiet', lessons: 4 },
      { id: 'pz-3', name: 'Fallbesprechungen', description: 'Nimm an Fallbesprechungen teil', lessons: 20 },
      { id: 'pz-4', name: 'Eigene Protokolle', description: 'Entwickle eigene Behandlungsprotokolle', lessons: 10 },
      { id: 'pz-5', name: 'Mentor werden', description: 'Beginne andere zu mentoren', lessons: 6 },
      { id: 'pz-6', name: 'Praxiszirkel Master', description: 'Erreiche den Master-Status', lessons: 3 },
    ],
  },
  {
    id: 'inkubator',
    name: 'MOJO Inkubator',
    subtitle: 'Eröffne dein eigenes MOJO Institut',
    color: '#000000',
    textColor: '#ffffff',
    icon: Building2,
    description: 'Der Gipfel der MOJO Journey. Werde Franchisepartner und eröffne dein eigenes MOJO Institut.',
    modules: [
      { id: 'in-1', name: 'Inkubator Bewerbung', description: 'Bewirb dich für den Inkubator', lessons: 3 },
      { id: 'in-2', name: 'Business Due Diligence', description: 'Durchlaufe die Eignungsprüfung', lessons: 5 },
      { id: 'in-3', name: 'Standort-Analyse', description: 'Analysiere potenzielle Standorte', lessons: 4 },
      { id: 'in-4', name: 'Team-Aufbau', description: 'Stelle dein Kernteam zusammen', lessons: 7 },
      { id: 'in-5', name: 'Institut Setup', description: 'Richte dein Institut ein', lessons: 12 },
      { id: 'in-6', name: 'Grand Opening', description: 'Feiere die Eröffnung deines MOJO Instituts', lessons: 2 },
    ],
  },
];

// Mock user progress (frontend only for now)
const USER_PROGRESS = {
  currentStage: 1, // 0-indexed, so 1 = Campus
  completedModules: ['le-1', 'le-2', 'le-3', 'le-4', 'le-5', 'le-6', 'ca-1', 'ca-2'],
  completedLessons: 42,
  totalLessons: 264,
};

function ProgressContent() {
  const [selectedStage, setSelectedStage] = useState<number | null>(null);
  const [hoveredStage, setHoveredStage] = useState<number | null>(null);

  const isStageCompleted = (stageIndex: number) => {
    return stageIndex < USER_PROGRESS.currentStage;
  };

  const isStageActive = (stageIndex: number) => {
    return stageIndex === USER_PROGRESS.currentStage;
  };

  const isStageLocked = (stageIndex: number) => {
    return stageIndex > USER_PROGRESS.currentStage;
  };

  const isModuleCompleted = (moduleId: string) => {
    return USER_PROGRESS.completedModules.includes(moduleId);
  };

  const getStageProgress = (stageIndex: number) => {
    const stage = LEARNING_STAGES[stageIndex];
    const completed = stage.modules.filter(m => isModuleCompleted(m.id)).length;
    return (completed / stage.modules.length) * 100;
  };

  const getTotalProgress = () => {
    const totalModules = LEARNING_STAGES.reduce((acc, s) => acc + s.modules.length, 0);
    return (USER_PROGRESS.completedModules.length / totalModules) * 100;
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
          <Trophy className="w-4 h-4" />
          Dein Fortschritt: {getTotalProgress().toFixed(0)}%
        </div>
        <h1 className="text-4xl font-bold mb-2">Meine MOJO Journey</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Von der ersten Erkenntnis bis zum eigenen MOJO Institut – 
          verfolge deinen Lernfortschritt durch das MOJO Graduierungssystem.
        </p>
      </motion.div>

      {/* Journey Visualization */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="relative"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent rounded-3xl" />
        
        <div className="relative bg-card/50 backdrop-blur-sm border border-border rounded-3xl p-8">
          {/* Progress Line */}
          <div className="absolute left-1/2 top-24 bottom-24 w-1 -translate-x-1/2 bg-border rounded-full overflow-hidden">
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: `${getTotalProgress()}%` }}
              transition={{ duration: 1, delay: 0.5 }}
              className="w-full bg-gradient-to-b from-[#66dd99] via-[#873acf] to-[#000000] rounded-full"
            />
          </div>

          {/* Stages */}
          <div className="relative space-y-4">
            {LEARNING_STAGES.map((stage, index) => {
              const Icon = stage.icon;
              const completed = isStageCompleted(index);
              const active = isStageActive(index);
              const locked = isStageLocked(index);
              const progress = getStageProgress(index);
              const isSelected = selectedStage === index;
              const isHovered = hoveredStage === index;

              return (
                <motion.div
                  key={stage.id}
                  initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * index }}
                  className={cn(
                    'relative grid grid-cols-[1fr_auto_1fr] gap-8 items-center',
                    index % 2 === 0 ? '' : 'direction-rtl'
                  )}
                >
                  {/* Stage Card */}
                  <div className={cn(
                    index % 2 === 0 ? 'text-right' : 'text-left order-3'
                  )}>
                    <motion.button
                      onClick={() => setSelectedStage(isSelected ? null : index)}
                      onMouseEnter={() => setHoveredStage(index)}
                      onMouseLeave={() => setHoveredStage(null)}
                      whileHover={{ scale: locked ? 1 : 1.02 }}
                      whileTap={{ scale: locked ? 1 : 0.98 }}
                      disabled={locked}
                      className={cn(
                        'w-full p-6 rounded-2xl border-2 transition-all duration-300 text-left',
                        locked && 'opacity-50 cursor-not-allowed',
                        !locked && 'cursor-pointer hover:shadow-lg',
                        isSelected && 'ring-2 ring-offset-2 ring-offset-background',
                        completed && 'bg-card',
                        active && 'bg-card shadow-lg'
                      )}
                      style={{
                        borderColor: locked ? 'hsl(var(--border))' : stage.color,
                        boxShadow: (isHovered || isSelected) && !locked 
                          ? `0 0 30px ${stage.color}40` 
                          : undefined,
                        ['--tw-ring-color' as string]: stage.color,
                      }}
                    >
                      <div className="flex items-start gap-4">
                        <div
                          className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                          style={{ 
                            backgroundColor: locked ? 'hsl(var(--muted))' : `${stage.color}20`,
                          }}
                        >
                          {completed ? (
                            <Check className="w-6 h-6" style={{ color: stage.color }} />
                          ) : locked ? (
                            <Lock className="w-5 h-5 text-muted-foreground" />
                          ) : (
                            <Icon className="w-6 h-6" style={{ color: stage.color }} />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span
                              className="text-xs font-bold tracking-wider px-2 py-0.5 rounded"
                              style={{
                                backgroundColor: locked ? 'hsl(var(--muted))' : stage.color,
                                color: locked ? 'hsl(var(--muted-foreground))' : stage.textColor,
                                border: stage.borderColor ? `1px solid ${stage.borderColor}` : undefined,
                              }}
                            >
                              STUFE {index + 1}
                            </span>
                            {active && (
                              <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded font-medium">
                                AKTUELL
                              </span>
                            )}
                          </div>
                          <h3 className="font-bold text-lg mb-1">{stage.name}</h3>
                          <p className="text-sm text-muted-foreground">{stage.subtitle}</p>
                          
                          {/* Progress Bar */}
                          {!locked && (
                            <div className="mt-3">
                              <div className="flex items-center justify-between text-xs mb-1">
                                <span className="text-muted-foreground">Fortschritt</span>
                                <span className="font-medium">{progress.toFixed(0)}%</span>
                              </div>
                              <div className="h-2 bg-secondary rounded-full overflow-hidden">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${progress}%` }}
                                  transition={{ duration: 0.5, delay: 0.2 * index }}
                                  className="h-full rounded-full"
                                  style={{ backgroundColor: stage.color }}
                                />
                              </div>
                            </div>
                          )}
                        </div>
                        {!locked && (
                          <ChevronRight 
                            className={cn(
                              'w-5 h-5 text-muted-foreground transition-transform',
                              isSelected && 'rotate-90'
                            )} 
                          />
                        )}
                      </div>
                    </motion.button>
                  </div>

                  {/* Center Node */}
                  <div className="relative z-10">
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      className={cn(
                        'w-16 h-16 rounded-full border-4 flex items-center justify-center transition-all',
                        locked ? 'bg-muted border-border' : 'bg-card'
                      )}
                      style={{
                        borderColor: locked ? undefined : stage.color,
                        boxShadow: !locked ? `0 0 20px ${stage.color}60` : undefined,
                      }}
                    >
                      {completed ? (
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center"
                          style={{ backgroundColor: stage.color }}
                        >
                          <Check className="w-6 h-6" style={{ color: stage.textColor }} />
                        </div>
                      ) : active ? (
                        <div className="relative">
                          <Flame className="w-6 h-6" style={{ color: stage.color }} />
                          <motion.div
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ repeat: Infinity, duration: 2 }}
                            className="absolute inset-0 rounded-full"
                            style={{ backgroundColor: `${stage.color}20` }}
                          />
                        </div>
                      ) : (
                        <Lock className="w-5 h-5 text-muted-foreground" />
                      )}
                    </motion.div>
                  </div>

                  {/* Empty space */}
                  <div className={index % 2 === 0 ? 'order-3' : ''} />
                </motion.div>
              );
            })}
          </div>
        </div>
      </motion.div>

      {/* Selected Stage Details */}
      {selectedStage !== null && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card border border-border rounded-2xl overflow-hidden"
        >
          <div
            className="p-6"
            style={{
              backgroundColor: `${LEARNING_STAGES[selectedStage].color}15`,
              borderBottom: `2px solid ${LEARNING_STAGES[selectedStage].color}`,
            }}
          >
            <div className="flex items-center gap-4">
              <div
                className="w-14 h-14 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: LEARNING_STAGES[selectedStage].color }}
              >
                {(() => {
                  const Icon = LEARNING_STAGES[selectedStage].icon;
                  return <Icon className="w-7 h-7" style={{ color: LEARNING_STAGES[selectedStage].textColor }} />;
                })()}
              </div>
              <div>
                <h2 className="text-2xl font-bold">{LEARNING_STAGES[selectedStage].name}</h2>
                <p className="text-muted-foreground">{LEARNING_STAGES[selectedStage].subtitle}</p>
              </div>
            </div>
            <p className="mt-4 text-sm">{LEARNING_STAGES[selectedStage].description}</p>
          </div>

          {/* Modules Grid */}
          <div className="p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-primary" />
              Module ({LEARNING_STAGES[selectedStage].modules.filter(m => isModuleCompleted(m.id)).length}/{LEARNING_STAGES[selectedStage].modules.length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {LEARNING_STAGES[selectedStage].modules.map((module, mIndex) => {
                const completed = isModuleCompleted(module.id);
                const isNext = !completed && 
                  LEARNING_STAGES[selectedStage].modules
                    .slice(0, mIndex)
                    .every(m => isModuleCompleted(m.id));

                return (
                  <motion.div
                    key={module.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 * mIndex }}
                    className={cn(
                      'p-4 rounded-xl border-2 transition-all',
                      completed && 'bg-primary/5 border-primary/30',
                      isNext && 'border-primary ring-2 ring-primary/20 bg-primary/5',
                      !completed && !isNext && 'border-border opacity-60'
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={cn(
                          'w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-sm font-bold',
                          completed ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                        )}
                      >
                        {completed ? <Check className="w-4 h-4" /> : mIndex + 1}
                      </div>
                      <div>
                        <h4 className="font-medium text-sm">{module.name}</h4>
                        <p className="text-xs text-muted-foreground mt-0.5">{module.description}</p>
                        <p className="text-xs text-muted-foreground mt-1">{module.lessons} Lektionen</p>
                        {isNext && (
                          <span className="inline-block mt-2 text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded font-medium">
                            Nächster Schritt
                          </span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </motion.div>
      )}

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        <div className="bg-card/50 border border-border rounded-xl p-4 text-center">
          <div className="text-3xl font-bold text-primary">
            {USER_PROGRESS.completedModules.length}
          </div>
          <div className="text-sm text-muted-foreground">Module abgeschlossen</div>
        </div>
        <div className="bg-card/50 border border-border rounded-xl p-4 text-center">
          <div className="text-3xl font-bold" style={{ color: LEARNING_STAGES[USER_PROGRESS.currentStage].color }}>
            {USER_PROGRESS.currentStage + 1}
          </div>
          <div className="text-sm text-muted-foreground">Aktuelle Stufe</div>
        </div>
        <div className="bg-card/50 border border-border rounded-xl p-4 text-center">
          <div className="text-3xl font-bold text-green-500">
            {USER_PROGRESS.completedLessons}
          </div>
          <div className="text-sm text-muted-foreground">Lektionen abgeschlossen</div>
        </div>
        <div className="bg-card/50 border border-border rounded-xl p-4 text-center">
          <div className="text-3xl font-bold text-muted-foreground">
            {USER_PROGRESS.totalLessons - USER_PROGRESS.completedLessons}
          </div>
          <div className="text-sm text-muted-foreground">Verbleibende Lektionen</div>
        </div>
      </motion.div>
    </div>
  );
}

export default function ProgressPage() {
  return (
    <DashboardLayout>
      <ProgressContent />
    </DashboardLayout>
  );
}

