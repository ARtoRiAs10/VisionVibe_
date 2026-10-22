import { redirect } from "next/navigation";
import { DesignGallery } from "@/components/design-gallery";
import { Badge } from "@/components/ui/badge";
import { requireUser } from "@/lib/auth";
import { listDesigns } from "@/lib/db/repository";

export const dynamic = "force-dynamic";

export default async function DesignsPage() {
  const user = await requireUser();
  if (!user) redirect("/sign-in");

  const designs = await listDesigns(user.id);
  const favourites = designs.filter((d) => d.isFavorite).length;
  const themes = new Set(designs.map((d) => d.theme)).size;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">Your gallery</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Every render, prompt and design story — saved automatically.
          </p>
        </div>
        <div className="flex gap-2">
          <Badge variant="secondary">{designs.length} designs</Badge>
          <Badge variant="secondary">{themes} themes</Badge>
          <Badge variant="secondary">{favourites} favourites</Badge>
        </div>
      </div>

      <DesignGallery designs={designs as any} />
    </div>
  );
}
