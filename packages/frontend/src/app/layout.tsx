import type { Metadata } from "next";
import { Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/providers";
import { Toaster } from "@/components/ui/toaster";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-sans",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "MOJO Campus - Learning Platform",
  description: "Premium Learning Management System für das MOJO Institut",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de" className="dark">
      <body
        className={`${spaceGrotesk.variable} ${jetbrainsMono.variable} font-sans min-h-screen bg-noise`}
      >
        <Providers>
          {/* Background gradient orbs */}
          <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
            <div className="gradient-orb gradient-orb-1" />
            <div className="gradient-orb gradient-orb-2" />
            <div className="gradient-orb gradient-orb-3" />
          </div>
          
          {/* Main content */}
          <div className="relative z-10">
            {children}
          </div>
          
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}






