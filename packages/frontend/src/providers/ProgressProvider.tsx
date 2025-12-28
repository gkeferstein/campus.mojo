"use client";

import { createContext, useContext, useState, useCallback } from "react";
import { api } from "@/lib/api";
import { useAuth } from "./AuthProvider";

interface LessonProgress {
  lessonId: string;
  completed: boolean;
  timeSpentSeconds: number;
}

interface CourseProgress {
  courseId: string;
  progressPercent: number;
  lessonsCompleted: number;
  totalLessons: number;
}

interface ProgressContextType {
  courseProgress: Map<string, CourseProgress>;
  lessonProgress: Map<string, LessonProgress>;
  isLoading: boolean;
  markLessonComplete: (lessonId: string, courseId: string) => Promise<void>;
  updateTimeSpent: (lessonId: string, courseId: string, seconds: number) => Promise<void>;
  loadCourseProgress: (courseId: string) => Promise<void>;
  getLessonProgress: (lessonId: string) => LessonProgress | undefined;
  getCourseProgress: (courseId: string) => CourseProgress | undefined;
}

const ProgressContext = createContext<ProgressContextType | null>(null);

export function ProgressProvider({ children }: { children: React.ReactNode }) {
  const { token } = useAuth();
  const [courseProgress, setCourseProgress] = useState<Map<string, CourseProgress>>(new Map());
  const [lessonProgress, setLessonProgress] = useState<Map<string, LessonProgress>>(new Map());
  const [isLoading, setIsLoading] = useState(false);

  const loadCourseProgress = useCallback(async (courseId: string) => {
    if (!token) return;
    
    setIsLoading(true);
    try {
      const enrollments = await api.get<Array<{
        courseId: string;
        progressPercent: number;
      }>>("/me/enrollments", token);

      const enrollment = enrollments.find(e => e.courseId === courseId);
      if (enrollment) {
        setCourseProgress(prev => new Map(prev).set(courseId, {
          courseId,
          progressPercent: enrollment.progressPercent,
          lessonsCompleted: 0, // Will be calculated from lessons
          totalLessons: 0,
        }));
      }
    } catch (error) {
      console.error("Failed to load course progress:", error);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  const markLessonComplete = useCallback(async (lessonId: string, courseId: string) => {
    if (!token) return;

    try {
      await api.post(`/lessons/${lessonId}/complete`, {}, token);

      // Update local state
      setLessonProgress(prev => {
        const newMap = new Map(prev);
        const existing = newMap.get(lessonId);
        newMap.set(lessonId, {
          lessonId,
          completed: true,
          timeSpentSeconds: existing?.timeSpentSeconds || 0,
        });
        return newMap;
      });

      // Reload course progress
      await loadCourseProgress(courseId);
    } catch (error) {
      console.error("Failed to mark lesson complete:", error);
      throw error;
    }
  }, [token, loadCourseProgress]);

  const updateTimeSpent = useCallback(async (
    lessonId: string,
    courseId: string,
    seconds: number
  ) => {
    if (!token) return;

    try {
      await api.post(`/lessons/${lessonId}/progress`, {
        timeSpentSeconds: seconds,
        courseId,
      }, token);

      setLessonProgress(prev => {
        const newMap = new Map(prev);
        const existing = newMap.get(lessonId);
        newMap.set(lessonId, {
          lessonId,
          completed: existing?.completed || false,
          timeSpentSeconds: (existing?.timeSpentSeconds || 0) + seconds,
        });
        return newMap;
      });
    } catch (error) {
      console.error("Failed to update time spent:", error);
    }
  }, [token]);

  const getLessonProgress = useCallback((lessonId: string) => {
    return lessonProgress.get(lessonId);
  }, [lessonProgress]);

  const getCourseProgress = useCallback((courseId: string) => {
    return courseProgress.get(courseId);
  }, [courseProgress]);

  return (
    <ProgressContext.Provider
      value={{
        courseProgress,
        lessonProgress,
        isLoading,
        markLessonComplete,
        updateTimeSpent,
        loadCourseProgress,
        getLessonProgress,
        getCourseProgress,
      }}
    >
      {children}
    </ProgressContext.Provider>
  );
}

export function useProgress() {
  const context = useContext(ProgressContext);
  if (!context) {
    throw new Error("useProgress must be used within ProgressProvider");
  }
  return context;
}



