"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Download, Globe, Heart, Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/toast-provider";
import { cn } from "@/lib/utils";

interface DesignActionsProps {
  designId: number;
  isFavorite: boolean;
  isPublic: boolean;
  imageUrl: string;
  title?: string;
}

export function DesignActions({
  designId,
  isFavorite,
  isPublic,
  imageUrl,
  title = "visionvibe-design",
}: DesignActionsProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [busy, setBusy] = useState<string | null>(null);
  const [favorite, setFavorite] = useState(isFavorite);
  const [published, setPublished] = useState(isPublic);

  const patch = async (body: Record<string, unknown>, key: string) => {
    setBusy(key);
    try {
      const res = await fetch(`/api/designs/${designId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("Update failed");
      return true;
    } catch (err) {
      toast(err instanceof Error ? err.message : "Update failed", "error");
      return false;
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      <Button
        variant="outline"
        onClick={async () => {
          const ok = await patch({ isFavorite: !favorite }, "fav");
          if (ok) {
            setFavorite((f) => !f);
            toast(favorite ? "Removed from favourites" : "Added to favourites", "success");
            router.refresh();
          }
        }}
        className={cn("gap-2", favorite && "border-destructive/50 text-destructive")}
      >
        {busy === "fav" ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Heart className={cn("h-4 w-4", favorite && "fill-current")} />
        )}
        {favorite ? "Favourited" : "Favourite"}
      </Button>

      <Button
        variant="outline"
        onClick={async () => {
          const ok = await patch({ isPublic: !published }, "pub");
          if (ok) {
            setPublished((p) => !p);
            toast(published ? "Removed from explore" : "Published to explore", "success");
            router.refresh();
          }
        }}
        className={cn("gap-2", published && "border-primary/60 text-primary")}
      >
        {busy === "pub" ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Globe className="h-4 w-4" />
        )}
        {published ? "Published" : "Publish"}
      </Button>

      <Button variant="outline" asChild className="gap-2">
        <a href={imageUrl} download={`${title}.png`}>
          <Download className="h-4 w-4" /> Download
        </a>
      </Button>

      <Button
        variant="ghost"
        className="gap-2 text-destructive hover:text-destructive"
        disabled={busy === "del"}
        onClick={async () => {
          if (!window.confirm("Delete this design? This cannot be undone.")) return;
          setBusy("del");
          try {
            const res = await fetch(`/api/designs/${designId}`, { method: "DELETE" });
            if (!res.ok) throw new Error("Delete failed");
            toast("Design deleted", "success");
            router.push("/designs");
          } catch (err) {
            toast(err instanceof Error ? err.message : "Delete failed", "error");
            setBusy(null);
          }
        }}
      >
        {busy === "del" ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Trash2 className="h-4 w-4" />
        )}
        Delete
      </Button>
    </div>
  );
}
