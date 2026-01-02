'use client';

/**
 * Course Catalog Page
 * Sales-oriented view of the MOJO graduation system
 * Shows what's available to unlock and what's already unlocked
 */

export const dynamic = 'force-dynamic';

import { motion } from 'framer-motion';
import { 
  Check, 
  Lock, 
  Zap, 
  Users, 
  Briefcase, 
  Cpu, 
  Target,
  Building2,
  ShoppingCart,
  Sparkles,
  BookOpen,
  Clock,
  Star,
  ArrowRight,
  Crown,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

// MOJO Products/Stages
const MOJO_PRODUCTS = [
  {
    id: 'lebensenergie',
    name: 'LEBENSENERGIE',
    subtitle: 'Finde dein MOJO (wieder)',
    color: '#66dd99',
    textColor: '#000000',
    icon: Zap,
    description: 'Der perfekte Einstieg in deine Transformation. Lerne die Grundlagen der Regeneration und finde zurück zu deiner natürlichen Lebensenergie.',
    features: [
      '6 umfassende Module',
      '42+ Videolektionen',
      'Workbooks & Checklisten',
      'Community-Zugang',
      'Live Q&A Sessions',
      'Lebenslanger Zugang',
    ],
    modules: 6,
    lessons: 42,
    duration: '8 Wochen',
    price: 497,
    originalPrice: 997,
    popular: false,
  },
  {
    id: 'campus',
    name: 'CAMPUS',
    subtitle: 'Vernetze dich und optimiere',
    color: '#ffffff',
    textColor: '#000000',
    borderColor: '#e5e5e5',
    icon: Users,
    description: 'Werde Teil der exklusiven MOJO Community. Vertiefe dein Wissen, vernetze dich mit Gleichgesinnten und optimiere deine Regeneration auf dem nächsten Level.',
    features: [
      '6 fortgeschrittene Module',
      '34+ Videolektionen',
      'Mastermind-Gruppen',
      'Exklusive Community',
      'Monatliche Live-Calls',
      'Biohacking-Toolkit',
    ],
    modules: 6,
    lessons: 34,
    duration: '12 Wochen',
    price: 997,
    originalPrice: 1997,
    popular: true,
  },
  {
    id: 'bootcamp',
    name: 'BUSINESS BOOTCAMP',
    subtitle: 'Starte dein Gesundheitsbusiness',
    color: '#0d63bf',
    textColor: '#ffffff',
    icon: Briefcase,
    description: 'Transformiere dein Wissen in ein profitables Business. Das intensive Programm für angehende Gesundheits-Unternehmer.',
    features: [
      '6 Business-Module',
      '42+ Videolektionen',
      'Business-Templates',
      'Marketing-Playbook',
      'Verkaufstraining',
      '1:1 Coaching-Session',
    ],
    modules: 6,
    lessons: 42,
    duration: '10 Wochen',
    price: 2497,
    originalPrice: 4997,
    popular: false,
  },
  {
    id: 'rmos',
    name: 'RegenerationsmedizinOS',
    subtitle: 'Werde zum Experten',
    color: '#873acf',
    textColor: '#ffffff',
    icon: Cpu,
    description: 'Das komplette Betriebssystem der Regenerationsmedizin. Für alle, die tiefgreifendes Expertenwissen aufbauen wollen.',
    features: [
      '6 Experten-Module',
      '66+ Videolektionen',
      'Diagnostik-Protokolle',
      'Interventions-Guides',
      'Fallstudien-Bibliothek',
      'Zertifizierung',
    ],
    modules: 6,
    lessons: 66,
    duration: '16 Wochen',
    price: 4997,
    originalPrice: 9997,
    popular: false,
  },
  {
    id: 'praxiszirkel',
    name: 'Praxiszirkel',
    subtitle: 'Behandle unter Fachleuten',
    color: '#f5bb00',
    textColor: '#000000',
    icon: Target,
    description: 'Der exklusive Zirkel für praktizierende Experten. Lerne krankheitsspezifische Behandlungsstrategien von den Besten.',
    features: [
      '6 Spezialisierungs-Module',
      '45+ Videolektionen',
      'Live-Fallbesprechungen',
      'Supervisions-Sessions',
      'Protokoll-Entwicklung',
      'Mentor-Programm',
    ],
    modules: 6,
    lessons: 45,
    duration: 'Fortlaufend',
    price: 9997,
    originalPrice: 19997,
    popular: false,
    exclusive: true,
  },
  {
    id: 'inkubator',
    name: 'MOJO Inkubator',
    subtitle: 'Eröffne dein Institut',
    color: '#000000',
    textColor: '#ffffff',
    icon: Building2,
    description: 'Der Gipfel der MOJO Journey. Werde Franchisepartner und eröffne dein eigenes MOJO Institut.',
    features: [
      'Komplettes Franchise-System',
      'Standort-Analyse',
      'Team-Aufbau Coaching',
      'Marketing-Paket',
      'Ongoing Support',
      'Exklusives Territorium',
    ],
    modules: 6,
    lessons: 33,
    duration: '6 Monate',
    price: null, // Preis auf Anfrage
    originalPrice: null,
    popular: false,
    exclusive: true,
  },
];

// Mock user owned products
const USER_OWNED = ['lebensenergie'];

function CatalogContent() {
  const [hoveredProduct, setHoveredProduct] = useState<string | null>(null);

  const isOwned = (productId: string) => USER_OWNED.includes(productId);

  const formatPrice = (price: number | null) => {
    if (price === null) return 'Auf Anfrage';
    return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(price);
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
          <Sparkles className="w-4 h-4" />
          MOJO Graduierungssystem
        </div>
        <h1 className="text-4xl font-bold mb-2">Kurskatalog</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Wähle deinen Weg durch das MOJO Graduierungssystem. 
          Von den Grundlagen bis zum eigenen Institut – jede Stufe bringt dich näher an dein Ziel.
        </p>
      </motion.div>

      {/* Owned Badge */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="flex justify-center"
      >
        <div className="bg-primary/10 border border-primary/20 rounded-xl px-6 py-3 inline-flex items-center gap-3">
          <Check className="w-5 h-5 text-primary" />
          <span className="text-sm">
            Du hast bereits <strong>{USER_OWNED.length} von {MOJO_PRODUCTS.length}</strong> Stufen freigeschaltet
          </span>
        </div>
      </motion.div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {MOJO_PRODUCTS.map((product, index) => {
          const Icon = product.icon;
          const owned = isOwned(product.id);
          const isHovered = hoveredProduct === product.id;

          return (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
              onMouseEnter={() => setHoveredProduct(product.id)}
              onMouseLeave={() => setHoveredProduct(null)}
              className={cn(
                'relative bg-card border-2 rounded-2xl overflow-hidden transition-all duration-300',
                owned && 'ring-2 ring-primary ring-offset-2 ring-offset-background',
                isHovered && !owned && 'shadow-xl scale-[1.02]',
                product.popular && 'md:scale-105 md:z-10'
              )}
              style={{
                borderColor: owned ? 'hsl(var(--primary))' : product.borderColor || product.color,
              }}
            >
              {/* Popular Badge */}
              {product.popular && !owned && (
                <div className="absolute top-4 right-4 z-10">
                  <span className="bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full">
                    BELIEBT
                  </span>
                </div>
              )}

              {/* Exclusive Badge */}
              {product.exclusive && (
                <div className="absolute top-4 right-4 z-10">
                  <span className="bg-amber-500 text-black text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                    <Crown className="w-3 h-3" />
                    EXKLUSIV
                  </span>
                </div>
              )}

              {/* Owned Badge */}
              {owned && (
                <div className="absolute top-4 left-4 z-10">
                  <span className="bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                    <Check className="w-3 h-3" />
                    FREIGESCHALTET
                  </span>
                </div>
              )}

              {/* Header */}
              <div
                className="p-6 pb-4"
                style={{
                  backgroundColor: `${product.color}15`,
                }}
              >
                <div className="flex items-start gap-4">
                  <div
                    className="w-14 h-14 rounded-xl flex items-center justify-center shrink-0"
                    style={{ backgroundColor: product.color }}
                  >
                    <Icon className="w-7 h-7" style={{ color: product.textColor }} />
                  </div>
                  <div>
                    <span
                      className="text-xs font-bold tracking-wider px-2 py-0.5 rounded mb-2 inline-block"
                      style={{
                        backgroundColor: product.color,
                        color: product.textColor,
                        border: product.borderColor ? `1px solid ${product.borderColor}` : undefined,
                      }}
                    >
                      STUFE {index + 1}
                    </span>
                    <h3 className="font-bold text-xl">{product.name}</h3>
                    <p className="text-sm text-muted-foreground">{product.subtitle}</p>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 pt-2 space-y-4">
                <p className="text-sm text-muted-foreground">
                  {product.description}
                </p>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-secondary/50 rounded-lg p-2">
                    <BookOpen className="w-4 h-4 mx-auto mb-1 text-muted-foreground" />
                    <div className="text-sm font-bold">{product.modules}</div>
                    <div className="text-xs text-muted-foreground">Module</div>
                  </div>
                  <div className="bg-secondary/50 rounded-lg p-2">
                    <Star className="w-4 h-4 mx-auto mb-1 text-muted-foreground" />
                    <div className="text-sm font-bold">{product.lessons}+</div>
                    <div className="text-xs text-muted-foreground">Lektionen</div>
                  </div>
                  <div className="bg-secondary/50 rounded-lg p-2">
                    <Clock className="w-4 h-4 mx-auto mb-1 text-muted-foreground" />
                    <div className="text-sm font-bold text-xs">{product.duration}</div>
                    <div className="text-xs text-muted-foreground">Dauer</div>
                  </div>
                </div>

                {/* Features */}
                <ul className="space-y-2">
                  {product.features.slice(0, 4).map((feature, fIndex) => (
                    <li key={fIndex} className="flex items-center gap-2 text-sm">
                      <Check className="w-4 h-4 text-primary shrink-0" />
                      {feature}
                    </li>
                  ))}
                  {product.features.length > 4 && (
                    <li className="text-xs text-muted-foreground pl-6">
                      + {product.features.length - 4} weitere Features
                    </li>
                  )}
                </ul>

                {/* Price */}
                <div className="pt-4 border-t border-border">
                  {owned ? (
                    <button
                      className="w-full py-3 px-4 rounded-xl font-semibold flex items-center justify-center gap-2 bg-primary/10 text-primary border border-primary/20"
                    >
                      <Check className="w-5 h-5" />
                      Bereits freigeschaltet
                    </button>
                  ) : (
                    <>
                      <div className="flex items-baseline gap-2 mb-3">
                        <span className="text-3xl font-bold">{formatPrice(product.price)}</span>
                        {product.originalPrice && (
                          <span className="text-sm text-muted-foreground line-through">
                            {formatPrice(product.originalPrice)}
                          </span>
                        )}
                      </div>
                      <button
                        className="w-full py-3 px-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all"
                        style={{
                          backgroundColor: product.color,
                          color: product.textColor,
                        }}
                      >
                        {product.price === null ? (
                          <>
                            Kontakt aufnehmen
                            <ArrowRight className="w-4 h-4" />
                          </>
                        ) : (
                          <>
                            <ShoppingCart className="w-5 h-5" />
                            Zugang freischalten
                          </>
                        )}
                      </button>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Bundle CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-gradient-to-br from-primary/20 via-accent/10 to-primary/5 border border-primary/20 rounded-2xl p-8 text-center"
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
          <Sparkles className="w-4 h-4" />
          SPARE BIS ZU 70%
        </div>
        <h2 className="text-2xl font-bold mb-2">Komplettpaket: Alle 6 Stufen</h2>
        <p className="text-muted-foreground max-w-xl mx-auto mb-6">
          Sichere dir den kompletten Zugang zu allen Stufen des MOJO Graduierungssystems 
          und spare dabei über 70% gegenüber der Einzelfreischaltung.
        </p>
        <div className="flex items-center justify-center gap-4 mb-6">
          <span className="text-4xl font-bold">€14.997</span>
          <span className="text-xl text-muted-foreground line-through">€47.982</span>
        </div>
        <button className="bg-primary text-primary-foreground px-8 py-4 rounded-xl font-semibold text-lg flex items-center gap-2 mx-auto hover:bg-primary/90 transition-colors">
          <ShoppingCart className="w-5 h-5" />
          Komplettpaket freischalten
        </button>
      </motion.div>
    </div>
  );
}

export default function CatalogPage() {
  return (
    <DashboardLayout>
      <CatalogContent />
    </DashboardLayout>
  );
}



