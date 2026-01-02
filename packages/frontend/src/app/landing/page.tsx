import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  MOJO_CAMPUS_LEVELS,
  getMojoCampusLevelHref,
} from "@/lib/mojo-campus-levels";
import { cn } from "@/lib/utils";

export default function LandingOverviewPage() {
  return (
    <div className="space-y-10">
      <section className="space-y-5">
        <div className="inline-flex items-center rounded-full border border-border/60 bg-background/50 px-3 py-1 text-xs text-muted-foreground">
          6 Stufen · ein System · ein Ziel: chronische Gesundheit
        </div>

        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
          Der <span className="mojo-text-gradient">Wert</span> des MOJO Campus –
          als Weg, nicht als Wissensablage.
        </h1>

        <p className="text-lg text-muted-foreground max-w-3xl">
          Du steigst Stufe für Stufe vom Fundament (Energie & Regulation) zu
          Integration und mentaler Performance auf. Jede Stufe ist ein klarer,
          alltagsfähiger Hebel – mit Sprache, die du spürst.
        </p>

        <div className="flex flex-col sm:flex-row gap-3">
          <Button size="lg" asChild>
            <Link href={getMojoCampusLevelHref("lebensenergie")}>
              Mit Stufe 1 starten <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/register">Zugang erstellen</Link>
          </Button>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-end justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-2xl font-semibold tracking-tight">
              Die 6 Stufen
            </h2>
            <p className="text-sm text-muted-foreground">
              Klicke rein – jede Stufe hat ihren eigenen Claim, Nutzen und
              Fokus.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {MOJO_CAMPUS_LEVELS.map((level, idx) => {
            const Icon = level.icon;
            return (
              <Link key={level.slug} href={getMojoCampusLevelHref(level.slug)}>
                <Card
                  className={cn(
                    "h-full group transition-all hover:shadow-xl hover:-translate-y-0.5",
                    "bg-gradient-to-b",
                    level.accentClassName
                  )}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <div className="text-xs text-muted-foreground">
                          {String(idx + 1).padStart(2, "0")} · {level.eyebrow}
                        </div>
                        <CardTitle className="text-2xl">{level.name}</CardTitle>
                        <CardDescription className="text-sm">
                          {level.teaser}
                        </CardDescription>
                      </div>

                      <div className="shrink-0 w-11 h-11 rounded-xl bg-background/40 border border-border/60 flex items-center justify-center">
                        <Icon className="w-5 h-5 text-primary" />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm leading-relaxed">
                      <span className="font-medium text-foreground">
                        Claim:
                      </span>{" "}
                      <span className="text-muted-foreground">
                        {level.claim}
                      </span>
                    </p>

                    <div className="flex items-center gap-2 text-sm font-medium text-primary">
                      Mehr erfahren
                      <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </section>

      <section>
        <Card className="bg-card/50 border-border/60">
          <CardHeader>
            <CardTitle>Warum das als Stufen gedacht ist</CardTitle>
            <CardDescription>
              Kein „mehr machen“. Sondern: die richtigen Bedingungen zuerst.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <div className="text-sm font-semibold">Fundament vor Feintuning</div>
              <p className="text-sm text-muted-foreground">
                Ohne stabile Energie bleibt jedes Protokoll „zu schwer“. Wir
                beginnen dort, wo Regeneration überhaupt wieder möglich wird.
              </p>
            </div>
            <div className="space-y-2">
              <div className="text-sm font-semibold">System statt Tipps</div>
              <p className="text-sm text-muted-foreground">
                Nervensystem, Immunsystem und Stoffwechsel greifen ineinander.
                Deshalb baut jede Stufe logisch auf der vorherigen auf.
              </p>
            </div>
            <div className="space-y-2">
              <div className="text-sm font-semibold">Alltag statt Ideologie</div>
              <p className="text-sm text-muted-foreground">
                Du bekommst Hebel, die in echte Tage passen – auch wenn Job,
                Familie und Chaos gleichzeitig passieren.
              </p>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

