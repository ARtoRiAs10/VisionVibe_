"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AlertTriangle, Sparkles, WandSparkles } from "lucide-react";
import { ImageUploader } from "@/components/image-uploader";
import { DesignControls } from "@/components/design-controls";
import { ResultViewer } from "@/components/result-viewer";
import { useToast } from "@/components/toast-provider";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { GenerationResult, ImageFile, VisionVibeControls } from "@/types";

const DEFAULT_CONTROLS: VisionVibeControls = {
  theme: "Lifestyle",
  subTheme: "Modern",
  budget: "$2,000 - $10,000",
  prompt: "",
  roomType: "",
  lighting: "Natural daylight",
  aspectRatio: "4:3",
};

export function Studio() {
  const { toast, update, dismiss } = useToast();
  const searchParams = useSearchParams();
  const [controls, setControls] = useState<VisionVibeControls>(DEFAULT_CONTROLS);
  const [imageFile, setImageFile] = useState<ImageFile | null>(null);
  const [result, setResult] = useState<GenerationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [enhancing, setEnhancing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [favorite, setFavorite] = useState(false);

  const originalImage = useMemo(
    () => (imageFile ? `data:${imageFile.mimeType};base64,${imageFile.base64}` : null),
    [imageFile]
  );

  // Prefill from the URL — this powers the "remix" button in the gallery.
  useEffect(() => {
    const theme = searchParams.get("theme");
    const style = searchParams.get("style");
    const budget = searchParams.get("budget");
    const room = searchParams.get("room");
    const lighting = searchParams.get("light");
    const aspect = searchParams.get("aspect");
    const notes = searchParams.get("notes");

    if (!theme && !style && !budget && !room && !lighting && !aspect && !notes) return;

    setControls((prev) => ({
      ...prev,
      ...(theme ? { theme } : {}),
      ...(style ? { subTheme: style } : {}),
      ...(budget ? { budget } : {}),
      ...(room ? { roomType: room } : {}),
      ...(lighting ? { lighting } : {}),
      ...(aspect ? { aspectRatio: aspect } : {}),
      ...(notes ? { prompt: notes } : {}),
    }));
  }, [searchParams]);

  const generate = useCallback(
    async (opts: { variation?: boolean } = {}) => {
      setLoading(true);
      setError(null);
      const id = toast("Rendering your design…", "loading");

      try {
        const payload = {
          imageFile: imageFile ?? undefined,
          controls: {
            ...controls,
            seed: opts.variation ? Math.floor(Math.random() * 100000) : controls.seed,
          },
        };

        const res = await fetch("/api/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const data = await res.json();
        if (res.status === 401) {
          throw new Error("Please sign in to generate and save designs.");
        }
        if (!res.ok) {
          throw new Error(data?.error || "Generation failed");
        }

        setResult(data as GenerationResult);
        setFavorite(false);
        toast(
          data.usedReference
            ? "Design ready — matched to your room photo"
            : "Design ready",
          "success"
        );
      } catch (err) {
        const message = err instanceof Error ? err.message : "Something went wrong";
        setError(message);
        toast(message, "error");
      } finally {
        setLoading(false);
        update(id, "Design ready", "success");
        setTimeout(() => dismiss(id), 900);
      }
    },
    [controls, imageFile, toast]
  );

  const enhancePrompt = useCallback(async () => {
    setEnhancing(true);
    const id = toast("Rewriting your notes into a design brief…", "loading");
    try {
      const res = await fetch("/api/enhance-prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: controls.prompt ?? "", controls }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Could not enhance the prompt");
      setControls((prev) => ({ ...prev, prompt: data.prompt }));
      toast("Prompt enhanced", "success");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Could not enhance the prompt", "error");
    } finally {
      setEnhancing(false);
      update(id, "Prompt enhanced", "success");
      setTimeout(() => dismiss(id), 700);
    }
  }, [controls, toast]);

  const toggleFavorite = useCallback(async () => {
    if (!result?.designId) {
      toast("Generate a design first", "info");
      return;
    }
    try {
      const res = await fetch(`/api/designs/${result.designId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isFavorite: !favorite }),
      });
      if (!res.ok) throw new Error("Could not update favourite");
      setFavorite((f) => !f);
      toast(favorite ? "Removed from favourites" : "Added to favourites", "success");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Could not update favourite", "error");
    }
  }, [favorite, result?.designId, toast]);

  const handleImageSelect = (file: ImageFile | null) => {
    setImageFile(file);
    setError(null);
  };

  // ⌘/Ctrl + Enter generates a design from anywhere in the studio.
  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
        event.preventDefault();
        if (!loading && controls.theme && controls.subTheme && controls.budget) {
          generate();
        }
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [controls, loading, generate]);

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,26rem)_minmax(0,1fr)]">
      {/* Control rail */}
      <aside className="space-y-5">
        <section className="rounded-2xl border border-border bg-card/70 p-5 shadow-sm backdrop-blur">
          <header className="mb-4 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-sm font-semibold">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/12 text-primary">
                <Sparkles className="h-4 w-4" />
              </span>
              Step 1 · Your room
            </h2>
            {imageFile ? (
              <Badge variant="success">Photo attached</Badge>
            ) : (
              <Badge variant="outline">Optional</Badge>
            )}
          </header>
          <ImageUploader
            onImageSelect={handleImageSelect}
            onEnhance={enhancePrompt}
            enhancing={enhancing}
            disabled={loading}
          />
          <p className="mt-3 flex items-start gap-1.5 text-[11px] leading-relaxed text-muted-foreground">
            <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0" />
            With a Gemini key the AI edits your actual photo (true before/after). Without one it
            renders a brand new room from your brief.
          </p>
        </section>

        <section className="rounded-2xl border border-border bg-card/70 p-5 shadow-sm backdrop-blur">
          <header className="mb-4 flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/12 text-primary">
              <WandSparkles className="h-4 w-4" />
            </span>
            <h2 className="text-sm font-semibold">Step 2 · Direct the design</h2>
          </header>
          <DesignControls
            value={controls}
            onChange={setControls}
            onGenerate={() => generate()}
            onEnhancePrompt={enhancePrompt}
            enhancing={enhancing}
            disabled={loading}
            loading={loading}
          />
        </section>
      </aside>

      {/* Canvas */}
      <section className="space-y-4">
        <div
          className={cn(
            "rounded-2xl border border-border bg-card/70 p-5 shadow-sm backdrop-blur",
            "min-h-[520px]"
          )}
        >
          <ResultViewer
            result={result}
            originalImage={originalImage}
            loading={loading}
            error={error}
            onRegenerate={() => generate()}
            onEnhance={() => generate({ variation: true })}
            enhancing={enhancing}
            favorite={favorite}
            onToggleFavorite={toggleFavorite}
            savedDesignId={result?.designId ?? null}
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-card/50 px-4 py-3 text-xs text-muted-foreground">
          <span>
            Every generation is saved to your gallery — free AI engines, no credits required.
          </span>
          <Button variant="ghost" size="sm" onClick={() => generate({ variation: true })} disabled={loading}>
            Roll the dice · new variation
          </Button>
        </div>
      </section>
    </div>
  );
}
