"use client";

import { ClerkProvider } from "@clerk/nextjs";
import { deDE } from "@clerk/localizations";
import { ReactNode } from "react";

export function ClerkWrapper({ children }: { children: ReactNode }) {
  const clerkPublishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  
  if (!clerkPublishableKey || clerkPublishableKey.includes('placeholder')) {
    return <>{children}</>;
  }

  return (
    <ClerkProvider
      publishableKey={clerkPublishableKey}
      localization={deDE}
      appearance={{
        variables: {
          colorPrimary: "#66dd99",
          colorBackground: "#ffffff",
          colorInputBackground: "#ffffff",
          colorInputText: "#0a0a0a",
          colorText: "#0a0a0a",
          colorTextSecondary: "#6b7280",
          borderRadius: "0.5rem",
        },
        elements: {
          formButtonPrimary:
            "bg-primary hover:bg-primary/90 text-primary-foreground",
          card: "bg-card border border-border shadow-lg",
          headerTitle: "text-foreground",
          headerSubtitle: "text-muted-foreground",
          socialButtonsBlockButton:
            "bg-secondary hover:bg-secondary/80 border-border",
          formFieldInput:
            "bg-background border-border focus:ring-primary",
          footerActionLink: "text-primary hover:text-primary/80",
        },
      }}
    >
      {children}
    </ClerkProvider>
  );
}

