"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Heart, Loader2, Search, Sparkles, Trash2, Wand2 } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { useToast } from "./toast-provider";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/utils";
import type { DesignResult } from "@/types";

export function DesignGallery({ designs }: { designs: DesignResult[] }) {
  const router = useRouter();
  const { toast } = useToast();
  const [query, setQuery] = useState("");
  const [theme, setTheme] = useState<string>("All");
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [busyId, setBusyId] = useState<number | null>(null);

  const themes = useMemo(
    () => ["All", ...Array.from(new Set(designs.map((d) => d.theme)))],
    [designs]
  );

  const filtered = useMemo(
    () =>
      designs.filter((design) => {
        const matchesTheme = theme === "All" || design.theme === theme;
        const matchesFav = !favoritesOnly || design.isFavorite;
        const haystack = `${design.theme} ${design.subTheme} ${design.prompt ?? ""} ${
          design.description ?? ""
        } ${design.roomType ?? ""}`.toLowerCase();
        const matchesQuery = !query.trim() || haystack.includes(query.trim().toLowerCase());
        return matchesTheme && matchesFav && matchesQuery;
      }),
    [designs, favoritesOnly, query, theme]
  );

  const toggleFavorite = async (design: DesignResult) => {
    setBusyId(design.id ?? null);
    try {
      const res = await fetch(`/api/designs/${design.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isFavorite: !design.isFavorite }),
      });
      if (!res.ok) throw new Error("Could not update favourite");
      toast(design.isFavorite ? "Removed from favourites" : "Added to favourites", "success");
      router.refresh();
    } catch (err) {
      toast(err instanceof Error ? err.message : "Something went wrong", "error");
    } finally {
      setBusyId(null);
    }
  };

  const remove = async (design: DesignResult) => {
    if (!window.confirm("Delete this design? This cannot be undone.")) return;
    setBusyId(design.id ?? null);
    try {
      const res = await fetch(`/api/designs/${design.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Could not delete design");
      toast("Design deleted", "success");
      router.refresh();
    } catch (err) {
      toast(err instanceof Error ? err.message : "Something went wrong", "error");
    } finally {
      setBusyId(null);
    }
  };

  const remixHref = (design: DesignResult) => {
    const params = new URLSearchParams({
      theme: design.theme,
      style: design.subTheme,
      budget: design.budget,
    });
    if (design.roomType) params.set("room", design.roomType);
    if (design.lighting) params.set("light", design.lighting);
    if (design.aspectRatio) params.set("aspect", design.aspectRatio);
    if (design.prompt) params.set("notes", design.prompt);
    return `/dashboard?${params.toString()}`;
  };

  if (designs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-border bg-card/40 py-20 text-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Sparkles className="h-7 w-7" />
        </span>
        <div className="space-y-1">
          <p className="font-semibold">No designs yet</p>
          <p className="max-w-sm text-sm text-muted-foreground">
            Head to the studio, pick a theme and let the AI decorate a room for you.
          </p>
        </div>
        <Link href="/dashboard">
          <Button>Create your first design</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[14rem] flex-1">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search designs, styles, notes…"
            className="pl-9"
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {themes.map((t) => (
            <button
              key={t}
              onClick={() => setTheme(t)}
              className={cn(
                "rounded-full border px-3 py-1.5 text-xs font-medium transition-all",
                theme === t
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"
              )}
            >
              {t}
            </button>
          ))}
        </div>
        <Button
          variant={favoritesOnly ? "default" : "outline"}
          size="sm"
          onClick={() => setFavoritesOnly((f) => !f)}
          className="gap-1.5"
        >
          <Heart className={cn("h-3.5 w-3.5", favoritesOnly && "fill-current")} /> Favourites
        </Button>
      </div>

      {filtered.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border py-16 text-center text-sm text-muted-foreground">
          Nothing matches those filters.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((design) => (
            <article
              key={design.id}
              className="group overflow-hidden rounded-2xl border border-border bg-card/70 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg"
            >
              <Link href={`/designs/${design.id}`} className="block">
                <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                  {design.generatedImageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={design.generatedImageUrl}
                      alt={`${design.theme} ${design.subTheme}`}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
                      No preview
                    </div>
                  )}
                  <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-2 bg-gradient-to-t from-black/75 to-transparent px-3 py-2">
                    <span className="text-[11px] font-medium text-white">
                      {design.roomType ?? "Interior"} · {design.budget}
                    </span>
                    {design.provider && (
                      <span className="rounded-full bg-white/15 px-2 py-0.5 text-[10px] text-white backdrop-blur">
                        {design.provider}
                      </span>
                    )}
                  </div>
                </div>
              </Link>

              <div className="space-y-2 p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="truncate text-sm font-semibold">
                      {design.theme} · {design.subTheme}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(new Date(design.createdAt ?? Date.now()))}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <button
                      onClick={() => toggleFavorite(design)}
                      disabled={busyId === design.id}
                      className={cn(
                        "rounded-lg p-1.5 transition-colors hover:bg-accent",
                        design.isFavorite ? "text-destructive" : "text-muted-foreground"
                      )}
                      aria-label="Toggle favourite"
                    >
                      {busyId === design.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Heart className={cn("h-4 w-4", design.isFavorite && "fill-current")} />
                      )}
                    </button>
                    <button
                      onClick={() => remove(design)}
                      disabled={busyId === design.id}
                      className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                      aria-label="Delete design"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {design.description && (
                  <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                    {design.description}
                  </p>
                )}

                <div className="flex flex-wrap gap-1.5">
                  <Badge variant="secondary">{design.theme}</Badge>
                  <Badge variant="outline">{design.subTheme}</Badge>
                  {design.lighting && <Badge variant="outline">{design.lighting}</Badge>}
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <Button variant="outline" size="sm" asChild className="gap-1.5">
                    <Link href={remixHref(design)}>
                      <Wand2 className="h-3.5 w-3.5" /> Remix
                    </Link>
                  </Button>
                  <Button variant="ghost" size="sm" asChild className="text-xs text-muted-foreground">
                    <Link href={`/designs/${design.id}`}>Details</Link>
                  </Button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
