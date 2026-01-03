import type { Metadata, Viewport } from "next";
import { ThemeProvider } from "next-themes";
import "./globals.css";
import { AuthProvider } from "@/providers/AuthProvider";
import { ProgressProvider } from "@/providers/ProgressProvider";
import { Toaster } from "@/components/ui/toaster";
import { ClerkWrapper } from "@/components/providers/ClerkWrapper";

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
    <html lang="de" suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          storageKey="mojo-theme"
        >
          <ClerkWrapper>
            <AuthProvider>
              <ProgressProvider>
                {children}
                <Toaster />
              </ProgressProvider>
            </AuthProvider>
          </ClerkWrapper>
        </ThemeProvider>
      </body>
    </html>
  );
}
