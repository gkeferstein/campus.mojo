import Link from "next/link";
import type { Metadata } from "next";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Landing",
  description: "MOJO Campus Landing – 6 Stufen zu chronischer Gesundheit",
};

export default function LandingLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="relative min-h-screen mojo-noise overflow-hidden">
      <div className="mojo-orbs-container" aria-hidden="true">
        <div className="mojo-orb mojo-orb-green" />
        <div className="mojo-orb mojo-orb-purple" />
        <div className="mojo-orb mojo-orb-cyan" />
      </div>

      <header className="relative z-10 border-b border-border/60 bg-background/60 backdrop-blur">
        <div className="mx-auto w-full max-w-6xl px-4 py-4 flex items-center justify-between">
          <Link href="/landing" className="font-semibold tracking-tight">
            <span className="mojo-text-gradient">MOJO Campus</span>
          </Link>
          <div className="flex items-center gap-2">
            <Button variant="ghost" asChild>
              <Link href="/login">Login</Link>
            </Button>
            <Button asChild>
              <Link href="/register">Registrieren</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="relative z-10 mx-auto w-full max-w-6xl px-4 py-10">
        {children}
      </main>

      <footer className="relative z-10 border-t border-border/60 bg-background/40 backdrop-blur">
        <div className="mx-auto w-full max-w-6xl px-4 py-6 text-sm text-muted-foreground">
          campus.mojo · Bildung & Praxis – keine medizinische Beratung
        </div>
      </footer>
    </div>
  );
}

