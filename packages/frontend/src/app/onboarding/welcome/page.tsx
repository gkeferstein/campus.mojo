"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import { useAuth } from "@/providers/AuthProvider";
import {
  Zap,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Play,
  Clock,
} from "lucide-react";

export default function WelcomePage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [step, setStep] = useState(0);

  // Animation steps
  useEffect(() => {
    const timer1 = setTimeout(() => setStep(1), 500);
    const timer2 = setTimeout(() => setStep(2), 1000);
    const timer3 = setTimeout(() => setStep(3), 1500);
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, []);

  const firstName = user?.firstName || "dort";

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-slate-50 to-emerald-50/30">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-xl">
        <div className="max-w-2xl mx-auto px-6 h-16 flex items-center">
          <span className="text-xl font-bold text-[#66dd99]">campus.mojo</span>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-16">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-8"
        >
          {/* Celebration Animation */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", bounce: 0.5 }}
            className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-[#66dd99]/20 mb-4"
          >
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ repeat: Infinity, duration: 2, repeatDelay: 1 }}
            >
              <Sparkles className="w-12 h-12 text-[#66dd99]" />
            </motion.div>
          </motion.div>

          {/* Welcome Text */}
          <div className="space-y-4">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: step >= 1 ? 1 : 0, y: step >= 1 ? 0 : 20 }}
              className="text-3xl md:text-4xl font-bold text-slate-900"
            >
              Willkommen, {firstName}! 👋
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: step >= 2 ? 1 : 0, y: step >= 2 ? 0 : 20 }}
              className="text-lg text-slate-600 max-w-lg mx-auto"
            >
              Deine <strong className="text-[#66dd99]">LEBENSENERGIE</strong> Journey startet hier.
              In nur 3 Minuten entdeckst du, wo du gerade stehst.
            </motion.p>
          </div>

          {/* Options */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: step >= 3 ? 1 : 0, y: step >= 3 ? 0 : 20 }}
            className="space-y-4 pt-4"
          >
            {/* Primary CTA - Check-in */}
            <Link href="/onboarding/checkin">
              <button className="w-full max-w-md mx-auto p-6 rounded-2xl bg-[#66dd99] hover:bg-[#44cc88] transition-all shadow-lg shadow-[#66dd99]/25 flex items-center gap-4 group">
                <div className="w-14 h-14 rounded-xl bg-black/10 flex items-center justify-center shrink-0">
                  <Zap className="w-7 h-7 text-black" />
                </div>
                <div className="flex-1 text-left">
                  <h3 className="font-semibold text-black text-lg">
                    3-Minuten LEBENSENERGIE Check-in
                  </h3>
                  <p className="text-sm text-black/70">
                    Entdecke dein Energie-Level
                  </p>
                </div>
                <ArrowRight className="w-6 h-6 text-black group-hover:translate-x-1 transition-transform" />
              </button>
            </Link>

            <div className="text-slate-400 text-sm">Oder:</div>

            {/* Secondary Option - Mini Course */}
            <Link href="/courses/lebensenergie-intro">
              <button className="w-full max-w-md mx-auto p-5 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 transition-all flex items-center gap-4 group">
                <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                  <Play className="w-6 h-6 text-slate-600" />
                </div>
                <div className="flex-1 text-left">
                  <h3 className="font-medium text-slate-900">
                    Mini-Kurs: "Was ist LEBENSENERGIE?"
                  </h3>
                  <p className="text-sm text-slate-500 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    10 Minuten
                  </p>
                </div>
                <ArrowRight className="w-5 h-5 text-slate-400 group-hover:translate-x-1 transition-transform" />
              </button>
            </Link>
          </motion.div>

          {/* Benefits */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: step >= 3 ? 1 : 0 }}
            transition={{ delay: 0.3 }}
            className="pt-8"
          >
            <div className="flex flex-wrap justify-center gap-4 text-sm text-slate-500">
              {[
                "Kein Zeitdruck",
                "100% kostenlos",
                "Sofort-Ergebnis",
              ].map((benefit) => (
                <div key={benefit} className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#66dd99]" />
                  <span>{benefit}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
}

