"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { 
  BookOpen, 
  Clock, 
  TrendingUp, 
  Zap, 
  Users, 
  Briefcase, 
  Cpu, 
  Target, 
  Building2,
  Award,
  ChevronRight,
  Sparkles,
  ShoppingCart,
  Trophy,
  Moon,
  Smile,
  ArrowRight,
  Flame,
} from "lucide-react";
import { useAuth } from "@/providers/AuthProvider";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

// MOJO Journey Stages Data
const JOURNEY_STAGES = [
  { id: 'lebensenergie', name: 'LEBENSENERGIE', color: '#66dd99', textColor: '#000000', icon: Zap },
  { id: 'campus', name: 'CAMPUS', color: '#ffffff', textColor: '#000000', borderColor: '#e5e5e5', icon: Users },
  { id: 'bootcamp', name: 'BOOTCAMP', color: '#0d63bf', textColor: '#ffffff', icon: Briefcase },
  { id: 'rmos', name: 'RMOS', color: '#873acf', textColor: '#ffffff', icon: Cpu },
  { id: 'praxiszirkel', name: 'PRAXISZIRKEL', color: '#f5bb00', textColor: '#000000', icon: Target },
  { id: 'inkubator', name: 'INKUBATOR', color: '#000000', textColor: '#ffffff', icon: Building2 },
];

// Mock user journey data (will come from backend later)
const USER_JOURNEY = {
  currentStage: 1, // 0-indexed, so 1 = Campus
  unlockedStages: 2, // Stages 0 and 1 unlocked
  totalStages: 6,
  earnedCertificates: 1,
  totalCertificates: 6,
  completedModules: 8,
  totalModules: 36,
};

// Mock LEBENSENERGIE data (will come from backend later)
const LEBENSENERGIE_DATA = {
  todayScore: null as number | null, // null = kein Check-in heute
  weeklyScores: [
    { day: "Mo", score: 6.5 },
    { day: "Di", score: 7.0 },
    { day: "Mi", score: 6.8 },
    { day: "Do", score: 7.5 },
    { day: "Fr", score: null }, // Heute
    { day: "Sa", score: null },
    { day: "So", score: null },
  ],
  streak: 4, // 4 Tage in Folge
  averageScore: 6.95,
  trend: "+0.5", // Trend gegenüber letzter Woche
};

// LEBENSENERGIE Dashboard Component (B2C)
function LebensenergieOverview() {
  const hasCheckedInToday = LEBENSENERGIE_DATA.todayScore !== null;
  const weeklyAvg = LEBENSENERGIE_DATA.averageScore;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
      className="mb-8"
    >
      <Card className="bg-gradient-to-br from-[#66dd99]/5 via-card/50 to-emerald-50/30 backdrop-blur-sm border-[#66dd99]/30 overflow-hidden">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#66dd99]/20 flex items-center justify-center">
                <Zap className="w-5 h-5 text-[#66dd99]" />
              </div>
              <div>
                <CardTitle className="text-lg">Deine LEBENSENERGIE</CardTitle>
                <CardDescription>Täglicher Check-in für mehr Bewusstsein</CardDescription>
              </div>
            </div>
            {LEBENSENERGIE_DATA.streak > 0 && (
              <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-amber-100 text-amber-700 text-sm font-medium">
                <Flame className="w-4 h-4" />
                {LEBENSENERGIE_DATA.streak} Tage Streak
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Main Score / CTA */}
          {hasCheckedInToday ? (
            // Heute bereits eingecheckt
            <div className="flex items-center gap-6 p-4 rounded-xl bg-white/50">
              <div className="text-center">
                <div className="text-4xl font-bold text-slate-900">
                  {LEBENSENERGIE_DATA.todayScore?.toFixed(1)}
                  <span className="text-lg text-slate-400">/10</span>
                </div>
                <div className="text-sm text-slate-500 mt-1">Heute</div>
              </div>
              
              <div className="flex-1 space-y-2">
                <div className="h-3 bg-slate-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-[#66dd99] to-[#44cc88] rounded-full transition-all"
                    style={{ width: `${(LEBENSENERGIE_DATA.todayScore || 0) * 10}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-slate-500">
                  <span>Niedrig</span>
                  <span>Hoch</span>
                </div>
              </div>
            </div>
          ) : (
            // Noch kein Check-in heute
            <Link href="/onboarding/checkin">
              <div className="flex items-center gap-4 p-4 rounded-xl bg-[#66dd99]/10 border-2 border-dashed border-[#66dd99]/30 hover:border-[#66dd99] hover:bg-[#66dd99]/20 transition-all cursor-pointer group">
                <div className="w-14 h-14 rounded-xl bg-[#66dd99] flex items-center justify-center">
                  <Zap className="w-7 h-7 text-black" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-slate-900 mb-1">
                    Täglicher Check-in
                  </h3>
                  <p className="text-sm text-slate-500">
                    3 Minuten für mehr Bewusstsein über deine Energie
                  </p>
                </div>
                <ArrowRight className="w-5 h-5 text-[#66dd99] group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          )}

          {/* Weekly Overview */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Diese Woche</span>
              <span className="font-medium text-[#66dd99]">
                {LEBENSENERGIE_DATA.trend} Trend
              </span>
            </div>
            
            <div className="flex gap-2">
              {LEBENSENERGIE_DATA.weeklyScores.map((day, index) => {
                const isToday = index === 4; // Freitag = heute (Beispiel)
                const hasScore = day.score !== null;
                const heightPercent = hasScore ? (day.score / 10) * 100 : 0;
                
                return (
                  <div key={day.day} className="flex-1 flex flex-col items-center gap-1">
                    <div className="relative w-full h-16 bg-slate-100 rounded-lg overflow-hidden">
                      {hasScore && (
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: `${heightPercent}%` }}
                          transition={{ delay: 0.1 * index, duration: 0.5 }}
                          className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#66dd99] to-[#88eebb] rounded-lg"
                        />
                      )}
                      {isToday && !hasScore && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-2 h-2 bg-[#66dd99] rounded-full animate-pulse" />
                        </div>
                      )}
                    </div>
                    <span className={cn(
                      "text-xs",
                      isToday ? "font-bold text-[#66dd99]" : "text-slate-400"
                    )}>
                      {day.day}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="p-3 rounded-xl bg-white/50 text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Zap className="w-4 h-4 text-[#66dd99]" />
                <span className="text-lg font-bold">{weeklyAvg.toFixed(1)}</span>
              </div>
              <div className="text-xs text-muted-foreground">Ø Energie</div>
            </div>
            
            <div className="p-3 rounded-xl bg-white/50 text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Moon className="w-4 h-4 text-blue-500" />
                <span className="text-lg font-bold">7.2</span>
              </div>
              <div className="text-xs text-muted-foreground">Ø Schlaf</div>
            </div>
            
            <div className="p-3 rounded-xl bg-white/50 text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Smile className="w-4 h-4 text-amber-500" />
                <span className="text-lg font-bold">7.0</span>
              </div>
              <div className="text-xs text-muted-foreground">Ø Stimmung</div>
            </div>
          </div>

          {/* CTA */}
          <div className="flex gap-3 pt-2">
            <Link href="/onboarding/checkin" className="flex-1">
              <Button 
                variant={hasCheckedInToday ? "outline" : "default"}
                className={cn(
                  "w-full gap-2",
                  !hasCheckedInToday && "bg-[#66dd99] hover:bg-[#44cc88] text-black"
                )}
              >
                <Zap className="w-4 h-4" />
                {hasCheckedInToday ? "Erneut checken" : "Jetzt Check-in"}
              </Button>
            </Link>
            <Link href="/progress" className="flex-1">
              <Button variant="outline" className="w-full gap-2">
                <TrendingUp className="w-4 h-4" />
                Verlauf ansehen
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function JourneyQuickOverview() {
  const progressPercent = (USER_JOURNEY.completedModules / USER_JOURNEY.totalModules) * 100;
  const currentStage = JOURNEY_STAGES[USER_JOURNEY.currentStage];
  const CurrentIcon = currentStage.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.35 }}
      className="mb-8"
    >
      <Card className="bg-card/50 backdrop-blur-sm border-primary/20 overflow-hidden">
        {/* Header with Gradient */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-purple-500/10 to-primary/5" />
          <CardHeader className="relative pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Trophy className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg">Meine MOJO Journey</CardTitle>
                  <CardDescription>Dein Weg durch das Graduierungssystem</CardDescription>
                </div>
              </div>
              <Link 
                href="/progress"
                className="text-sm text-primary hover:text-primary/80 flex items-center gap-1 transition-colors"
              >
                Details
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </CardHeader>
        </div>

        <CardContent className="space-y-6">
          {/* Current Stage Highlight */}
          <div className="flex items-center gap-4 p-4 rounded-xl bg-secondary/30">
            <div 
              className="w-14 h-14 rounded-xl flex items-center justify-center shrink-0"
              style={{ backgroundColor: currentStage.color }}
            >
              <CurrentIcon className="w-7 h-7" style={{ color: currentStage.textColor }} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">
                  AKTUELLE STUFE
                </span>
              </div>
              <h3 className="font-bold text-lg">{currentStage.name}</h3>
              <p className="text-sm text-muted-foreground">
                Stufe {USER_JOURNEY.currentStage + 1} von {USER_JOURNEY.totalStages}
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-primary">{progressPercent.toFixed(0)}%</div>
              <div className="text-xs text-muted-foreground">Gesamtfortschritt</div>
            </div>
          </div>

          {/* Stage Progress Visualization */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Stufen-Fortschritt</span>
              <span className="font-medium">{USER_JOURNEY.unlockedStages} von {USER_JOURNEY.totalStages} freigeschaltet</span>
            </div>
            <div className="flex gap-1.5">
              {JOURNEY_STAGES.map((stage, index) => {
                const isUnlocked = index < USER_JOURNEY.unlockedStages;
                const isCurrent = index === USER_JOURNEY.currentStage;
                const Icon = stage.icon;
                
                return (
                  <div
                    key={stage.id}
                    className={cn(
                      "flex-1 h-12 rounded-lg flex items-center justify-center transition-all relative group",
                      isUnlocked ? "cursor-pointer hover:scale-105" : "opacity-40"
                    )}
                    style={{
                      backgroundColor: isUnlocked ? stage.color : 'hsl(var(--muted))',
                      border: stage.borderColor ? `1px solid ${stage.borderColor}` : undefined,
                    }}
                  >
                    <Icon 
                      className="w-5 h-5" 
                      style={{ color: isUnlocked ? stage.textColor : 'hsl(var(--muted-foreground))' }} 
                    />
                    {isCurrent && (
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                        className="absolute inset-0 rounded-lg border-2 border-primary"
                      />
                    )}
                    {/* Tooltip */}
                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 px-2 py-1 bg-popover border rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                      {stage.name}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-4">
            <Link href="/progress" className="group">
              <div className="p-3 rounded-xl bg-secondary/30 hover:bg-secondary/50 transition-colors text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <span className="text-lg font-bold">{USER_JOURNEY.completedModules}</span>
                </div>
                <div className="text-xs text-muted-foreground">Module abgeschlossen</div>
              </div>
            </Link>
            
            <Link href="/certificates" className="group">
              <div className="p-3 rounded-xl bg-secondary/30 hover:bg-secondary/50 transition-colors text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Award className="w-4 h-4 text-amber-500" />
                  <span className="text-lg font-bold">{USER_JOURNEY.earnedCertificates}/{USER_JOURNEY.totalCertificates}</span>
                </div>
                <div className="text-xs text-muted-foreground">Zertifikate</div>
              </div>
            </Link>
            
            <Link href="/catalog" className="group">
              <div className="p-3 rounded-xl bg-secondary/30 hover:bg-secondary/50 transition-colors text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <ShoppingCart className="w-4 h-4 text-blue-500" />
                  <span className="text-lg font-bold">{USER_JOURNEY.totalStages - USER_JOURNEY.unlockedStages}</span>
                </div>
                <div className="text-xs text-muted-foreground">Stufen verfügbar</div>
              </div>
            </Link>
          </div>

          {/* CTA Links */}
          <div className="flex gap-3 pt-2">
            <Link href="/progress" className="flex-1">
              <Button variant="outline" className="w-full gap-2">
                <TrendingUp className="w-4 h-4" />
                Fortschritt ansehen
              </Button>
            </Link>
            <Link href="/catalog" className="flex-1">
              <Button className="w-full gap-2">
                <ShoppingCart className="w-4 h-4" />
                Nächste Stufe freischalten
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

interface CourseWithProgress {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  thumbnail: string | null;
  enrolled: boolean;
  progress: number;
  hasAccess: boolean;
}

export default function DashboardPage() {
  const { user, token } = useAuth();
  const [courses, setCourses] = useState<CourseWithProgress[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (token) {
      api.get<CourseWithProgress[]>("/courses", token)
        .then(setCourses)
        .catch(console.error)
        .finally(() => setIsLoading(false));
    }
  }, [token]);

  const enrolledCourses = courses.filter(c => c.enrolled);
  const availableCourses = courses.filter(c => c.hasAccess && !c.enrolled);

  return (
    <div className="container mx-auto">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold mb-2">
          Willkommen zurück{user?.firstName ? `, ${user.firstName}` : ""}! 👋
        </h1>
        <p className="text-muted-foreground">
          Setze dein Lernen fort oder entdecke neue Kurse.
        </p>
      </motion.div>

      {/* LEBENSENERGIE Overview (B2C) */}
      <LebensenergieOverview />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-card/50 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{enrolledCourses.length}</p>
                  <p className="text-sm text-muted-foreground">Aktive Kurse</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-card/50 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-green-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {enrolledCourses.length > 0
                      ? Math.round(
                          enrolledCourses.reduce((acc, c) => acc + c.progress, 0) /
                            enrolledCourses.length
                        )
                      : 0}
                    %
                  </p>
                  <p className="text-sm text-muted-foreground">Durchschnittlicher Fortschritt</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="bg-card/50 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center">
                  <Clock className="w-6 h-6 text-blue-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{availableCourses.length}</p>
                  <p className="text-sm text-muted-foreground">Verfügbare Kurse</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* MOJO Journey Quick Overview */}
      <JourneyQuickOverview />

      {/* Continue Learning */}
      {enrolledCourses.length > 0 && (
        <section className="mb-12">
          <h2 className="text-xl font-semibold mb-4">Lernen fortsetzen</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {enrolledCourses.map((course, index) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
              >
                <Link href={`/courses/${course.slug}`}>
                  <Card className="bg-card/50 backdrop-blur-sm hover:bg-card transition-all hover:shadow-lg hover:shadow-primary/5 group cursor-pointer h-full">
                    <CardHeader>
                      <div className="aspect-video bg-gradient-to-br from-primary/20 to-purple-500/20 rounded-lg mb-4 overflow-hidden">
                        {course.thumbnail ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={course.thumbnail}
                            alt={course.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <BookOpen className="w-12 h-12 text-primary/40" />
                          </div>
                        )}
                      </div>
                      <CardTitle className="group-hover:text-primary transition-colors">
                        {course.title}
                      </CardTitle>
                      <CardDescription className="line-clamp-2">
                        {course.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Fortschritt</span>
                          <span className="font-medium">{course.progress}%</span>
                        </div>
                        <Progress value={course.progress} />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* Available Courses */}
      {availableCourses.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold mb-4">Verfügbare Kurse</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {availableCourses.map((course, index) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
              >
                <Link href={`/courses/${course.slug}`}>
                  <Card className="bg-card/50 backdrop-blur-sm hover:bg-card transition-all hover:shadow-lg hover:shadow-primary/5 group cursor-pointer h-full">
                    <CardHeader>
                      <div className="aspect-video bg-gradient-to-br from-primary/20 to-purple-500/20 rounded-lg mb-4 overflow-hidden">
                        {course.thumbnail ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={course.thumbnail}
                            alt={course.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <BookOpen className="w-12 h-12 text-primary/40" />
                          </div>
                        )}
                      </div>
                      <CardTitle className="group-hover:text-primary transition-colors">
                        {course.title}
                      </CardTitle>
                      <CardDescription className="line-clamp-2">
                        {course.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button className="w-full">Kurs starten</Button>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* Empty State */}
      {!isLoading && courses.length === 0 && (
        <Card className="bg-card/50 backdrop-blur-sm text-center p-12">
          <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">Keine Kurse verfügbar</h3>
          <p className="text-muted-foreground">
            Du hast noch keinen Zugang zu Kursen. Kontaktiere uns, um loszulegen.
          </p>
        </Card>
      )}
    </div>
  );
}
