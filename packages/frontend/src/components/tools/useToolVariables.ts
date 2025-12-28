"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "@/providers/AuthProvider";
import { api } from "@/lib/api";

interface UseToolVariablesOptions {
  toolSlug: string;
  lessonId?: string;
  courseId?: string;
  debounceMs?: number;
}

export function useToolVariables<T extends Record<string, unknown>>({
  toolSlug,
  lessonId,
  courseId,
  debounceMs = 500,
}: UseToolVariablesOptions) {
  const { token } = useAuth();
  const [variables, setVariables] = useState<T>({} as T);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Debounce timer ref
  const saveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const pendingUpdatesRef = useRef<Record<string, unknown>>({});

  // Load variables on mount
  useEffect(() => {
    if (!token) {
      setIsLoading(false);
      return;
    }

    api.get<T>(`/user-variables?toolSlug=${toolSlug}`, token)
      .then((data) => {
        setVariables(data);
        setError(null);
      })
      .catch((err) => {
        console.error("Failed to load tool variables:", err);
        setError("Fehler beim Laden der Daten");
      })
      .finally(() => setIsLoading(false));
  }, [token, toolSlug]);

  // Save pending updates
  const flushUpdates = useCallback(async () => {
    if (!token || Object.keys(pendingUpdatesRef.current).length === 0) return;

    const updates = { ...pendingUpdatesRef.current };
    pendingUpdatesRef.current = {};

    setIsSaving(true);
    try {
      await api.post("/user-variables/bulk", {
        toolSlug,
        variables: updates,
        lessonId,
        courseId,
      }, token);
      setError(null);
    } catch (err) {
      console.error("Failed to save tool variables:", err);
      setError("Fehler beim Speichern");
      // Re-add failed updates to pending
      pendingUpdatesRef.current = { ...updates, ...pendingUpdatesRef.current };
    } finally {
      setIsSaving(false);
    }
  }, [token, toolSlug, lessonId, courseId]);

  // Update a single variable (debounced save)
  const updateVariable = useCallback(<K extends keyof T>(key: K, value: T[K]) => {
    // Update local state immediately
    setVariables((prev) => ({ ...prev, [key]: value }));
    
    // Add to pending updates
    pendingUpdatesRef.current[key as string] = value;

    // Clear existing timer
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
    }

    // Set new debounce timer
    saveTimerRef.current = setTimeout(() => {
      flushUpdates();
    }, debounceMs);
  }, [debounceMs, flushUpdates]);

  // Update multiple variables at once
  const updateVariables = useCallback((updates: Partial<T>) => {
    // Update local state immediately
    setVariables((prev) => ({ ...prev, ...updates }));
    
    // Add to pending updates
    Object.assign(pendingUpdatesRef.current, updates);

    // Clear existing timer
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
    }

    // Set new debounce timer
    saveTimerRef.current = setTimeout(() => {
      flushUpdates();
    }, debounceMs);
  }, [debounceMs, flushUpdates]);

  // Save immediately (bypass debounce)
  const saveNow = useCallback(async () => {
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
    }
    await flushUpdates();
  }, [flushUpdates]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }
      // Flush any pending updates
      if (Object.keys(pendingUpdatesRef.current).length > 0) {
        flushUpdates();
      }
    };
  }, [flushUpdates]);

  return {
    variables,
    updateVariable,
    updateVariables,
    saveNow,
    isLoading,
    isSaving,
    error,
  };
}
