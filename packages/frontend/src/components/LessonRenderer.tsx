"use client";

import { motion } from "framer-motion";
import { Lightbulb, AlertTriangle, Info, Code, Play } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ToolRenderer } from "@/components/tools";

export interface ContentBlock {
  type: "heading" | "paragraph" | "callout" | "code_block" | "image" | 
        "video_embed" | "divider" | "card_grid" | "pro_tip" | "quiz_embed" | "interactive_tool";
  data: Record<string, unknown>;
}

interface LessonRendererProps {
  blocks: ContentBlock[];
  className?: string;
  lessonId?: string;
  courseId?: string;
}

const blockVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export function LessonRenderer({ blocks, className, lessonId, courseId }: LessonRendererProps) {
  return (
    <div className={cn("space-y-6", className)}>
      {blocks.map((block, index) => (
        <motion.div
          key={index}
          variants={blockVariants}
          initial="hidden"
          animate="visible"
          transition={{ delay: index * 0.1 }}
        >
          <BlockRenderer block={block} lessonId={lessonId} courseId={courseId} />
        </motion.div>
      ))}
    </div>
  );
}

function BlockRenderer({ block, lessonId, courseId }: { 
  block: ContentBlock; 
  lessonId?: string;
  courseId?: string;
}) {
  switch (block.type) {
    case "heading":
      return <HeadingBlock data={block.data} />;
    case "paragraph":
      return <ParagraphBlock data={block.data} />;
    case "callout":
      return <CalloutBlock data={block.data} />;
    case "code_block":
      return <CodeBlock data={block.data} />;
    case "image":
      return <ImageBlock data={block.data} />;
    case "video_embed":
      return <VideoBlock data={block.data} />;
    case "divider":
      return <DividerBlock />;
    case "card_grid":
      return <CardGridBlock data={block.data} />;
    case "pro_tip":
      return <ProTipBlock data={block.data} />;
    case "quiz_embed":
      return <QuizEmbedBlock data={block.data} />;
    case "interactive_tool":
      return <InteractiveToolBlock data={block.data} lessonId={lessonId} courseId={courseId} />;
    default:
      return null;
  }
}

function HeadingBlock({ data }: { data: Record<string, unknown> }) {
  const level = (data.level as number) || 2;
  const text = data.text as string;
  
  const Tag = `h${level}` as keyof JSX.IntrinsicElements;
  const sizes = {
    1: "text-4xl font-bold",
    2: "text-3xl font-bold",
    3: "text-2xl font-semibold",
    4: "text-xl font-semibold",
    5: "text-lg font-medium",
    6: "text-base font-medium",
  };

  return (
    <Tag className={cn(sizes[level as keyof typeof sizes] || sizes[2], "text-foreground")}>
      {text}
    </Tag>
  );
}

function ParagraphBlock({ data }: { data: Record<string, unknown> }) {
  return (
    <p className="text-muted-foreground leading-relaxed text-lg">
      {data.text as string}
    </p>
  );
}

function CalloutBlock({ data }: { data: Record<string, unknown> }) {
  const variant = (data.variant as string) || "info";
  const text = data.text as string;

  const variants = {
    info: {
      icon: Info,
      bg: "bg-blue-500/10 border-blue-500/30",
      iconColor: "text-blue-400",
    },
    warning: {
      icon: AlertTriangle,
      bg: "bg-yellow-500/10 border-yellow-500/30",
      iconColor: "text-yellow-400",
    },
    tip: {
      icon: Lightbulb,
      bg: "bg-green-500/10 border-green-500/30",
      iconColor: "text-green-400",
    },
  };

  const config = variants[variant as keyof typeof variants] || variants.info;
  const Icon = config.icon;

  return (
    <div className={cn("flex gap-4 p-4 rounded-lg border", config.bg)}>
      <Icon className={cn("w-5 h-5 mt-0.5 shrink-0", config.iconColor)} />
      <p className="text-foreground">{text}</p>
    </div>
  );
}

function CodeBlock({ data }: { data: Record<string, unknown> }) {
  const code = data.code as string;
  const language = data.language as string;

  return (
    <div className="relative group">
      <div className="absolute top-3 right-3 text-xs text-muted-foreground bg-secondary px-2 py-1 rounded">
        {language}
      </div>
      <pre className="bg-card border border-border rounded-lg p-4 overflow-x-auto">
        <code className="text-sm font-mono text-foreground">
          {code}
        </code>
      </pre>
    </div>
  );
}

function ImageBlock({ data }: { data: Record<string, unknown> }) {
  const src = data.src as string;
  const alt = data.alt as string;
  const caption = data.caption as string;

  return (
    <figure className="space-y-2">
      <div className="relative rounded-lg overflow-hidden border border-border">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={alt} className="w-full h-auto" />
      </div>
      {caption && (
        <figcaption className="text-sm text-muted-foreground text-center">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}

function VideoBlock({ data }: { data: Record<string, unknown> }) {
  const url = data.url as string;
  const title = data.title as string;

  const getEmbedUrl = (url: string) => {
    if (url.includes("youtube.com") || url.includes("youtu.be")) {
      const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&]+)/);
      return match ? `https://www.youtube.com/embed/${match[1]}` : url;
    }
    if (url.includes("vimeo.com")) {
      const match = url.match(/vimeo\.com\/(\d+)/);
      return match ? `https://player.vimeo.com/video/${match[1]}` : url;
    }
    return url;
  };

  return (
    <div className="relative aspect-video rounded-lg overflow-hidden border border-border bg-card">
      <iframe
        src={getEmbedUrl(url)}
        title={title}
        className="absolute inset-0 w-full h-full"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  );
}

function DividerBlock() {
  return <hr className="border-border my-8" />;
}

function CardGridBlock({ data }: { data: Record<string, unknown> }) {
  const cards = (data.cards as Array<{ title: string; description: string; icon?: string }>) || [];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {cards.map((card, index) => (
        <Card key={index} className="bg-card/50 hover:bg-card transition-colors">
          <CardContent className="p-4">
            <h4 className="font-semibold text-foreground mb-2">{card.title}</h4>
            <p className="text-sm text-muted-foreground">{card.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function ProTipBlock({ data }: { data: Record<string, unknown> }) {
  const text = data.text as string;

  return (
    <div className="relative p-4 rounded-lg bg-gradient-to-r from-primary/10 to-purple-500/10 border border-primary/20">
      <div className="absolute -top-3 left-4 bg-background px-2 text-xs font-semibold text-primary uppercase tracking-wider">
        Pro Tip
      </div>
      <p className="text-foreground pt-2">{text}</p>
    </div>
  );
}

function QuizEmbedBlock({ data }: { data: Record<string, unknown> }) {
  const quizId = data.quizId as string;

  return (
    <Card className="bg-gradient-to-r from-primary/5 to-purple-500/5 border-primary/20">
      <CardContent className="p-6 flex items-center justify-between">
        <div>
          <h4 className="font-semibold text-foreground">Quiz</h4>
          <p className="text-sm text-muted-foreground">
            Teste dein Wissen mit diesem Quiz
          </p>
        </div>
        <a
          href={`/quiz/${quizId}`}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
        >
          <Play className="w-4 h-4" />
          Quiz starten
        </a>
      </CardContent>
    </Card>
  );
}

function InteractiveToolBlock({ data, lessonId, courseId }: { 
  data: Record<string, unknown>;
  lessonId?: string;
  courseId?: string;
}) {
  const toolSlug = data.toolSlug as string;
  const config = data.config as Record<string, unknown> | undefined;

  return (
    <ToolRenderer 
      toolSlug={toolSlug} 
      config={config}
      lessonId={lessonId}
      courseId={courseId}
    />
  );
}

