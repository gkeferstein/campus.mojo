'use client';

/**
 * Training Planner Tools Suite
 * Suite für Trainingsplanung und Fitness-Optimierung
 */

import { motion } from 'framer-motion';
import { Dumbbell, ArrowLeft, Sparkles, Calendar, TrendingUp, Clock, Target } from 'lucide-react';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const TRAINING_TOOLS = [
  {
    id: 'planner',
    name: 'Trainingsplan Generator',
    description: 'Erstelle personalisierte Trainingspläne basierend auf deinen Zielen und deinem Level',
    icon: Calendar,
    status: 'coming-soon',
    href: null,
  },
  {
    id: 'progress',
    name: 'Progress Tracker',
    description: 'Verfolge deine Trainingsfortschritte über Zeit und visualisiere deine Entwicklung',
    icon: TrendingUp,
    status: 'coming-soon',
    href: null,
  },
  {
    id: 'reps',
    name: 'Wiederholungsrechner',
    description: 'Berechne optimale Wiederholungen und Sätze für deine Trainingsziele',
    icon: Target,
    status: 'coming-soon',
    href: null,
  },
  {
    id: 'recovery',
    name: 'Erholungszeit Optimierer',
    description: 'Bestimme die optimale Erholungszeit zwischen deinen Trainingseinheiten',
    icon: Clock,
    status: 'coming-soon',
    href: null,
  },
];

export default function TrainingToolsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-4"
        >
          <Link href="/tools">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Zurück zu Werkzeugen
            </Button>
          </Link>
          
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
              <Dumbbell className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Trainingsplaner</h1>
              <p className="text-muted-foreground mt-1">
                Professionelle Tools für dein Training und deine Fitness
              </p>
            </div>
          </div>
        </motion.div>

        {/* Tools Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {TRAINING_TOOLS.map((tool, index) => {
            const Icon = tool.icon;
            const isAvailable = tool.status === 'available';
            
            return (
              <motion.div
                key={tool.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
              >
                <Card className={cn(
                  'h-full transition-all duration-300',
                  isAvailable 
                    ? 'hover:shadow-lg cursor-pointer border-primary/20 hover:border-primary/40' 
                    : 'opacity-60 border-muted'
                )}>
                  <CardHeader>
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-14 h-14 rounded-xl bg-blue-500/10 flex items-center justify-center">
                        <Icon className="w-7 h-7 text-blue-500" />
                      </div>
                      {!isAvailable && (
                        <span className="text-xs font-medium bg-muted text-muted-foreground px-2 py-1 rounded">
                          Bald verfügbar
                        </span>
                      )}
                    </div>
                    <CardTitle className="text-xl mb-2">{tool.name}</CardTitle>
                    <CardDescription>{tool.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isAvailable && tool.href ? (
                      <Link href={tool.href}>
                        <Button className="w-full">
                          Tool öffnen
                          <Sparkles className="w-4 h-4 ml-2" />
                        </Button>
                      </Link>
                    ) : (
                      <Button disabled className="w-full">
                        Bald verfügbar
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Info Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
                  <Dumbbell className="w-5 h-5 text-blue-500" />
                </div>
                <div className="space-y-2">
                  <h3 className="font-semibold">Über Trainingsplaner</h3>
                  <p className="text-sm text-muted-foreground">
                    Diese Tools unterstützen dich bei der Planung, Durchführung und Optimierung 
                    deines Trainings. Von der Erstellung personalisierter Trainingspläne bis zur 
                    Verfolgung deines Fortschritts – alles für maximale Trainingserfolge.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}

