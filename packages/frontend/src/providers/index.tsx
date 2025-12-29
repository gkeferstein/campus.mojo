"use client";

import { ClerkProvider } from "@clerk/nextjs";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "./AuthProvider";
import { ProgressProvider } from "./ProgressProvider";
import { deDE } from "@clerk/localizations";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider
      localization={deDE}
      appearance={{
        variables: {
          colorPrimary: "#00D9FF",
          colorBackground: "#0a0a0a",
          colorText: "#ffffff",
          colorTextOnPrimaryBackground: "#000000",
          colorInputBackground: "#1a1a2e",
          colorInputText: "#ffffff",
        },
        elements: {
          formButtonPrimary: "bg-cyan-500 hover:bg-cyan-400 text-black",
          card: "bg-zinc-900/50 border border-white/10",
          headerTitle: "text-white",
          headerSubtitle: "text-zinc-400",
          socialButtonsBlockButton: "bg-zinc-800 border-zinc-700 text-white hover:bg-zinc-700",
          formFieldLabel: "text-zinc-300",
          formFieldInput: "bg-zinc-800 border-zinc-700 text-white",
          footerActionLink: "text-cyan-400 hover:text-cyan-300",
        },
      }}
    >
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
    </ClerkProvider>
  );
}
