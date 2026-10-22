"use client";

import { useEffect, useRef, useState } from "react";
import {
  Check,
  Copy,
  Download,
  ExternalLink,
  Heart,
  ImageIcon,
  Loader2,
  RefreshCw,
  Share2,
  Sparkles,
} from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { cn } from "@/lib/utils";
import type { GenerationResult } from "@/types";

interface ResultViewerProps {
  result: GenerationResult | null;
  originalImage?: string | null;
  loading: boolean;
  error: string | null;
  onRegenerate?: () => void;
  onEnhance?: () => void;
  enhancing?: boolean;
  favorite?: boolean;
  onToggleFavorite?: () => void;
  savedDesignId?: number | null;
}

const LOADING_STEPS = [
  "Reading your room & building the art direction",
  "Routing to the best free AI image engine",
  "Rendering the decorated space",
  "Writing the design story",
];

export function ResultViewer({
  result,
  originalImage,
  loading,
  error,
  onRegenerate,
  onEnhance,
  enhancing = false,
  favorite = false,
  onToggleFavorite,
  savedDesignId,
}: ResultViewerProps) {
  const [tab, setTab] = useState("result");
  const [compare, setCompare] = useState(50);
  const [copied, setCopied] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (result) setTab("result");
  }, [result?.imageUrl]);

  const handleDownload = () => {
    if (!result?.imageUrl) return;
    const link = document.createElement("a");
    link.href = result.imageUrl;
    link.download = `visionvibe-${result.prompt?.slice(0, 24).replace(/\s+/g, "-") || "design"}.png`;
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const handleShare = async () => {
    if (!result?.imageUrl) return;
    try {
      if (navigator.share) {
        await navigator.share({
          title: "Vision Vibe design",
          text: "Check out this AI interior design",
          url: window.location.href,
        });
        return;
      }
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* user cancelled */
    }
  };

  const copyPrompt = async () => {
    if (!result?.prompt) return;
    await navigator.clipboard.writeText(result.prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCompareMove = (clientX: number) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const pct = ((clientX - rect.left) / rect.width) * 100;
    setCompare(Math.min(100, Math.max(0, pct)));
  };

  if (error) {
    return (
      <div className="flex min-h-[420px] flex-col items-center justify-center gap-3 rounded-2xl border border-destructive/30 bg-destructive/5 p-8 text-center">
        <span className="text-3xl">⚠️</span>
        <p className="text-sm font-semibold text-destructive">{error}</p>
        <p className="max-w-sm text-xs text-muted-foreground">
          The free AI engines can be busy. Wait a moment and try again — every provider is
          retried automatically.
        </p>
        {onRegenerate && (
          <Button variant="outline" size="sm" onClick={onRegenerate} className="mt-1">
            <RefreshCw className="h-4 w-4" /> Try again
          </Button>
        )}
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex min-h-[420px] flex-col items-center justify-center gap-6 rounded-2xl border border-border bg-card/50 p-8">
        <div className="relative">
          <div className="absolute inset-0 animate-ping rounded-full bg-primary/25" />
          <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/15 text-primary">
            <Loader2 className="h-7 w-7 animate-spin" />
          </div>
        </div>
        <div className="w-full max-w-sm space-y-2.5">
          {LOADING_STEPS.map((step, index) => (
            <StepRow key={step} index={index} />
          ))}
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="flex min-h-[420px] flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-border bg-card/30 p-10 text-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <ImageIcon className="h-7 w-7" />
        </span>
        <div className="space-y-1">
          <p className="font-semibold">Your design will appear here</p>
          <p className="max-w-xs text-xs text-muted-foreground">
            Upload a room photo (or skip it) and pick a theme, style and budget. Vision Vibe routes
            your brief to the best free AI image engine available.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Tabs value={tab} onValueChange={setTab}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <TabsList>
            <TabsTrigger value="result">Result</TabsTrigger>
            <TabsTrigger value="story">Story</TabsTrigger>
            <TabsTrigger value="prompt">Prompt</TabsTrigger>
          </TabsList>
          <div className="flex flex-wrap items-center gap-2">
            {result.provider && (
              <Badge variant="secondary" title="Which AI engine produced this image">
                <Sparkles className="h-3 w-3" /> {result.provider}
                {result.model ? ` · ${result.model}` : ""}
              </Badge>
            )}
            {result.usedReference && (
              <Badge variant="success" title="Generated from your uploaded room photo">
                <Check className="h-3 w-3" /> Photo-matched
              </Badge>
            )}
          </div>
        </div>

        <TabsContent value="result" className="mt-4 space-y-4">
          {originalImage ? (
            <div
              ref={containerRef}
              className="relative select-none overflow-hidden rounded-2xl border border-border"
              onMouseDown={(e) => handleCompareMove(e.clientX)}
              onMouseMove={(e) => {
                if (e.buttons === 1) handleCompareMove(e.clientX);
              }}
              onTouchMove={(e) => handleCompareMove(e.touches[0].clientX)}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={result.imageUrl} alt="Generated design" className="w-full" />
              <div
                className="absolute inset-0"
                style={{ clipPath: `inset(0 ${100 - compare}% 0 0)` }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={originalImage} alt="Original room" className="h-full w-full object-cover" />
              </div>
              <div
                className="pointer-events-none absolute inset-y-0 w-0.5 bg-white/90 shadow-[0_0_20px_rgba(255,255,255,0.6)]"
                style={{ left: `${compare}%` }}
              >
                <span className="absolute top-1/2 left-1/2 flex h-9 w-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white text-slate-900 shadow-lg">
                  ↔
                </span>
              </div>
              <span className="absolute bottom-3 left-3 rounded-full bg-black/55 px-2.5 py-1 text-[10px] font-medium text-white">
                Original
              </span>
              <span className="absolute right-3 bottom-3 rounded-full bg-black/55 px-2.5 py-1 text-[10px] font-medium text-white">
                AI design
              </span>
            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-border">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={result.imageUrl} alt="Generated design" className="w-full" />
            </div>
          )}

          {result.analysis && (
            <div className="rounded-xl border border-border bg-card/60 p-3.5 text-xs">
              <p className="mb-1.5 font-semibold">
                Detected room: {result.analysis.roomType} · {result.analysis.light}
              </p>
              {result.analysis.description && (
                <p className="text-muted-foreground">{result.analysis.description}</p>
              )}
              {result.analysis.features?.length > 0 && (
                <ul className="mt-2 flex flex-wrap gap-1.5">
                  {result.analysis.features.map((feature) => (
                    <li
                      key={feature}
                      className="rounded-full border border-border/70 px-2 py-0.5 text-[10px] text-muted-foreground"
                    >
                      {feature}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="story" className="mt-4">
          <div className="rounded-2xl border border-border bg-card/60 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Design story {result.descriptionProvider ? `· ${result.descriptionProvider}` : ""}
            </p>
            <p className="mt-2.5 text-sm leading-relaxed">{result.description}</p>
          </div>
        </TabsContent>

        <TabsContent value="prompt" className="mt-4">
          <div className="rounded-2xl border border-border bg-card/60 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Art direction sent to the model
            </p>
            <pre className="mt-2.5 max-h-72 overflow-auto whitespace-pre-wrap text-xs leading-relaxed text-muted-foreground">
              {result.prompt}
            </pre>
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex flex-wrap gap-2">
        <Button onClick={handleDownload} className="gap-2">
          <Download className="h-4 w-4" /> Download
        </Button>
        <Button variant="outline" onClick={handleShare} className="gap-2">
          {copied ? <Check className="h-4 w-4" /> : <Share2 className="h-4 w-4" />} Share
        </Button>
        <Button variant="outline" onClick={copyPrompt} className="gap-2">
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />} Copy prompt
        </Button>
        {onEnhance && (
          <Button variant="outline" onClick={onEnhance} disabled={enhancing} className="gap-2">
            {enhancing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            New variation
          </Button>
        )}
        {onToggleFavorite && (
          <Button
            variant="outline"
            onClick={onToggleFavorite}
            className={cn("gap-2", favorite && "border-destructive/50 text-destructive")}
          >
            <Heart className={cn("h-4 w-4", favorite && "fill-current")} />
            {favorite ? "Favourited" : "Favourite"}
          </Button>
        )}
        {savedDesignId && (
          <Button variant="ghost" asChild className="gap-2">
            <a href={`/designs/${savedDesignId}`}>
              <ExternalLink className="h-4 w-4" /> Open in gallery
            </a>
          </Button>
        )}
      </div>
    </div>
  );
}

function StepRow({ index }: { index: number }) {
  const [active, setActive] = useState(index === 0);
  useEffect(() => {
    const timer = setTimeout(() => setActive(true), index * 2600);
    return () => clearTimeout(timer);
  }, [index]);
  return (
    <div
      className={cn(
        "flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs transition-all",
        active ? "bg-primary/10 text-foreground" : "text-muted-foreground/50"
      )}
    >
      {active ? (
        <Check className="h-3.5 w-3.5 text-success" />
      ) : (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      )}
      {LOADING_STEPS[index]}
    </div>
  );
}
