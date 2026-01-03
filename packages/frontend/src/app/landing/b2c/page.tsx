"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Zap,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Play,
  Heart,
  Brain,
  Sun,
  Moon,
  Clock,
  TrendingUp,
  Users,
  Shield,
  Star,
  Quote,
} from "lucide-react";

// Features für LEBENSENERGIE Stufe
const FEATURES = [
  {
    icon: Zap,
    title: "Täglicher LEBENSENERGIE Check-in",
    description: "3 Minuten täglich für mehr Bewusstsein über deine Energie",
  },
  {
    icon: Brain,
    title: "Personalisierte Module",
    description: "Inhalte basierend auf deinem Check-in",
  },
  {
    icon: TrendingUp,
    title: "Transformation Tracker",
    description: "Verfolge deine Entwicklung über Wochen und Monate",
  },
  {
    icon: Users,
    title: "Unterstützende Community",
    description: "Verbinde dich mit Gleichgesinnten auf dem gleichen Weg",
  },
  {
    icon: Sun,
    title: "Tägliche Inspiration",
    description: "Morgens und abends kleine Impulse für mehr Energie",
  },
  {
    icon: Shield,
    title: "Wissenschaftlich fundiert",
    description: "Methoden aus der Regenerationsmedizin",
  },
];

// Testimonials
const TESTIMONIALS = [
  {
    name: "Maria S.",
    condition: "Chronische Erschöpfung",
    text: "Nach 3 Monaten LEBENSENERGIE habe ich wieder Hoffnung. Mein Energielevel ist von 3 auf 7 gestiegen.",
    avatar: "MS",
    improvement: "+133%",
  },
  {
    name: "Thomas K.",
    condition: "Burnout-Folgen",
    text: "Die täglichen Check-ins haben mir geholfen, meine Muster zu erkennen. Endlich verstehe ich, was mir Energie gibt.",
    avatar: "TK",
    improvement: "+85%",
  },
  {
    name: "Sabine M.",
    condition: "Fibromyalgie",
    text: "Ich dachte, es wird nie besser. Aber Schritt für Schritt kommt die Kraft zurück. Das hätte ich nie erwartet.",
    avatar: "SM",
    improvement: "+67%",
  },
];

// FAQ Items
const FAQ = [
  {
    question: "Was genau ist LEBENSENERGIE?",
    answer:
      "LEBENSENERGIE ist unser ganzheitliches Programm für Menschen mit chronischen Erkrankungen. Es hilft dir, deine natürlichen Energiequellen zu aktivieren und Schritt für Schritt mehr Lebensqualität zu gewinnen.",
  },
  {
    question: "Wie viel Zeit brauche ich täglich?",
    answer:
      "Der tägliche Check-in dauert nur 3 Minuten. Die Module sind 10-15 Minuten lang. Du entscheidest selbst, wie viel Zeit du investieren möchtest.",
  },
  {
    question: "Ist das ein Ersatz für medizinische Behandlung?",
    answer:
      "Nein, LEBENSENERGIE ersetzt keine ärztliche Behandlung. Es ist eine Ergänzung, die dir hilft, aktiv zu deiner Gesundheit beizutragen – parallel zu deiner medizinischen Betreuung.",
  },
  {
    question: "Was passiert nach der kostenlosen Phase?",
    answer:
      "Nach deinen ersten Check-ins kannst du 7 Tage kostenlos testen. Danach kannst du dich für €29/Monat für das volle Programm entscheiden. Du kannst jederzeit kündigen.",
  },
];

// Navigation
function Navigation() {
  return (
    <nav className="sticky top-0 z-50 border-b border-slate-200 backdrop-blur-xl bg-white/80">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/landing/b2c" className="text-xl font-bold text-[#66dd99]">
          campus.mojo
        </Link>
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="px-4 py-2 text-sm text-slate-600 hover:text-slate-900 transition-colors"
          >
            Anmelden
          </Link>
          <Link
            href="/register"
            className="px-4 py-2 text-sm font-medium bg-[#66dd99] hover:bg-[#44cc88] text-black rounded-lg transition-all shadow-sm"
          >
            Kostenlos starten
          </Link>
        </div>
      </div>
    </nav>
  );
}

// Hero Section - B2C Focus
function HeroSection() {
  return (
    <section className="relative py-20 md:py-28 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-white via-slate-50 to-emerald-50/30" />
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-[#66dd99]/20 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-blue-100/30 rounded-full blur-3xl" />

      <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-slate-200 bg-white/80 text-sm mb-8 shadow-sm"
        >
          <Heart className="w-4 h-4 text-red-400" />
          <span className="text-slate-600">Für Menschen mit chronischen Erkrankungen</span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6"
        >
          <span className="text-slate-900">Was kannst du selbst</span>
          <br />
          <span className="bg-gradient-to-r from-[#66dd99] to-[#44cc88] bg-clip-text text-transparent">
            NOCH tun?
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto mb-10"
        >
          Entdecke deine <strong className="text-slate-900">LEBENSENERGIE</strong> in nur 3 Minuten.
          Ein täglicher Check-in, der dir zeigt, was dir Kraft gibt – und was sie nimmt.
        </motion.p>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4 justify-center mb-8"
        >
          <Link href="/onboarding/checkin">
            <button className="group px-8 py-4 bg-[#66dd99] hover:bg-[#44cc88] text-black font-semibold rounded-xl text-lg transition-all shadow-lg shadow-[#66dd99]/25 flex items-center justify-center gap-2">
              Kostenlos starten – 30 Sekunden
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </Link>
        </motion.div>

        {/* Trust Badges */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex flex-wrap justify-center gap-6 text-sm text-slate-500"
        >
          {["Keine Kreditkarte nötig", "Sofortiger Zugang", "100% kostenlos starten"].map(
            (badge) => (
              <div key={badge} className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#66dd99]" />
                <span>{badge}</span>
              </div>
            )
          )}
        </motion.div>
      </div>
    </section>
  );
}

// Stats Section
function StatsSection() {
  return (
    <section className="py-12 border-y border-slate-100 bg-white">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { value: "10.000+", label: "Menschen auf ihrer Journey" },
            { value: "3 Min", label: "Täglicher Check-in" },
            { value: "+72%", label: "Durchschnittliche Verbesserung" },
            { value: "4.8★", label: "Nutzerbewertung" },
          ].map((stat) => (
            <div key={stat.label}>
              <div className="text-2xl md:text-3xl font-bold text-[#66dd99]">{stat.value}</div>
              <div className="text-sm text-slate-500 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// How It Works
function HowItWorksSection() {
  const steps = [
    {
      step: 1,
      title: "Check-in (3 Min)",
      description: "Beantworte 5 einfache Fragen zu deiner Energie, Schlaf und Stimmung",
      icon: Clock,
    },
    {
      step: 2,
      title: "Dein Ergebnis",
      description: "Erhalte sofort dein LEBENSENERGIE-Level und eine personalisierte Empfehlung",
      icon: Zap,
    },
    {
      step: 3,
      title: "Erste Schritte",
      description: "Starte mit einem 10-Minuten-Modul, das genau zu dir passt",
      icon: Play,
    },
    {
      step: 4,
      title: "Transformation",
      description: "Verfolge deinen Fortschritt und erlebe echte Veränderung",
      icon: TrendingUp,
    },
  ];

  return (
    <section className="py-20">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            So <span className="text-[#66dd99]">einfach</span> funktioniert es
          </h2>
          <p className="text-slate-600 max-w-xl mx-auto">
            Kein kompliziertes Setup. Kein Fachwissen nötig. Starte in unter einer Minute.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-4 gap-6">
          {steps.map((step, index) => (
            <motion.div
              key={step.step}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="relative"
            >
              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-8 left-1/2 w-full h-0.5 bg-slate-200" />
              )}
              
              <div className="relative bg-white rounded-2xl border border-slate-200 p-6 text-center">
                {/* Step Number */}
                <div className="w-12 h-12 rounded-full bg-[#66dd99] text-black font-bold text-lg flex items-center justify-center mx-auto mb-4 relative z-10">
                  {step.step}
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">{step.title}</h3>
                <p className="text-sm text-slate-500">{step.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Features Section
function FeaturesSection() {
  return (
    <section className="py-20 bg-slate-50/50">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            Was du <span className="text-[#66dd99]">bekommst</span>
          </h2>
          <p className="text-slate-600 max-w-xl mx-auto">
            Alles, was du brauchst, um deine LEBENSENERGIE zu steigern.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-2xl border border-slate-200 p-6"
            >
              <div className="w-12 h-12 rounded-xl bg-[#66dd99]/10 flex items-center justify-center mb-4">
                <feature.icon className="w-6 h-6 text-[#66dd99]" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">{feature.title}</h3>
              <p className="text-sm text-slate-500">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Testimonials Section
function TestimonialsSection() {
  return (
    <section className="py-20">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            Echte <span className="text-[#66dd99]">Transformationen</span>
          </h2>
          <p className="text-slate-600 max-w-xl mx-auto">
            Menschen wie du haben es bereits geschafft.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((testimonial, index) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-2xl border border-slate-200 p-6"
            >
              {/* Improvement Badge */}
              <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-sm font-medium mb-4">
                <TrendingUp className="w-4 h-4" />
                {testimonial.improvement} mehr Energie
              </div>

              {/* Stars */}
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-[#f5bb00] text-[#f5bb00]" />
                ))}
              </div>

              {/* Quote */}
              <Quote className="w-8 h-8 text-[#66dd99]/30 mb-3" />
              <p className="text-slate-600 mb-6 leading-relaxed">{testimonial.text}</p>

              {/* Author */}
              <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#66dd99] to-[#44cc88] flex items-center justify-center text-white font-semibold text-sm">
                  {testimonial.avatar}
                </div>
                <div>
                  <p className="font-medium text-slate-900 text-sm">{testimonial.name}</p>
                  <p className="text-xs text-slate-500">{testimonial.condition}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Pricing Section
function PricingSection() {
  return (
    <section className="py-20 bg-slate-50/50">
      <div className="max-w-4xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            Starte <span className="text-[#66dd99]">kostenlos</span>
          </h2>
          <p className="text-slate-600">Wert zuerst. Entscheidung später.</p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Free Tier */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white rounded-2xl border border-slate-200 p-8"
          >
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Kostenloser Start</h3>
            <div className="text-4xl font-bold text-slate-900 mb-4">
              €0<span className="text-lg font-normal text-slate-500">/für immer</span>
            </div>
            <ul className="space-y-3 mb-8">
              {[
                "3-Minuten LEBENSENERGIE Check-in",
                "LEBENSENERGIE-Level anzeigen",
                "1 Mini-Kurs (10 Min)",
                "Community-Vorschau",
                "7-Tage Tracking",
              ].map((feature) => (
                <li key={feature} className="flex items-center gap-2 text-sm text-slate-600">
                  <CheckCircle2 className="w-4 h-4 text-[#66dd99]" />
                  {feature}
                </li>
              ))}
            </ul>
            <Link href="/onboarding/checkin">
              <button className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl transition-all">
                Jetzt starten
              </button>
            </Link>
          </motion.div>

          {/* LEBENSENERGIE Tier */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-[#66dd99]/5 to-emerald-50/50 rounded-2xl border-2 border-[#66dd99] p-8 relative"
          >
            <div className="absolute -top-3 right-6 px-3 py-1 bg-[#66dd99] text-black text-xs font-bold rounded-full">
              BELIEBTESTE WAHL
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">LEBENSENERGIE</h3>
            <div className="text-4xl font-bold text-slate-900 mb-1">
              €29<span className="text-lg font-normal text-slate-500">/Monat</span>
            </div>
            <p className="text-sm text-slate-500 mb-4">oder €290/Jahr (2 Monate geschenkt)</p>
            <ul className="space-y-3 mb-8">
              {[
                "Alles aus Kostenlos +",
                "Vollständiges LEBENSENERGIE Dashboard",
                "30+ Module & Toolbox",
                "Personalisiertes 4-Wochen-Programm",
                "Community vollständig",
                "Gamification & Challenges",
                "Transformation Tracker",
              ].map((feature) => (
                <li key={feature} className="flex items-center gap-2 text-sm text-slate-600">
                  <CheckCircle2 className="w-4 h-4 text-[#66dd99]" />
                  {feature}
                </li>
              ))}
            </ul>
            <Link href="/onboarding/checkin">
              <button className="w-full py-3 bg-[#66dd99] hover:bg-[#44cc88] text-black font-semibold rounded-xl transition-all">
                7 Tage kostenlos testen
              </button>
            </Link>
            <p className="text-center text-xs text-slate-500 mt-3">
              Keine Kreditkarte nötig. Jederzeit kündbar.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// FAQ Section
function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="py-20">
      <div className="max-w-3xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            Häufige <span className="text-[#66dd99]">Fragen</span>
          </h2>
        </motion.div>

        <div className="space-y-4">
          {FAQ.map((item, index) => (
            <motion.div
              key={item.question}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="border border-slate-200 rounded-xl overflow-hidden bg-white"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full px-6 py-4 text-left flex items-center justify-between"
              >
                <span className="font-medium text-slate-900">{item.question}</span>
                <span className={`text-[#66dd99] transition-transform ${openIndex === index ? 'rotate-45' : ''}`}>
                  +
                </span>
              </button>
              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <p className="px-6 pb-4 text-slate-600 text-sm">{item.answer}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Final CTA
function FinalCTASection() {
  return (
    <section className="py-20 bg-gradient-to-br from-[#66dd99]/10 to-emerald-50/50">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            Deine <span className="text-[#66dd99]">LEBENSENERGIE</span> wartet
          </h2>
          <p className="text-slate-600 mb-8 max-w-xl mx-auto">
            Finde in 3 Minuten heraus, wo du stehst. Kostenlos und unverbindlich.
          </p>
          <Link href="/onboarding/checkin">
            <button className="group px-8 py-4 bg-[#66dd99] hover:bg-[#44cc88] text-black font-semibold rounded-xl text-lg transition-all shadow-lg shadow-[#66dd99]/25 inline-flex items-center gap-2">
              Jetzt Check-in starten
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </Link>
          <p className="text-sm text-slate-500 mt-4">
            Über 10.000 Menschen haben ihre LEBENSENERGIE bereits entdeckt
          </p>
        </motion.div>
      </div>
    </section>
  );
}

// Footer
function Footer() {
  return (
    <footer className="border-t border-slate-200 py-12 bg-white">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="text-xl font-bold text-[#66dd99] mb-4">campus.mojo</div>
            <p className="text-sm text-slate-500">
              System für chronische Gesundheit. Entdecke deine LEBENSENERGIE.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-slate-900 mb-4">Produkt</h4>
            <ul className="space-y-2 text-sm text-slate-500">
              <li>
                <Link href="/onboarding/checkin" className="hover:text-slate-900 transition-colors">
                  Check-in
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-slate-900 transition-colors">
                  Module
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-slate-900 transition-colors">
                  Community
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-slate-900 mb-4">Rechtliches</h4>
            <ul className="space-y-2 text-sm text-slate-500">
              <li>
                <a href="#" className="hover:text-slate-900 transition-colors">
                  Datenschutz
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-slate-900 transition-colors">
                  AGB
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-slate-900 transition-colors">
                  Impressum
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-slate-900 mb-4">Support</h4>
            <ul className="space-y-2 text-sm text-slate-500">
              <li>
                <a href="#" className="hover:text-slate-900 transition-colors">
                  Kontakt
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-slate-900 transition-colors">
                  FAQ
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="text-center pt-8 border-t border-slate-200 text-sm text-slate-400">
          © {new Date().getFullYear()} MOJO Institut. Alle Rechte vorbehalten.
        </div>
      </div>
    </footer>
  );
}

// Main Page
export default function B2CLandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      <HeroSection />
      <StatsSection />
      <HowItWorksSection />
      <FeaturesSection />
      <TestimonialsSection />
      <PricingSection />
      <FAQSection />
      <FinalCTASection />
      <Footer />
    </div>
  );
}

