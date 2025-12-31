'use client';

/**
 * VO2Max Calculator Tool Page
 * Standalone page for the VO2Max Calculator tool
 */

import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { VO2MaxCalculator } from '@/components/tools/vo2max/VO2MaxCalculator';

export default function VO2MaxPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <Link href="/tools/health">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Zurück zu Gesundheitsanalysen
          </Button>
        </Link>
        
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <h1 className="text-3xl font-bold mb-2">VO2Max Rechner</h1>
            <p className="text-muted-foreground">
              Berechne deine maximale Sauerstoffaufnahme basierend auf deinen Fitnessdaten
            </p>
          </div>
          
          <VO2MaxCalculator />
        </div>
      </div>
    </DashboardLayout>
  );
}

