"use client";

import { ThemeProvider } from "next-themes";
import { AuthProvider } from "./AuthProvider";
import { ProgressProvider } from "./ProgressProvider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem={false}
      storageKey="mojo-campus-theme"
    >
      <AuthProvider>
        <ProgressProvider>
          {children}
        </ProgressProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}




