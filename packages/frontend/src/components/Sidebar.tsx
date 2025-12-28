"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ChevronDown, 
  ChevronRight, 
  CheckCircle2, 
  Circle, 
  Clock,
  Menu,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { formatDuration } from "@/lib/utils";

interface Lesson {
  id: string;
  title: string;
  slug: string;
  duration_minutes: number | null;
  completed?: boolean;
}

interface Module {
  id: string;
  title: string;
  slug: string;
  lessons: Lesson[];
}

interface Course {
  id: string;
  title: string;
  slug: string;
  modules: Module[];
  progress: number;
}

interface SidebarProps {
  course: Course;
  currentLessonSlug?: string;
}

export function Sidebar({ course, currentLessonSlug }: SidebarProps) {
  const [expandedModules, setExpandedModules] = useState<Set<string>>(
    new Set(course.modules.map(m => m.id))
  );
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const toggleModule = (moduleId: string) => {
    setExpandedModules(prev => {
      const next = new Set(prev);
      if (next.has(moduleId)) {
        next.delete(moduleId);
      } else {
        next.add(moduleId);
      }
      return next;
    });
  };

  const totalLessons = course.modules.reduce(
    (acc, m) => acc + m.lessons.length,
    0
  );
  const completedLessons = course.modules.reduce(
    (acc, m) => acc + m.lessons.filter(l => l.completed).length,
    0
  );

  const sidebarContent = (
    <>
      {/* Course Header */}
      <div className="p-4 border-b border-border">
        <Link href={`/courses/${course.slug}`} className="block">
          <h2 className="font-bold text-lg text-foreground hover:text-primary transition-colors">
            {course.title}
          </h2>
        </Link>
        
        {/* Progress Widget */}
        <div className="mt-4 p-3 rounded-lg bg-card border border-border">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-muted-foreground">Fortschritt</span>
            <span className="text-foreground font-medium">{course.progress}%</span>
          </div>
          <Progress value={course.progress} className="h-2" />
          <div className="mt-2 text-xs text-muted-foreground">
            {completedLessons} von {totalLessons} Lektionen abgeschlossen
          </div>
        </div>
      </div>

      {/* Modules & Lessons */}
      <nav className="flex-1 overflow-y-auto p-2">
        {course.modules.map((module, moduleIndex) => (
          <div key={module.id} className="mb-2">
            <button
              onClick={() => toggleModule(module.id)}
              className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-secondary/50 transition-colors"
            >
              {expandedModules.has(module.id) ? (
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              ) : (
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              )}
              <span className="text-xs text-muted-foreground font-medium">
                MODUL {moduleIndex + 1}
              </span>
              <span className="flex-1 text-left text-sm font-medium text-foreground truncate">
                {module.title}
              </span>
            </button>

            <AnimatePresence>
              {expandedModules.has(module.id) && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="pl-4 space-y-1">
                    {module.lessons.map((lesson, lessonIndex) => {
                      const isActive = lesson.slug === currentLessonSlug;
                      const lessonNumber = course.modules
                        .slice(0, moduleIndex)
                        .reduce((acc, m) => acc + m.lessons.length, 0) + lessonIndex + 1;

                      return (
                        <Link
                          key={lesson.id}
                          href={`/courses/${course.slug}/lessons/${lesson.slug}`}
                          onClick={() => setIsMobileOpen(false)}
                          className={cn(
                            "flex items-center gap-3 p-2 rounded-lg transition-colors",
                            isActive
                              ? "bg-primary/10 text-primary"
                              : "hover:bg-secondary/50 text-muted-foreground hover:text-foreground"
                          )}
                        >
                          {lesson.completed ? (
                            <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                          ) : (
                            <Circle className="w-4 h-4 shrink-0" />
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-medium opacity-60">
                                {lessonNumber}.
                              </span>
                              <span className="text-sm truncate">
                                {lesson.title}
                              </span>
                            </div>
                            {lesson.duration_minutes && (
                              <div className="flex items-center gap-1 text-xs opacity-60 mt-0.5">
                                <Clock className="w-3 h-3" />
                                {formatDuration(lesson.duration_minutes)}
                              </div>
                            )}
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </nav>
    </>
  );

  return (
    <>
      {/* Mobile Toggle */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 lg:hidden"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
      >
        {isMobileOpen ? <X /> : <Menu />}
      </Button>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setIsMobileOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 h-full w-72 bg-background/95 backdrop-blur-md border-r border-border flex flex-col z-40 transition-transform duration-300 lg:translate-x-0",
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {sidebarContent}
      </aside>

      {/* Desktop Spacer */}
      <div className="hidden lg:block w-72 shrink-0" />
    </>
  );
}


