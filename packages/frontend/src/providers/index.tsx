"use client";

import { AuthProvider } from "./AuthProvider";
import { ProgressProvider } from "./ProgressProvider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <ProgressProvider>
        {children}
      </ProgressProvider>
    </AuthProvider>
  );
}

