"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { BookOpen, Clock, CheckCircle2, ArrowRight, Loader2 } from "lucide-react";
import { useAuth } from "@/providers/AuthProvider";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { formatDuration } from "@/lib/utils";

interface Lesson {
  id: string;
  title: string;
  slug: string;
  duration_minutes: number | null;
  completed: boolean;
}

interface Module {
  id: string;
  title: string;
  slug: string;
  lessons: Lesson[];
}

interface CourseDetails {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  thumbnail: string | null;
  modules: Module[];
  progress: number;
}

export default function CoursePage() {
  const params = useParams();
  const router = useRouter();
  const { token } = useAuth();
  const [course, setCourse] = useState<CourseDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const courseSlug = params.courseSlug as string;

  useEffect(() => {
    if (token && courseSlug) {
      api.get<CourseDetails>(`/courses/${courseSlug}`, token)
        .then(setCourse)
        .catch((err) => setError(err.message))
        .finally(() => setIsLoading(false));
    }
  }, [token, courseSlug]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-semibold mb-2">Fehler</h2>
            <p className="text-muted-foreground mb-4">{error || "Kurs nicht gefunden"}</p>
            <Button onClick={() => router.push("/dashboard")}>Zum Dashboard</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const totalLessons = course.modules.reduce((acc, m) => acc + m.lessons.length, 0);
  const completedLessons = course.modules.reduce(
    (acc, m) => acc + m.lessons.filter((l) => l.completed).length,
    0
  );
  const totalDuration = course.modules.reduce(
    (acc, m) => acc + m.lessons.reduce((a, l) => a + (l.duration_minutes || 0), 0),
    0
  );

  // Find next incomplete lesson
  let nextLesson: { moduleIndex: number; lesson: Lesson } | null = null;
  for (let i = 0; i < course.modules.length; i++) {
    const lesson = course.modules[i].lessons.find((l) => !l.completed);
    if (lesson) {
      nextLesson = { moduleIndex: i, lesson };
      break;
    }
  }

  return (
    <div className="min-h-screen pb-12">
      {/* Hero Header */}
      <div className="relative bg-gradient-to-b from-primary/10 to-transparent border-b border-border">
        <div className="container mx-auto px-4 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Link
              href="/dashboard"
              className="text-sm text-muted-foreground hover:text-foreground mb-4 inline-block"
            >
              ← Zurück zum Dashboard
            </Link>
            <h1 className="text-4xl font-bold mb-4">{course.title}</h1>
            {course.description && (
              <p className="text-lg text-muted-foreground max-w-2xl mb-6">
                {course.description}
              </p>
            )}

            <div className="flex flex-wrap gap-6 text-sm">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-primary" />
                <span>{totalLessons} Lektionen</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary" />
                <span>{formatDuration(totalDuration)}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                <span>{completedLessons} abgeschlossen</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Course Content */}
          <div className="lg:col-span-2 space-y-6">
            {course.modules.map((module, moduleIndex) => {
              const moduleLessonsCompleted = module.lessons.filter((l) => l.completed).length;
              const moduleLessonsTotal = module.lessons.length;
              const moduleProgress = moduleLessonsTotal > 0
                ? Math.round((moduleLessonsCompleted / moduleLessonsTotal) * 100)
                : 0;

              return (
                <motion.div
                  key={module.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: moduleIndex * 0.1 }}
                >
                  <Card className="bg-card/50">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">
                            Modul {moduleIndex + 1}
                          </p>
                          <CardTitle>{module.title}</CardTitle>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {moduleLessonsCompleted}/{moduleLessonsTotal}
                        </div>
                      </div>
                      <Progress value={moduleProgress} className="h-1 mt-2" />
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {module.lessons.map((lesson, lessonIndex) => {
                          const lessonNumber =
                            course.modules
                              .slice(0, moduleIndex)
                              .reduce((acc, m) => acc + m.lessons.length, 0) +
                            lessonIndex +
                            1;

                          return (
                            <Link
                              key={lesson.id}
                              href={`/courses/${course.slug}/lessons/${lesson.slug}`}
                              className="flex items-center gap-4 p-3 rounded-lg hover:bg-secondary/50 transition-colors group"
                            >
                              {lesson.completed ? (
                                <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                              ) : (
                                <div className="w-5 h-5 rounded-full border-2 border-muted-foreground/30 shrink-0" />
                              )}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm text-muted-foreground">
                                    {lessonNumber}.
                                  </span>
                                  <span className="font-medium group-hover:text-primary transition-colors truncate">
                                    {lesson.title}
                                  </span>
                                </div>
                              </div>
                              {lesson.duration_minutes && (
                                <span className="text-sm text-muted-foreground">
                                  {formatDuration(lesson.duration_minutes)}
                                </span>
                              )}
                              <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                            </Link>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Progress Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="bg-gradient-to-br from-primary/10 to-purple-500/10 border-primary/20">
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-4">Dein Fortschritt</h3>
                  <div className="text-4xl font-bold mb-2">{course.progress}%</div>
                  <Progress value={course.progress} className="h-2 mb-4" />
                  <p className="text-sm text-muted-foreground mb-4">
                    {completedLessons} von {totalLessons} Lektionen abgeschlossen
                  </p>
                  {nextLesson && (
                    <Button asChild className="w-full">
                      <Link
                        href={`/courses/${course.slug}/lessons/${nextLesson.lesson.slug}`}
                      >
                        Weiter lernen
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Link>
                    </Button>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Course Info */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="bg-card/50">
                <CardContent className="p-6 space-y-4">
                  <h3 className="font-semibold">Kursübersicht</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Module</span>
                      <span>{course.modules.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Lektionen</span>
                      <span>{totalLessons}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Gesamtdauer</span>
                      <span>{formatDuration(totalDuration)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}









