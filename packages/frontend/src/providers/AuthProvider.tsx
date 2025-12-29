"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useAuth as useClerkAuth, useUser } from "@clerk/nextjs";
import { api } from "@/lib/api";

interface User {
  id: string;
  clerkUserId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  tenantId?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { isLoaded, isSignedIn, getToken } = useClerkAuth();
  const { user: clerkUser } = useUser();
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    if (!isLoaded) return;

    if (!isSignedIn) {
      setUser(null);
      setToken(null);
      setIsLoading(false);
      return;
    }

    try {
      // Get Clerk JWT token
      const clerkToken = await getToken();
      setToken(clerkToken);

      if (clerkToken) {
        // Fetch user data from our API
        const userData = await api.get<User>("/me", clerkToken);
        setUser(userData);
      }
    } catch (error) {
      console.error("Error fetching user:", error);
      // User might not exist in our DB yet (webhook delay)
      // Create a basic user object from Clerk data
      if (clerkUser) {
        setUser({
          id: "", // Will be set once synced
          clerkUserId: clerkUser.id,
          email: clerkUser.primaryEmailAddress?.emailAddress || "",
          firstName: clerkUser.firstName || undefined,
          lastName: clerkUser.lastName || undefined,
          avatarUrl: clerkUser.imageUrl || undefined,
        });
      }
    } finally {
      setIsLoading(false);
    }
  }, [isLoaded, isSignedIn, getToken, clerkUser]);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  // Re-fetch when Clerk auth state changes
  useEffect(() => {
    if (isLoaded && isSignedIn) {
      refreshUser();
    }
  }, [isLoaded, isSignedIn, refreshUser]);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading: !isLoaded || isLoading,
        isAuthenticated: isSignedIn || false,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
