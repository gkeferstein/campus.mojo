import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  MOJO_CAMPUS_LEVELS,
  getMojoCampusLevel,
  getMojoCampusLevelHref,
} from "@/lib/mojo-campus-levels";

type PageProps = {
  params: Promise<{ level: string }>;
};

export async function generateStaticParams() {
  return MOJO_CAMPUS_LEVELS.map((l) => ({ level: l.slug }));
}

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const { level } = await props.params;
  const data = getMojoCampusLevel(level);
  if (!data) return {};

  return {
    title: `Landing · ${data.name}`,
    description: data.teaser,
  };
}

export default async function LandingLevelPage(props: PageProps) {
  const { level: slug } = await props.params;
  const level = getMojoCampusLevel(slug);
  if (!level) notFound();

  const index = MOJO_CAMPUS_LEVELS.findIndex((l) => l.slug === level.slug);
  const prev = index > 0 ? MOJO_CAMPUS_LEVELS[index - 1] : undefined;
  const next =
    index >= 0 && index < MOJO_CAMPUS_LEVELS.length - 1
      ? MOJO_CAMPUS_LEVELS[index + 1]
      : undefined;

  const Icon = level.icon;

  return (
    <div className="space-y-10">
      <div className="flex items-center justify-between gap-4">
        <Button variant="ghost" asChild>
          <Link href="/landing">
            <ArrowLeft className="w-4 h-4" />
            Zur Übersicht
          </Link>
        </Button>

        <div className="text-xs text-muted-foreground">
          {String(index + 1).padStart(2, "0")} /{" "}
          {String(MOJO_CAMPUS_LEVELS.length).padStart(2, "0")}
        </div>
      </div>

      <section className="space-y-5">
        <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/50 px-3 py-1 text-xs text-muted-foreground">
          <Icon className="w-4 h-4 text-primary" />
          {level.eyebrow}
        </div>

        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
          <span className="mojo-text-gradient">MOJO {level.name}</span>
        </h1>

        <p className="text-lg text-muted-foreground max-w-3xl">{level.claim}</p>

        <div className="flex flex-col sm:flex-row gap-3">
          <Button size="lg" asChild>
            <Link href="/register">
              Zugang erstellen <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/login">Ich habe schon Zugang</Link>
          </Button>
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 bg-card/50 border-border/60">
          <CardHeader>
            <CardTitle>Warum diese Stufe zählt</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground leading-relaxed">
              {level.teaser}
            </p>

            <div className="space-y-2">
              <div className="text-sm font-semibold">
                Was du typischerweise spürst
              </div>
              <ul className="space-y-2">
                {level.outcomes.map((o) => (
                  <li key={o} className="flex items-start gap-3 text-sm">
                    <span className="mt-2 h-1.5 w-1.5 rounded-full bg-primary/70 shrink-0" />
                    <span className="text-muted-foreground">{o}</span>
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-border/60">
          <CardHeader>
            <CardTitle>Dein nächster Schritt</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Starte klein – aber starte sauber. Der MOJO Campus ist ein Weg, der
              sich im Alltag beweist.
            </p>
            <Button className="w-full" asChild>
              <Link href="/register">Jetzt Zugang erstellen</Link>
            </Button>
            <Button className="w-full" variant="outline" asChild>
              <Link href="/landing">Alle Stufen ansehen</Link>
            </Button>
          </CardContent>
        </Card>
      </section>

      <section className="flex items-center justify-between gap-3">
        <div>
          {prev ? (
            <Button variant="outline" asChild>
              <Link href={getMojoCampusLevelHref(prev.slug)}>
                <ArrowLeft className="w-4 h-4" />
                {prev.name}
              </Link>
            </Button>
          ) : (
            <div />
          )}
        </div>
        <div>
          {next ? (
            <Button asChild>
              <Link href={getMojoCampusLevelHref(next.slug)}>
                {next.name} <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          ) : (
            <Button variant="outline" asChild>
              <Link href="/landing">Zur Übersicht</Link>
            </Button>
          )}
        </div>
      </section>
    </div>
  );
}

