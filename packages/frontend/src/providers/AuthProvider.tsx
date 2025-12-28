"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { api } from "@/lib/api";

interface User {
  id: string;
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
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, firstName?: string, lastName?: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    const storedToken = localStorage.getItem("campus_token");
    if (!storedToken) {
      setIsLoading(false);
      return;
    }

    try {
      setToken(storedToken);
      const userData = await api.get<User>("/me", storedToken);
      setUser(userData);
    } catch {
      localStorage.removeItem("campus_token");
      setToken(null);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = async (email: string, password: string) => {
    const response = await api.post<{ user: User; token: string }>("/auth/login", {
      email,
      password,
    });

    localStorage.setItem("campus_token", response.token);
    setToken(response.token);
    setUser(response.user);
  };

  const register = async (
    email: string,
    password: string,
    firstName?: string,
    lastName?: string
  ) => {
    const response = await api.post<{ user: User; token: string }>("/auth/register", {
      email,
      password,
      firstName,
      lastName,
    });

    localStorage.setItem("campus_token", response.token);
    setToken(response.token);
    setUser(response.user);
  };

  const logout = () => {
    localStorage.removeItem("campus_token");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
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


