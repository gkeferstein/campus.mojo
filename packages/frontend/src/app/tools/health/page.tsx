'use client';

/**
 * Health Analysis Tools Suite
 * Suite für Gesundheitsanalysen und -optimierung
 */

import { motion } from 'framer-motion';
import { Heart, ArrowLeft, Sparkles, Activity, Moon, Brain, Zap } from 'lucide-react';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const HEALTH_TOOLS = [
  {
    id: 'vo2max',
    name: 'VO2Max Rechner',
    description: 'Berechne deine maximale Sauerstoffaufnahme basierend auf deinen Fitnessdaten',
    icon: Activity,
    status: 'available',
    href: '/tools/health/vo2max',
  },
  {
    id: 'sleep',
    name: 'Schlafanalyse',
    description: 'Analysiere deine Schlafqualität und optimiere deine Regeneration',
    icon: Moon,
    status: 'coming-soon',
  },
  {
    id: 'stress',
    name: 'Stress-Level Assessment',
    description: 'Ermittle dein aktuelles Stresslevel und erhalte personalisierte Empfehlungen',
    icon: Brain,
    status: 'coming-soon',
  },
  {
    id: 'energy',
    name: 'Energie-Tracking',
    description: 'Tracke deine Energielevel über den Tag und identifiziere Muster',
    icon: Zap,
    status: 'coming-soon',
  },
];

export default function HealthToolsPage() {
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
            <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center">
              <Heart className="w-6 h-6 text-red-500" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Gesundheitsanalysen</h1>
              <p className="text-muted-foreground mt-1">
                Umfassende Tools zur Analyse und Optimierung deiner Gesundheit
              </p>
            </div>
          </div>
        </motion.div>

        {/* Tools Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {HEALTH_TOOLS.map((tool, index) => {
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
                      <div className="w-14 h-14 rounded-xl bg-red-500/10 flex items-center justify-center">
                        <Icon className="w-7 h-7 text-red-500" />
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
                <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center shrink-0">
                  <Heart className="w-5 h-5 text-red-500" />
                </div>
                <div className="space-y-2">
                  <h3 className="font-semibold">Über Gesundheitsanalysen</h3>
                  <p className="text-sm text-muted-foreground">
                    Diese Tools helfen dir dabei, deine Gesundheit zu verstehen und zu optimieren. 
                    Von der Berechnung deiner VO2Max bis zur Analyse deines Schlafs – nutze 
                    datenbasierte Erkenntnisse für deine Gesundheit.
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

