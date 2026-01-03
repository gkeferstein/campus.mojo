import type { Metadata, Viewport } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { deDE } from "@clerk/localizations";
import { ThemeProvider } from "next-themes";
import "./globals.css";
import { AuthProvider } from "@/providers/AuthProvider";
import { ProgressProvider } from "@/providers/ProgressProvider";
import { Toaster } from "@/components/ui/toaster";

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: {
    default: "campus.mojo",
    template: "%s | campus.mojo",
  },
  description: "Premium Learning Management System für das MOJO Institut",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  manifest: "/site.webmanifest",
};

export const viewport: Viewport = {
  themeColor: "#66dd99",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
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
      <html lang="de" suppressHydrationWarning>
        <body className="min-h-screen bg-background font-sans antialiased">
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem={false}
            storageKey="mojo-theme"
          >
            <AuthProvider>
              <ProgressProvider>
                {children}
              </ProgressProvider>
            </AuthProvider>
            <Toaster />
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
