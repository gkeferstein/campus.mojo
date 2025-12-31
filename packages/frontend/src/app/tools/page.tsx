'use client';

/**
 * Tools Overview Page
 * Übersichtsseite für alle verfügbaren Tool-Suites
 */

import { motion } from 'framer-motion';
import { Heart, Dumbbell, Wallet, ArrowRight, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

const TOOL_SUITES = [
  {
    id: 'health',
    name: 'Gesundheitsanalysen',
    description: 'Umfassende Tools zur Analyse und Optimierung deiner Gesundheit',
    icon: Heart,
    href: '/tools/health',
    color: 'from-red-500/20 to-pink-500/20',
    iconColor: 'text-red-500',
    bgColor: 'bg-red-500/10',
    tools: [
      'VO2Max Rechner',
      'Schlafanalyse',
      'Stress-Level Assessment',
      'Energie-Tracking',
    ],
  },
  {
    id: 'training',
    name: 'Trainingsplaner',
    description: 'Professionelle Tools für dein Training und deine Fitness',
    icon: Dumbbell,
    href: '/tools/training',
    color: 'from-blue-500/20 to-cyan-500/20',
    iconColor: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
    tools: [
      'Trainingsplan Generator',
      'Progress Tracker',
      'Wiederholungsrechner',
      'Erholungszeit Optimierer',
    ],
  },
  {
    id: 'finance',
    name: 'Finanzen',
    description: 'Tools für deine finanzielle Planung und Optimierung',
    icon: Wallet,
    href: '/tools/finance',
    color: 'from-green-500/20 to-emerald-500/20',
    iconColor: 'text-green-500',
    bgColor: 'bg-green-500/10',
    tools: [
      'Budget Planer',
      'Sparziel Rechner',
      'Investitionsanalyse',
      'Steueroptimierung',
    ],
  },
];

export default function ToolsPage() {
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
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Werkzeuge</h1>
              <p className="text-muted-foreground mt-1">
                Professionelle Tools für Gesundheit, Training und Finanzen
              </p>
            </div>
          </div>
        </motion.div>

        {/* Tool Suites Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {TOOL_SUITES.map((suite, index) => {
            const Icon = suite.icon;
            return (
              <motion.div
                key={suite.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
              >
                <Link href={suite.href}>
                  <Card className="h-full hover:shadow-lg transition-all duration-300 cursor-pointer group border-primary/20 hover:border-primary/40">
                    <CardHeader>
                      <div className="flex items-start justify-between mb-4">
                        <div className={cn('w-14 h-14 rounded-xl flex items-center justify-center', suite.bgColor)}>
                          <Icon className={cn('w-7 h-7', suite.iconColor)} />
                        </div>
                        <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                      </div>
                      <CardTitle className="text-xl mb-2">{suite.name}</CardTitle>
                      <CardDescription>{suite.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-muted-foreground mb-3">
                          Verfügbare Tools:
                        </p>
                        <ul className="space-y-1.5">
                          {suite.tools.map((tool, toolIndex) => (
                            <li key={toolIndex} className="flex items-center gap-2 text-sm">
                              <div className="w-1.5 h-1.5 rounded-full bg-primary/40" />
                              <span className="text-muted-foreground">{tool}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
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
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Sparkles className="w-5 h-5 text-primary" />
                </div>
                <div className="space-y-2">
                  <h3 className="font-semibold">Über die Werkzeuge</h3>
                  <p className="text-sm text-muted-foreground">
                    Diese Tools wurden entwickelt, um dir bei der Optimierung deiner Gesundheit, 
                    deines Trainings und deiner Finanzen zu helfen. Alle Tools speichern deine 
                    Eingaben automatisch und sind beim nächsten Besuch wieder verfügbar.
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

