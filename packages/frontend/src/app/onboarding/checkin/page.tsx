"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Zap,
  Moon,
  Smile,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Sparkles,
  Sun,
  Coffee,
  Users,
  Heart,
  Dumbbell,
  Brain,
  Clock,
  Smartphone,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { useAuth } from "@/providers/AuthProvider";
import { checkInApi, CheckInData } from "@/lib/api";

// Fragen für den Check-in
const QUESTIONS = [
  {
    id: "energyLevel",
    question: "Wie energievoll fühlst du dich heute?",
    subtitle: "Denk an dein allgemeines Energielevel in den letzten 24 Stunden",
    icon: Zap,
    type: "slider",
    min: 1,
    max: 10,
    labels: { 1: "Erschöpft", 5: "Okay", 10: "Voller Energie" },
  },
  {
    id: "sleepQuality",
    question: "Wie gut hast du geschlafen?",
    subtitle: "Qualität und Erholsamkeit deines Schlafs",
    icon: Moon,
    type: "slider",
    min: 1,
    max: 10,
    labels: { 1: "Sehr schlecht", 5: "Mittel", 10: "Ausgezeichnet" },
  },
  {
    id: "moodLevel",
    question: "Wie ist deine Stimmung gerade?",
    subtitle: "Dein emotionales Wohlbefinden",
    icon: Smile,
    type: "slider",
    min: 1,
    max: 10,
    labels: { 1: "Sehr schlecht", 5: "Neutral", 10: "Fantastisch" },
  },
  {
    id: "energyGivers",
    question: "Was hat dir heute Energie gegeben?",
    subtitle: "Wähle alle zutreffenden aus",
    icon: Sun,
    type: "multiselect",
    options: [
      { id: "movement", label: "Bewegung", icon: Dumbbell },
      { id: "nature", label: "Zeit in der Natur", icon: Sun },
      { id: "social", label: "Soziale Kontakte", icon: Users },
      { id: "rest", label: "Ruhepausen", icon: Coffee },
      { id: "nutrition", label: "Gutes Essen", icon: Heart },
      { id: "learning", label: "Etwas Neues lernen", icon: Brain },
    ],
  },
  {
    id: "energyDrainers",
    question: "Was hat dir Energie genommen?",
    subtitle: "Wähle alle zutreffenden aus",
    icon: AlertCircle,
    type: "multiselect",
    options: [
      { id: "stress", label: "Stress/Druck", icon: AlertCircle },
      { id: "poor_sleep", label: "Schlechter Schlaf", icon: Moon },
      { id: "screen_time", label: "Zu viel Bildschirmzeit", icon: Smartphone },
      { id: "no_movement", label: "Wenig Bewegung", icon: Dumbbell },
      { id: "conflicts", label: "Konflikte", icon: Users },
      { id: "overwork", label: "Überarbeitung", icon: Clock },
    ],
  },
];

// Energie-Level Interpretation
function getEnergyInterpretation(score: number) {
  if (score >= 8) {
    return {
      title: "Ausgezeichnet!",
      message: "Du bist voller LEBENSENERGIE! Nutze diesen Schwung für deine Ziele.",
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
      borderColor: "border-emerald-200",
    };
  } else if (score >= 6) {
    return {
      title: "Gut unterwegs!",
      message: "Du hast solide Energie. Mit kleinen Anpassungen kannst du noch mehr rausholen.",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
    };
  } else if (score >= 4) {
    return {
      title: "Ausbaufähig",
      message: "Da ist noch Potenzial! Lass uns gemeinsam deine Energiequellen aktivieren.",
      color: "text-amber-600",
      bgColor: "bg-amber-50",
      borderColor: "border-amber-200",
    };
  } else {
    return {
      title: "Zeit für Veränderung",
      message: "Deine Energie ist niedrig – aber das können wir ändern. Starte jetzt deine Transformation.",
      color: "text-red-600",
      bgColor: "bg-red-50",
      borderColor: "border-red-200",
    };
  }
}

// Empfehlung basierend auf Antworten
function getRecommendation(answers: Record<string, number | string[]>) {
  const energyLevel = (answers.energyLevel as number) || 5;
  const sleepQuality = (answers.sleepQuality as number) || 5;
  const moodLevel = (answers.moodLevel as number) || 5;
  
  // Prioritäten basierend auf niedrigsten Werten
  if (sleepQuality <= energyLevel && sleepQuality <= moodLevel) {
    return {
      module: "Regenerativer Schlaf",
      description: "Entdecke, wie du deine Schlafqualität optimierst",
      duration: "10 Min",
      slug: "sleep-optimization",
    };
  } else if (moodLevel <= energyLevel) {
    return {
      module: "Emotionale Resilienz",
      description: "Techniken für mehr emotionale Balance",
      duration: "8 Min",
      slug: "emotional-resilience",
    };
  } else {
    return {
      module: "Deine Kraftquellen",
      description: "Entdecke und aktiviere deine natürlichen Energiequellen",
      duration: "10 Min",
      slug: "energy-sources",
    };
  }
}

export default function CheckInPage() {
  const router = useRouter();
  const { token, isAuthenticated } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number | string[]>>({});
  const [showResult, setShowResult] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newBadges, setNewBadges] = useState<string[]>([]);

  const currentQuestion = QUESTIONS[currentStep];
  const progress = ((currentStep + 1) / QUESTIONS.length) * 100;

  const handleSliderChange = (value: number) => {
    setAnswers((prev) => ({ ...prev, [currentQuestion.id]: value }));
  };

  const handleMultiSelect = (optionId: string) => {
    const current = (answers[currentQuestion.id] as string[]) || [];
    const updated = current.includes(optionId)
      ? current.filter((id) => id !== optionId)
      : [...current, optionId];
    setAnswers((prev) => ({ ...prev, [currentQuestion.id]: updated }));
  };

  const handleNext = async () => {
    if (currentStep < QUESTIONS.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      // Submit check-in to API if authenticated
      if (isAuthenticated && token) {
        setIsSubmitting(true);
        try {
          const checkInData: CheckInData = {
            energyLevel: (answers.energyLevel as number) || 5,
            sleepQuality: (answers.sleepQuality as number) || 5,
            moodLevel: (answers.moodLevel as number) || 5,
            energyGivers: (answers.energyGivers as string[]) || [],
            energyDrainers: (answers.energyDrainers as string[]) || [],
          };
          const result = await checkInApi.create(checkInData, token);
          setNewBadges(result.newBadges);
        } catch (error) {
          console.error("Failed to save check-in:", error);
          // Still show result even if save fails
        } finally {
          setIsSubmitting(false);
        }
      }
      setShowResult(true);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const canProceed = () => {
    const answer = answers[currentQuestion.id];
    if (currentQuestion.type === "slider") {
      return answer !== undefined;
    }
    // Multiselect kann leer sein
    return true;
  };

  // Berechne LEBENSENERGIE Score
  const lebensenergieScore =
    ((answers.energyLevel as number) || 5) +
    ((answers.sleepQuality as number) || 5) +
    ((answers.moodLevel as number) || 5);
  const averageScore = lebensenergieScore / 3;

  const interpretation = getEnergyInterpretation(averageScore);
  const recommendation = getRecommendation(answers);

  // Result Screen
  if (showResult) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-slate-50 to-emerald-50/30">
        {/* Header */}
        <header className="border-b border-slate-200 bg-white/80 backdrop-blur-xl">
          <div className="max-w-2xl mx-auto px-6 h-16 flex items-center">
            <Link href="/landing" className="text-xl font-bold text-[#66dd99]">
              campus.mojo
            </Link>
          </div>
        </header>

        <main className="max-w-2xl mx-auto px-6 py-12">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-8"
          >
            {/* Celebration */}
            <div className="text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", bounce: 0.5, delay: 0.2 }}
                className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[#66dd99]/20 mb-6"
              >
                <Sparkles className="w-10 h-10 text-[#66dd99]" />
              </motion.div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2">
                Dein LEBENSENERGIE-Level
              </h1>
              <p className="text-slate-500">
                Basierend auf deinen Antworten von heute
              </p>
            </div>

            {/* Score Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className={`rounded-2xl border ${interpretation.borderColor} ${interpretation.bgColor} p-8`}
            >
              {/* Score Display */}
              <div className="text-center mb-6">
                <div className="text-6xl font-bold text-slate-900 mb-2">
                  {averageScore.toFixed(1)}
                  <span className="text-2xl text-slate-400">/10</span>
                </div>
                
                {/* Progress Bar */}
                <div className="w-full h-4 bg-slate-200 rounded-full overflow-hidden mb-4">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${averageScore * 10}%` }}
                    transition={{ duration: 1, delay: 0.5 }}
                    className="h-full bg-gradient-to-r from-[#66dd99] to-[#44cc88] rounded-full"
                  />
                </div>
                
                <h2 className={`text-xl font-semibold ${interpretation.color}`}>
                  {interpretation.title}
                </h2>
                <p className="text-slate-600 mt-2">{interpretation.message}</p>
              </div>

              {/* Breakdown */}
              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-200/50">
                <div className="text-center">
                  <Zap className="w-5 h-5 mx-auto text-[#66dd99] mb-1" />
                  <div className="text-lg font-semibold text-slate-900">
                    {answers.energyLevel || "-"}
                  </div>
                  <div className="text-xs text-slate-500">Energie</div>
                </div>
                <div className="text-center">
                  <Moon className="w-5 h-5 mx-auto text-[#66dd99] mb-1" />
                  <div className="text-lg font-semibold text-slate-900">
                    {answers.sleepQuality || "-"}
                  </div>
                  <div className="text-xs text-slate-500">Schlaf</div>
                </div>
                <div className="text-center">
                  <Smile className="w-5 h-5 mx-auto text-[#66dd99] mb-1" />
                  <div className="text-lg font-semibold text-slate-900">
                    {answers.moodLevel || "-"}
                  </div>
                  <div className="text-xs text-slate-500">Stimmung</div>
                </div>
              </div>
            </motion.div>

            {/* Recommendation */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="rounded-2xl border border-slate-200 bg-white p-6"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#66dd99]/10 flex items-center justify-center shrink-0">
                  <Brain className="w-6 h-6 text-[#66dd99]" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-[#66dd99] font-medium mb-1">
                    Dein nächster Schritt
                  </p>
                  <h3 className="text-lg font-semibold text-slate-900 mb-1">
                    {recommendation.module}
                  </h3>
                  <p className="text-sm text-slate-500 mb-3">
                    {recommendation.description}
                  </p>
                  <span className="inline-flex items-center gap-1 text-xs text-slate-400">
                    <Clock className="w-3 h-3" />
                    {recommendation.duration}
                  </span>
                </div>
              </div>
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="flex flex-col gap-3"
            >
              <button
                onClick={() => router.push("/dashboard")}
                className="w-full py-4 bg-[#66dd99] hover:bg-[#44cc88] text-black font-semibold rounded-xl transition-all flex items-center justify-center gap-2"
              >
                Zum Dashboard
                <ArrowRight className="w-5 h-5" />
              </button>
              <button
                onClick={() => router.push(`/courses/${recommendation.slug}`)}
                className="w-full py-4 bg-white hover:bg-slate-50 text-slate-700 font-medium rounded-xl border border-slate-200 transition-all"
              >
                Modul starten: {recommendation.module}
              </button>
            </motion.div>

            {/* Save Reminder */}
            <p className="text-center text-sm text-slate-400">
              <CheckCircle2 className="w-4 h-4 inline mr-1" />
              Dein Check-in wurde gespeichert
            </p>
          </motion.div>
        </main>
      </div>
    );
  }

  // Question Flow
  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-slate-50 to-emerald-50/30">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-xl">
        <div className="max-w-2xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/landing" className="text-xl font-bold text-[#66dd99]">
            campus.mojo
          </Link>
          <span className="text-sm text-slate-500">
            Frage {currentStep + 1} von {QUESTIONS.length}
          </span>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="h-1 bg-slate-100">
        <motion.div
          className="h-full bg-[#66dd99]"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      <main className="max-w-2xl mx-auto px-6 py-12">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8"
          >
            {/* Question */}
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#66dd99]/10 mb-6">
                <currentQuestion.icon className="w-8 h-8 text-[#66dd99]" />
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">
                {currentQuestion.question}
              </h1>
              <p className="text-slate-500">{currentQuestion.subtitle}</p>
            </div>

            {/* Answer Input */}
            {currentQuestion.type === "slider" && (
              <div className="space-y-6">
                {/* Slider */}
                <div className="px-4">
                  <input
                    type="range"
                    min={currentQuestion.min}
                    max={currentQuestion.max}
                    value={(answers[currentQuestion.id] as number) || 5}
                    onChange={(e) => handleSliderChange(parseInt(e.target.value))}
                    className="w-full h-3 bg-slate-200 rounded-full appearance-none cursor-pointer
                      [&::-webkit-slider-thumb]:appearance-none
                      [&::-webkit-slider-thumb]:w-8
                      [&::-webkit-slider-thumb]:h-8
                      [&::-webkit-slider-thumb]:bg-[#66dd99]
                      [&::-webkit-slider-thumb]:rounded-full
                      [&::-webkit-slider-thumb]:shadow-lg
                      [&::-webkit-slider-thumb]:cursor-pointer
                      [&::-webkit-slider-thumb]:border-4
                      [&::-webkit-slider-thumb]:border-white
                      [&::-moz-range-thumb]:w-8
                      [&::-moz-range-thumb]:h-8
                      [&::-moz-range-thumb]:bg-[#66dd99]
                      [&::-moz-range-thumb]:rounded-full
                      [&::-moz-range-thumb]:border-4
                      [&::-moz-range-thumb]:border-white
                      [&::-moz-range-thumb]:cursor-pointer"
                  />
                </div>

                {/* Value Display */}
                <div className="text-center">
                  <span className="text-5xl font-bold text-slate-900">
                    {(answers[currentQuestion.id] as number) || 5}
                  </span>
                  <span className="text-2xl text-slate-400">/10</span>
                </div>

                {/* Labels */}
                <div className="flex justify-between text-sm text-slate-500 px-4">
                  {Object.entries(currentQuestion.labels || {}).map(([value, label]) => (
                    <span key={value}>{label}</span>
                  ))}
                </div>
              </div>
            )}

            {currentQuestion.type === "multiselect" && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {currentQuestion.options?.map((option) => {
                  const Icon = option.icon;
                  const isSelected = (
                    (answers[currentQuestion.id] as string[]) || []
                  ).includes(option.id);
                  return (
                    <button
                      key={option.id}
                      onClick={() => handleMultiSelect(option.id)}
                      className={`p-4 rounded-xl border-2 transition-all text-left ${
                        isSelected
                          ? "border-[#66dd99] bg-[#66dd99]/10"
                          : "border-slate-200 bg-white hover:border-slate-300"
                      }`}
                    >
                      <Icon
                        className={`w-5 h-5 mb-2 ${
                          isSelected ? "text-[#66dd99]" : "text-slate-400"
                        }`}
                      />
                      <span
                        className={`text-sm font-medium ${
                          isSelected ? "text-slate-900" : "text-slate-600"
                        }`}
                      >
                        {option.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex gap-3 mt-12">
          {currentStep > 0 && (
            <button
              onClick={handleBack}
              disabled={isSubmitting}
              className="px-6 py-3 text-slate-600 hover:text-slate-900 font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              <ArrowLeft className="w-4 h-4" />
              Zurück
            </button>
          )}
          <button
            onClick={handleNext}
            disabled={!canProceed() || isSubmitting}
            className={`flex-1 py-4 font-semibold rounded-xl transition-all flex items-center justify-center gap-2 ${
              canProceed() && !isSubmitting
                ? "bg-[#66dd99] hover:bg-[#44cc88] text-black"
                : "bg-slate-200 text-slate-400 cursor-not-allowed"
            }`}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Wird gespeichert...
              </>
            ) : currentStep < QUESTIONS.length - 1 ? (
              <>
                Weiter
                <ArrowRight className="w-5 h-5" />
              </>
            ) : (
              <>
                Ergebnis anzeigen
                <Sparkles className="w-5 h-5" />
              </>
            )}
          </button>
        </div>
      </main>
    </div>
  );
}

