'use client';

/**
 * Certificates Page
 * Shows earned and locked certificates through the MOJO graduation system
 * Gamification element to motivate users
 */

import { motion } from 'framer-motion';
import { 
  Check, 
  Lock, 
  Download, 
  Zap, 
  Users, 
  Briefcase, 
  Cpu, 
  Target,
  Building2,
  Award,
  Trophy,
  Star,
  ExternalLink,
  Share2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

// MOJO Certificates mapped to stages
const MOJO_CERTIFICATES = [
  {
    id: 'cert-lebensenergie',
    stageId: 'lebensenergie',
    name: 'MOJO LEBENSENERGIE',
    subtitle: 'Grundlagen der Regeneration',
    color: '#66dd99',
    textColor: '#000000',
    icon: Zap,
    description: 'Zertifiziert die erfolgreiche Absolvierung des Lebensenergie-Programms und das Verständnis der Regenerationsgrundlagen.',
    requirements: [
      'Alle 6 Module abgeschlossen',
      'Abschlusstest mit min. 80% bestanden',
      'Praxis-Protokoll eingereicht',
    ],
    credentialId: 'MOJO-LE-2024-001',
    issuedDate: '15. März 2024',
    validUntil: 'Lebenslang',
  },
  {
    id: 'cert-campus',
    stageId: 'campus',
    name: 'MOJO CAMPUS',
    subtitle: 'Community & Biohacking',
    color: '#ffffff',
    textColor: '#000000',
    borderColor: '#e5e5e5',
    icon: Users,
    description: 'Bestätigt die aktive Teilnahme an der MOJO Community und fortgeschrittene Kenntnisse im Bereich Biohacking.',
    requirements: [
      'Alle 6 Campus-Module abgeschlossen',
      'Mind. 3 Mastermind-Teilnahmen',
      'Peer-Support Beitrag geleistet',
    ],
    credentialId: null,
    issuedDate: null,
    validUntil: 'Lebenslang',
  },
  {
    id: 'cert-bootcamp',
    stageId: 'bootcamp',
    name: 'MOJO BUSINESS BOOTCAMP',
    subtitle: 'Gesundheits-Unternehmer',
    color: '#0d63bf',
    textColor: '#ffffff',
    icon: Briefcase,
    description: 'Qualifiziert als ausgebildeter Gesundheits-Unternehmer mit fundierten Business-Kenntnissen nach dem MOJO System.',
    requirements: [
      'Alle Business-Module abgeschlossen',
      'Business-Plan erstellt und präsentiert',
      'Erste Kundenakquise dokumentiert',
    ],
    credentialId: null,
    issuedDate: null,
    validUntil: 'Lebenslang',
  },
  {
    id: 'cert-rmos',
    stageId: 'rmos',
    name: 'RegenerationsmedizinOS',
    subtitle: 'Zertifizierter RMOS Experte',
    color: '#873acf',
    textColor: '#ffffff',
    icon: Cpu,
    description: 'Die offizielle RMOS-Zertifizierung. Bestätigt tiefgreifendes Expertenwissen in der Regenerationsmedizin.',
    requirements: [
      'Alle RMOS-Module abgeschlossen',
      'Fallstudien-Prüfung bestanden',
      'Supervisierte Praxisfälle dokumentiert',
      'Mündliche Abschlussprüfung',
    ],
    credentialId: null,
    issuedDate: null,
    validUntil: '2 Jahre (Rezertifizierung möglich)',
  },
  {
    id: 'cert-praxiszirkel',
    stageId: 'praxiszirkel',
    name: 'PRAXISZIRKEL MASTER',
    subtitle: 'Spezialist für Regenerationsmedizin',
    color: '#f5bb00',
    textColor: '#000000',
    icon: Target,
    description: 'Höchste Anerkennung für praktizierende Experten mit nachgewiesener Spezialisierung und Mentoring-Erfahrung.',
    requirements: [
      'Spezialisierung abgeschlossen',
      'Min. 50 dokumentierte Fälle',
      'Eigenes Protokoll entwickelt',
      'Als Mentor aktiv',
    ],
    credentialId: null,
    issuedDate: null,
    validUntil: '2 Jahre (Rezertifizierung möglich)',
  },
  {
    id: 'cert-inkubator',
    stageId: 'inkubator',
    name: 'MOJO INSTITUT PARTNER',
    subtitle: 'Lizenzierter Franchise-Partner',
    color: '#000000',
    textColor: '#ffffff',
    icon: Building2,
    description: 'Die ultimative Auszeichnung. Berechtigt zur Führung eines eigenen MOJO Instituts als offizieller Franchise-Partner.',
    requirements: [
      'Alle vorherigen Zertifizierungen',
      'Business Due Diligence bestanden',
      'Standort genehmigt',
      'Team aufgebaut',
      'Institut eröffnet',
    ],
    credentialId: null,
    issuedDate: null,
    validUntil: 'Laufzeit Franchise-Vertrag',
  },
];

// Mock: which certificates the user has earned
const EARNED_CERTIFICATES = ['cert-lebensenergie'];

function CertificatesContent() {
  const [selectedCert, setSelectedCert] = useState<string | null>(null);

  const isEarned = (certId: string) => EARNED_CERTIFICATES.includes(certId);

  const earnedCount = MOJO_CERTIFICATES.filter(c => isEarned(c.id)).length;
  const totalCount = MOJO_CERTIFICATES.length;
  const progressPercent = (earnedCount / totalCount) * 100;

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
          <Award className="w-4 h-4" />
          MOJO Zertifizierungsprogramm
        </div>
        <h1 className="text-4xl font-bold mb-2">Meine Zertifikate</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Sammle offizielle MOJO Zertifikate auf deinem Weg durch das Graduierungssystem. 
          Jedes Zertifikat ist ein Meilenstein auf deiner Journey.
        </p>
      </motion.div>

      {/* Progress Overview */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="bg-card border border-border rounded-2xl p-6"
      >
        <div className="flex flex-col md:flex-row items-center gap-6">
          {/* Trophy Icon */}
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
              <Trophy className="w-12 h-12 text-primary" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
              {earnedCount}
            </div>
          </div>

          {/* Progress Info */}
          <div className="flex-1 text-center md:text-left">
            <h2 className="text-2xl font-bold mb-1">
              {earnedCount} von {totalCount} Zertifikaten
            </h2>
            <p className="text-muted-foreground mb-4">
              {earnedCount === 0 
                ? 'Starte deine Journey und verdiene dein erstes Zertifikat!'
                : earnedCount === totalCount
                  ? 'Gratulation! Du hast alle Zertifikate erreicht!'
                  : `Noch ${totalCount - earnedCount} Zertifikate bis zur vollständigen Graduierung.`
              }
            </p>
            
            {/* Progress Bar */}
            <div className="max-w-md mx-auto md:mx-0">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-muted-foreground">Gesamtfortschritt</span>
                <span className="font-medium">{progressPercent.toFixed(0)}%</span>
              </div>
              <div className="h-3 bg-secondary rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercent}%` }}
                  transition={{ duration: 1, delay: 0.3 }}
                  className="h-full bg-gradient-to-r from-primary via-accent to-primary rounded-full"
                />
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Certificates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {MOJO_CERTIFICATES.map((cert, index) => {
          const Icon = cert.icon;
          const earned = isEarned(cert.id);
          const isSelected = selectedCert === cert.id;

          return (
            <motion.div
              key={cert.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
              onClick={() => setSelectedCert(isSelected ? null : cert.id)}
              className={cn(
                'relative bg-card border-2 rounded-2xl overflow-hidden cursor-pointer transition-all duration-300',
                earned 
                  ? 'hover:shadow-xl hover:scale-[1.02]' 
                  : 'opacity-60 hover:opacity-80',
                isSelected && 'ring-2 ring-primary ring-offset-2 ring-offset-background'
              )}
              style={{
                borderColor: earned ? cert.color : 'hsl(var(--border))',
              }}
            >
              {/* Earned/Locked Badge */}
              <div className="absolute top-4 right-4 z-10">
                {earned ? (
                  <span className="bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                    <Check className="w-3 h-3" />
                    VERDIENT
                  </span>
                ) : (
                  <span className="bg-muted text-muted-foreground text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                    <Lock className="w-3 h-3" />
                    GESPERRT
                  </span>
                )}
              </div>

              {/* Certificate Visual */}
              <div
                className="p-8 flex flex-col items-center text-center relative"
                style={{
                  backgroundColor: earned ? `${cert.color}15` : 'hsl(var(--muted))',
                }}
              >
                {/* Decorative Border */}
                <div 
                  className="absolute inset-4 border-2 border-dashed rounded-lg opacity-20"
                  style={{ borderColor: earned ? cert.color : 'hsl(var(--muted-foreground))' }}
                />
                
                {/* Icon Badge */}
                <div
                  className={cn(
                    'w-20 h-20 rounded-2xl flex items-center justify-center mb-4 relative z-10',
                    !earned && 'grayscale'
                  )}
                  style={{ 
                    backgroundColor: earned ? cert.color : 'hsl(var(--muted))',
                  }}
                >
                  {earned ? (
                    <Icon className="w-10 h-10" style={{ color: cert.textColor }} />
                  ) : (
                    <Lock className="w-8 h-8 text-muted-foreground" />
                  )}
                </div>

                {/* Stage Number */}
                <span
                  className={cn(
                    'text-xs font-bold tracking-wider px-3 py-1 rounded mb-2',
                    !earned && 'bg-muted text-muted-foreground'
                  )}
                  style={earned ? {
                    backgroundColor: cert.color,
                    color: cert.textColor,
                    border: cert.borderColor ? `1px solid ${cert.borderColor}` : undefined,
                  } : undefined}
                >
                  STUFE {index + 1}
                </span>

                {/* Certificate Name */}
                <h3 className={cn(
                  'font-bold text-xl mb-1',
                  !earned && 'text-muted-foreground'
                )}>
                  {cert.name}
                </h3>
                <p className="text-sm text-muted-foreground">{cert.subtitle}</p>
              </div>

              {/* Certificate Details */}
              <div className="p-4 border-t border-border">
                {earned && cert.credentialId ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Credential ID</span>
                      <span className="font-mono text-xs">{cert.credentialId}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Ausgestellt</span>
                      <span>{cert.issuedDate}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Gültigkeit</span>
                      <span>{cert.validUntil}</span>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-2">
                      <button className="flex-1 py-2 px-3 rounded-lg bg-primary text-primary-foreground text-sm font-medium flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors">
                        <Download className="w-4 h-4" />
                        Download
                      </button>
                      <button className="py-2 px-3 rounded-lg bg-secondary text-secondary-foreground text-sm font-medium flex items-center justify-center gap-2 hover:bg-secondary/80 transition-colors">
                        <Share2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                      {cert.description}
                    </p>
                    <div className="text-xs text-muted-foreground">
                      <span className="font-medium">Anforderungen:</span>
                      <ul className="mt-1 space-y-1">
                        {cert.requirements.slice(0, 2).map((req, rIndex) => (
                          <li key={rIndex} className="flex items-start gap-1">
                            <span className="text-muted-foreground">•</span>
                            {req}
                          </li>
                        ))}
                        {cert.requirements.length > 2 && (
                          <li className="text-muted-foreground">
                            + {cert.requirements.length - 2} weitere
                          </li>
                        )}
                      </ul>
                    </div>
                    
                    <button 
                      className="w-full py-2 px-3 rounded-lg bg-secondary text-secondary-foreground text-sm font-medium flex items-center justify-center gap-2 hover:bg-secondary/80 transition-colors"
                    >
                      Mehr erfahren
                      <ExternalLink className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Achievement Stats */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        <div className="bg-card/50 border border-border rounded-xl p-4 text-center">
          <div className="text-3xl font-bold text-primary">
            {earnedCount}
          </div>
          <div className="text-sm text-muted-foreground">Zertifikate verdient</div>
        </div>
        <div className="bg-card/50 border border-border rounded-xl p-4 text-center">
          <div className="text-3xl font-bold text-amber-500">
            {totalCount - earnedCount}
          </div>
          <div className="text-sm text-muted-foreground">Noch verfügbar</div>
        </div>
        <div className="bg-card/50 border border-border rounded-xl p-4 text-center">
          <div className="text-3xl font-bold text-green-500">
            {earnedCount > 0 ? 'Aktiv' : '-'}
          </div>
          <div className="text-sm text-muted-foreground">Status</div>
        </div>
        <div className="bg-card/50 border border-border rounded-xl p-4 text-center">
          <div className="flex items-center justify-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={cn(
                  'w-5 h-5',
                  star <= earnedCount ? 'text-amber-400 fill-amber-400' : 'text-muted-foreground'
                )}
              />
            ))}
          </div>
          <div className="text-sm text-muted-foreground mt-1">Rang</div>
        </div>
      </motion.div>
    </div>
  );
}

export default function CertificatesPage() {
  return (
    <DashboardLayout>
      <CertificatesContent />
    </DashboardLayout>
  );
}



