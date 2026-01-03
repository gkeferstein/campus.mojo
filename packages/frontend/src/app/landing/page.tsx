"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Zap,
  Users,
  Briefcase,
  Cpu,
  Target,
  Building2,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Star,
  Play,
  Quote,
} from "lucide-react";

// MOJO Gurtsystem - Die 6 Stufen
const BELT_SYSTEM = [
  {
    level: 1,
    name: "LEBENSENERGIE",
    claim: "Kultiviere einen Alltag, von dem du dich nie wieder erholen willst",
    color: "#66dd99",
    textColor: "#000000",
    icon: Zap,
    description: "Der Anfang deiner Transformation. Entdecke deine natürliche Lebenskraft.",
  },
  {
    level: 2,
    name: "CAMPUS",
    claim: "Werde Teil einer Bewegung, nicht nur einer Community",
    color: "#f8fafc",
    textColor: "#000000",
    borderColor: "#e2e8f0",
    icon: Users,
    description: "Vernetze dich mit Gleichgesinnten und vertiefe dein Wissen.",
  },
  {
    level: 3,
    name: "BUSINESS BOOTCAMP",
    claim: "Dein Wissen ist wertlos, wenn es niemanden erreicht",
    color: "#0d63bf",
    textColor: "#ffffff",
    icon: Briefcase,
    description: "Transformiere deine Expertise in ein profitables Gesundheitsbusiness.",
  },
  {
    level: 4,
    name: "RegenerationsmedizinOS",
    claim: "Beherrsche das Betriebssystem der menschlichen Regeneration",
    color: "#873acf",
    textColor: "#ffffff",
    icon: Cpu,
    description: "Werde Experte für das komplette System der Regenerationsmedizin.",
  },
  {
    level: 5,
    name: "PRAXISZIRKEL",
    claim: "Unter Meistern wird der Meister geformt",
    color: "#f5bb00",
    textColor: "#000000",
    icon: Target,
    description: "Der exklusive Zirkel für praktizierende Experten.",
  },
  {
    level: 6,
    name: "MOJO INKUBATOR",
    claim: "Baue nicht nur ein Business – baue ein Vermächtnis",
    color: "#18181b",
    textColor: "#ffffff",
    icon: Building2,
    description: "Eröffne dein eigenes MOJO Institut.",
  },
];

const TESTIMONIALS = [
  {
    name: "Dr. Sarah M.",
    role: "Ärztin & MOJO Partnerin",
    text: "Ich war kurz vor dem Burnout. Heute führe ich mein eigenes Institut und helfe anderen, den gleichen Weg zu gehen.",
    avatar: "SM",
  },
  {
    name: "Marcus K.",
    role: "Physiotherapeut",
    text: "Das Gurtsystem hat mir Struktur gegeben. Jeder Schritt war klar, jedes Level ein Meilenstein.",
    avatar: "MK",
  },
  {
    name: "Julia R.",
    role: "Heilpraktikerin",
    text: "Endlich ein System, das nicht nur Wissen vermittelt, sondern mich wirklich transformiert hat.",
    avatar: "JR",
  },
];

// Navigation
function Navigation() {
  return (
    <nav className="sticky top-0 z-50 border-b border-slate-200 backdrop-blur-xl bg-white/80">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="text-xl font-bold text-[#66dd99]">campus.mojo</div>
        <div className="flex items-center gap-3">
          <Link href="/login" className="px-4 py-2 text-sm text-slate-600 hover:text-slate-900 transition-colors">
            Anmelden
          </Link>
          <Link href="/register" className="px-4 py-2 text-sm font-medium bg-[#66dd99] hover:bg-[#44cc88] text-black rounded-lg transition-all shadow-sm">
            Kostenfrei starten
          </Link>
        </div>
      </div>
    </nav>
  );
}

// Hero Section
function HeroSection() {
  const [currentIdentity, setCurrentIdentity] = useState(0);
  const identities = ["Gesundheitsprofi", "Unternehmer", "Visionär", "Weltveränderer"];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIdentity((prev) => (prev + 1) % identities.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative py-24 md:py-32 overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-white via-slate-50 to-emerald-50/30" />
      
      {/* Gradient Orbs */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-[#66dd99]/20 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-[#873acf]/10 rounded-full blur-3xl" />

      <div className="max-w-6xl mx-auto px-6 text-center relative z-10">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-slate-200 bg-white/80 text-sm mb-8 shadow-sm"
        >
          <Sparkles className="w-4 h-4 text-[#66dd99]" />
          <span className="text-slate-600">System für chronische Gesundheit</span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6"
        >
          <span className="text-slate-900">Du bist </span>
          <AnimatePresence mode="wait">
            <motion.span
              key={currentIdentity}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-gradient-to-r from-[#66dd99] to-[#44cc88] bg-clip-text text-transparent"
            >
              {identities[currentIdentity]}
            </motion.span>
          </AnimatePresence>
          <span className="text-slate-900">,</span>
          <br />
          <span className="bg-gradient-to-r from-[#66dd99] to-[#44cc88] bg-clip-text text-transparent">
            kein Angestellter.
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto mb-10"
        >
          Das MOJO-Ökosystem transformiert dich in{" "}
          <strong className="text-slate-900">6 Stufen</strong> vom erschöpften Angestellten
          zum freien, wirksamen Gesundheitsunternehmer.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4 justify-center mb-10"
        >
          <Link href="/register">
            <button className="group px-8 py-4 bg-[#66dd99] hover:bg-[#44cc88] text-black font-semibold rounded-xl text-lg transition-all shadow-lg shadow-[#66dd99]/25 flex items-center justify-center gap-2">
              Transformation starten
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </Link>
          <button className="px-8 py-4 bg-white hover:bg-slate-50 text-slate-700 font-medium rounded-xl text-lg border border-slate-200 transition-all flex items-center justify-center gap-2 shadow-sm">
            <Play className="w-5 h-5 text-[#66dd99]" />
            Was ist MOJO?
          </button>
        </motion.div>

        {/* Trust Badges */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex flex-wrap justify-center gap-6 text-sm text-slate-500"
        >
          {["Keine Kreditkarte nötig", "Sofortiger Zugang", "Jederzeit kündbar"].map((badge) => (
            <div key={badge} className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#66dd99]" />
              <span>{badge}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// Problem Section
function ProblemSection() {
  const problems = [
    "Du arbeitest 60+ Stunden, bist aber nicht frei",
    "Du hilfst anderen, aber vernachlässigst dich selbst",
    "Du weißt, dass mehr möglich ist – aber nicht wie",
    "Du hast Wissen, aber keine Struktur es zu monetarisieren",
  ];

  return (
    <section className="py-16">
      <div className="max-w-4xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="rounded-2xl border border-red-200 bg-red-50/50 p-8 md:p-10"
        >
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900 text-center mb-2">
            Kennst du das?
          </h2>
          <p className="text-slate-600 text-center mb-8">
            Viele Gesundheitsprofis kämpfen mit diesen Problemen:
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            {problems.map((problem) => (
              <div
                key={problem}
                className="flex items-start gap-3 p-4 rounded-lg bg-white/80 border border-red-100"
              >
                <span className="text-red-400 mt-0.5">☐</span>
                <span className="text-slate-700">{problem}</span>
              </div>
            ))}
          </div>
          <p className="text-center text-slate-900 font-semibold mt-8">
            Das muss nicht so bleiben. Mit MOJO findest du deinen Weg raus.
          </p>
        </motion.div>
      </div>
    </section>
  );
}

// Belt System Section
function BeltSystemSection() {
  return (
    <section id="gurtsystem" className="py-20 bg-slate-50/50">
      <div className="max-w-6xl mx-auto px-6">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-[#66dd99] to-[#44cc88] bg-clip-text text-transparent">
              6 Stufen
            </span>{" "}
            <span className="text-slate-900">zur Meisterschaft</span>
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Progressive Freischaltung über 1-3 Jahre. Jede Stufe bringt dich näher an dein Ziel.
          </p>
        </motion.div>

        {/* Belt Cards Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {BELT_SYSTEM.map((belt, index) => {
            const Icon = belt.icon;
            return (
              <motion.div
                key={belt.level}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group rounded-2xl border border-slate-200 bg-white p-6 hover:border-[#66dd99]/50 hover:shadow-lg hover:shadow-[#66dd99]/10 transition-all duration-300"
              >
                {/* Header */}
                <div className="flex items-start gap-4 mb-4">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                    style={{
                      backgroundColor: belt.color,
                      border: belt.borderColor ? `1px solid ${belt.borderColor}` : undefined,
                    }}
                  >
                    <Icon className="w-6 h-6" style={{ color: belt.textColor }} />
                  </div>
                  <div>
                    <span
                      className="text-xs font-bold tracking-wider px-2 py-0.5 rounded inline-block mb-1"
                      style={{
                        backgroundColor: belt.color,
                        color: belt.textColor,
                        border: belt.borderColor ? `1px solid ${belt.borderColor}` : undefined,
                      }}
                    >
                      STUFE {belt.level}
                    </span>
                    <h3 className="font-bold text-slate-900">{belt.name}</h3>
                  </div>
                </div>

                {/* Claim */}
                <p className="text-[#44aa77] font-medium text-sm mb-3 italic">
                  &ldquo;{belt.claim}&rdquo;
                </p>

                {/* Description */}
                <p className="text-sm text-slate-500">{belt.description}</p>
              </motion.div>
            );
          })}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <Link href="/catalog">
            <button className="px-8 py-4 bg-white hover:bg-slate-50 text-slate-700 font-medium rounded-xl border border-slate-200 transition-all inline-flex items-center gap-2 shadow-sm">
              Alle Stufen im Detail
              <ArrowRight className="w-5 h-5" />
            </button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

// Value Props Section
function ValuePropsSection() {
  const values = [
    { icon: Zap, title: "Transformation", desc: "Nicht nur Wissen – echte Veränderung" },
    { icon: Users, title: "Community", desc: "Gleichgesinnte auf dem gleichen Weg" },
    { icon: Target, title: "Struktur", desc: "6 klare Stufen zum Erfolg" },
    { icon: Building2, title: "Business", desc: "Von der Idee zum eigenen Institut" },
  ];

  return (
    <section className="py-20">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            Warum <span className="bg-gradient-to-r from-[#66dd99] to-[#44cc88] bg-clip-text text-transparent">campus.mojo</span>?
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {values.map((value, index) => (
            <motion.div
              key={value.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="text-center p-6 rounded-2xl border border-slate-200 bg-white"
            >
              <div className="w-16 h-16 rounded-full bg-[#66dd99]/10 flex items-center justify-center mx-auto mb-4">
                <value.icon className="w-8 h-8 text-[#66dd99]" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">{value.title}</h3>
              <p className="text-sm text-slate-500">{value.desc}</p>
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
    <section className="py-20 bg-slate-50/50">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            Das sagen unsere <span className="bg-gradient-to-r from-[#66dd99] to-[#44cc88] bg-clip-text text-transparent">Absolventen</span>
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((testimonial, index) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="p-6 rounded-2xl border border-slate-200 bg-white"
            >
              {/* Stars */}
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-[#f5bb00] text-[#f5bb00]" />
                ))}
              </div>

              {/* Quote Icon */}
              <Quote className="w-8 h-8 text-[#66dd99]/30 mb-3" />

              {/* Text */}
              <p className="text-slate-600 mb-6 leading-relaxed">
                {testimonial.text}
              </p>

              {/* Author */}
              <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#66dd99] to-[#44cc88] flex items-center justify-center text-white font-semibold text-sm">
                  {testimonial.avatar}
                </div>
                <div>
                  <p className="font-medium text-slate-900 text-sm">{testimonial.name}</p>
                  <p className="text-xs text-slate-500">{testimonial.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Final CTA Section
function CTASection() {
  return (
    <section className="py-20">
      <div className="max-w-4xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="rounded-2xl border border-[#66dd99]/30 bg-gradient-to-br from-[#66dd99]/5 to-emerald-50/50 p-8 md:p-12 text-center"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            Bereit für deine{" "}
            <span className="bg-gradient-to-r from-[#66dd99] to-[#44cc88] bg-clip-text text-transparent">
              Transformation
            </span>
            ?
          </h2>
          <p className="text-slate-600 mb-8 max-w-xl mx-auto">
            Starte heute mit Stufe 1 und entdecke deine LEBENSENERGIE.
            Tausende Gesundheitsprofis haben es bereits geschafft.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Link href="/register">
              <button className="group px-8 py-4 bg-[#66dd99] hover:bg-[#44cc88] text-black font-semibold rounded-xl text-lg transition-all shadow-lg shadow-[#66dd99]/25 flex items-center justify-center gap-2">
                Jetzt kostenlos starten
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </Link>
            <Link href="/login">
              <button className="px-8 py-4 bg-white hover:bg-slate-50 text-slate-700 font-medium rounded-xl border border-slate-200 transition-all shadow-sm">
                Bereits Mitglied? Anmelden
              </button>
            </Link>
          </div>

          <div className="flex flex-wrap justify-center gap-6 text-sm text-slate-500">
            {["Keine Kreditkarte nötig", "In 3 Minuten startklar", "Jederzeit kündbar"].map((badge) => (
              <div key={badge} className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#66dd99]" />
                <span>{badge}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// Footer
function Footer() {
  return (
    <footer className="border-t border-slate-200 py-12 bg-slate-50/50">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="text-xl font-bold text-[#66dd99] mb-4">campus.mojo</div>
            <p className="text-sm text-slate-500">
              System für chronische Gesundheit. Transformiere dein Leben.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-slate-900 mb-4">Produkt</h4>
            <ul className="space-y-2 text-sm text-slate-500">
              <li><Link href="/catalog" className="hover:text-slate-900 transition-colors">Kurskatalog</Link></li>
              <li><Link href="#gurtsystem" className="hover:text-slate-900 transition-colors">Gurtsystem</Link></li>
              <li><Link href="/register" className="hover:text-slate-900 transition-colors">Kostenlos starten</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-slate-900 mb-4">Rechtliches</h4>
            <ul className="space-y-2 text-sm text-slate-500">
              <li><a href="#" className="hover:text-slate-900 transition-colors">Datenschutz</a></li>
              <li><a href="#" className="hover:text-slate-900 transition-colors">AGB</a></li>
              <li><a href="#" className="hover:text-slate-900 transition-colors">Impressum</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-slate-900 mb-4">Support</h4>
            <ul className="space-y-2 text-sm text-slate-500">
              <li><a href="#" className="hover:text-slate-900 transition-colors">Kontakt</a></li>
              <li><a href="#" className="hover:text-slate-900 transition-colors">FAQ</a></li>
              <li><a href="#" className="hover:text-slate-900 transition-colors">Community</a></li>
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
export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      <HeroSection />
      <ProblemSection />
      <BeltSystemSection />
      <ValuePropsSection />
      <TestimonialsSection />
      <CTASection />
      <Footer />
    </div>
  );
}
