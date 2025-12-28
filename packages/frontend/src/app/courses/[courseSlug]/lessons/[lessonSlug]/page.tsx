"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Clock, CheckCircle2, ArrowLeft, ArrowRight, Loader2, ChevronRight, Home } from "lucide-react";
import { useAuth } from "@/providers/AuthProvider";
import { useProgress } from "@/providers/ProgressProvider";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Sidebar } from "@/components/Sidebar";
import { ProgressBar } from "@/components/ProgressBar";
import { LessonRenderer, ContentBlock } from "@/components/LessonRenderer";
import { formatDuration } from "@/lib/utils";
import { toast } from "@/components/ui/use-toast";

interface LessonData {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  duration_minutes: number | null;
  content_blocks: ContentBlock[];
  completed: boolean;
  timeSpentSeconds: number;
}

interface CourseNav {
  id: string;
  title: string;
  slug: string;
  modules: Array<{
    id: string;
    title: string;
    slug: string;
    lessons: Array<{
      id: string;
      title: string;
      slug: string;
      duration_minutes: number | null;
      completed?: boolean;
    }>;
  }>;
  progress: number;
}

export default function LessonPage() {
  const params = useParams();
  const router = useRouter();
  const { token } = useAuth();
  const { markLessonComplete } = useProgress();
  
  const [lesson, setLesson] = useState<LessonData | null>(null);
  const [course, setCourse] = useState<CourseNav | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCompleting, setIsCompleting] = useState(false);

  const courseSlug = params.courseSlug as string;
  const lessonSlug = params.lessonSlug as string;

  useEffect(() => {
    if (!token || !courseSlug || !lessonSlug) return;

    Promise.all([
      api.get<LessonData>(`/lessons/${lessonSlug}`, token),
      api.get<CourseNav>(`/courses/${courseSlug}`, token),
    ])
      .then(([lessonData, courseData]) => {
        setLesson(lessonData);
        setCourse(courseData);
      })
      .catch((err) => {
        toast({
          variant: "destructive",
          title: "Fehler",
          description: err.message,
        });
        router.push("/dashboard");
      })
      .finally(() => setIsLoading(false));
  }, [token, courseSlug, lessonSlug, router]);

  const handleMarkComplete = useCallback(async () => {
    if (!lesson || !course) return;
    
    setIsCompleting(true);
    try {
      await markLessonComplete(lesson.id, course.id);
      setLesson((prev) => prev ? { ...prev, completed: true } : null);
      toast({
        title: "Lektion abgeschlossen! 🎉",
        description: "Super, weiter so!",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Fehler",
        description: "Konnte Lektion nicht als abgeschlossen markieren",
      });
    } finally {
      setIsCompleting(false);
    }
  }, [lesson, course, markLessonComplete]);

  // Navigation helpers
  const getNavigation = useCallback(() => {
    if (!course || !lesson) return { prev: null, next: null, currentIndex: 0, total: 0 };

    const allLessons = course.modules.flatMap((m) => m.lessons);
    const currentIndex = allLessons.findIndex((l) => l.slug === lesson.slug);
    
    return {
      prev: currentIndex > 0 ? allLessons[currentIndex - 1] : null,
      next: currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null,
      currentIndex: currentIndex + 1,
      total: allLessons.length,
    };
  }, [course, lesson]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!lesson || !course) {
    return null;
  }

  const { prev, next, currentIndex, total } = getNavigation();

  return (
    <div className="min-h-screen flex">
      {/* Progress Bar */}
      <ProgressBar progress={course.progress} />

      {/* Sidebar */}
      <Sidebar course={course} currentLessonSlug={lesson.slug} />

      {/* Main Content */}
      <main className="flex-1 lg:ml-0">
        <div className="max-w-3xl mx-auto px-4 py-8 lg:py-12">
          {/* Breadcrumb Navigation */}
          <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
            <Link href="/dashboard" className="flex items-center gap-1 hover:text-foreground transition-colors">
              <Home className="w-4 h-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </Link>
            <ChevronRight className="w-4 h-4" />
            <Link href={`/courses/${course.slug}`} className="hover:text-foreground transition-colors truncate max-w-[150px] sm:max-w-none">
              {course.title}
            </Link>
            <ChevronRight className="w-4 h-4 hidden sm:block" />
            <span className="text-foreground truncate hidden sm:block">{lesson.title}</span>
          </nav>

          {/* Lesson Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            {/* Lesson Chips */}
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span className="px-2 py-1 bg-primary/10 text-primary text-xs font-medium rounded">
                Lektion {currentIndex}
              </span>
              {lesson.duration_minutes && (
                <span className="flex items-center gap-1 px-2 py-1 bg-secondary text-muted-foreground text-xs rounded">
                  <Clock className="w-3 h-3" />
                  {formatDuration(lesson.duration_minutes)}
                </span>
              )}
              {lesson.completed && (
                <span className="flex items-center gap-1 px-2 py-1 bg-green-500/10 text-green-500 text-xs rounded">
                  <CheckCircle2 className="w-3 h-3" />
                  Abgeschlossen
                </span>
              )}
            </div>

            <h1 className="text-3xl lg:text-4xl font-bold mb-4">{lesson.title}</h1>
            
            {lesson.description && (
              <p className="text-lg text-muted-foreground">{lesson.description}</p>
            )}
          </motion.div>

          {/* Lesson Content */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <LessonRenderer blocks={lesson.content_blocks || []} />
          </motion.div>

          {/* Mark Complete CTA */}
          {!lesson.completed && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mt-12"
            >
              <Card className="bg-gradient-to-r from-primary/10 to-purple-500/10 border-primary/20">
                <CardContent className="p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div>
                    <h3 className="font-semibold mb-1">Lektion abschließen</h3>
                    <p className="text-sm text-muted-foreground">
                      Markiere diese Lektion als abgeschlossen, um fortzufahren.
                    </p>
                  </div>
                  <Button
                    size="lg"
                    onClick={handleMarkComplete}
                    disabled={isCompleting}
                    className="shrink-0"
                  >
                    {isCompleting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Wird gespeichert...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        Als abgeschlossen markieren
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Navigation */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-12 flex items-center justify-between border-t border-border pt-8"
          >
            {prev ? (
              <Link
                href={`/courses/${course.slug}/lessons/${prev.slug}`}
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <div className="text-left">
                  <p className="text-xs">Vorherige Lektion</p>
                  <p className="font-medium">{prev.title}</p>
                </div>
              </Link>
            ) : (
              <div />
            )}

            <span className="text-sm text-muted-foreground">
              {currentIndex} / {total}
            </span>

            {next ? (
              <Link
                href={`/courses/${course.slug}/lessons/${next.slug}`}
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <div className="text-right">
                  <p className="text-xs">Nächste Lektion</p>
                  <p className="font-medium">{next.title}</p>
                </div>
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <Link
                href={`/courses/${course.slug}`}
                className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors"
              >
                <div className="text-right">
                  <p className="text-xs">Kurs beendet!</p>
                  <p className="font-medium">Zur Übersicht</p>
                </div>
                <ArrowRight className="w-4 h-4" />
              </Link>
            )}
          </motion.div>
        </div>
      </main>
    </div>
  );
}
