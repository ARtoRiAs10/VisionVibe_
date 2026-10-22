import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DesignActions } from "@/components/design-actions";
import { requireUser } from "@/lib/auth";
import { getDesign } from "@/lib/db/repository";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function DesignDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser();
  if (!user) redirect("/sign-in");

  const { id } = await params;
  const design = await getDesign(Number(id), user.id);
  if (!design) notFound();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button variant="ghost" asChild className="gap-2">
          <Link href="/designs">
            <ArrowLeft className="h-4 w-4" /> Back to gallery
          </Link>
        </Button>
        <div className="flex flex-wrap gap-2">
          <DesignActions
            designId={design.id}
            isFavorite={design.isFavorite ?? false}
            isPublic={design.isPublic ?? false}
            imageUrl={design.generatedImageUrl}
            title={`visionvibe-${design.theme}-${design.subTheme}`.replace(/\s+/g, "-").toLowerCase()}
          />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="overflow-hidden rounded-2xl border border-border bg-card/60 shadow-sm">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={design.generatedImageUrl}
            alt={`${design.theme} ${design.subTheme}`}
            className="w-full"
          />
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-border bg-card/70 p-5">
            <h1 className="font-display text-2xl font-bold tracking-tight">
              {design.theme} · {design.subTheme}
            </h1>
            <p className="mt-1 text-xs text-muted-foreground">
              Created {formatDate(new Date(design.createdAt ?? Date.now()))}
              {design.provider ? ` · rendered by ${design.provider}` : ""}
            </p>

            <div className="mt-4 flex flex-wrap gap-1.5">
              <Badge variant="secondary">{design.theme}</Badge>
              <Badge variant="outline">{design.subTheme}</Badge>
              <Badge variant="outline">{design.budget}</Badge>
              {design.roomType && <Badge variant="outline">{design.roomType}</Badge>}
              {design.lighting && <Badge variant="outline">{design.lighting}</Badge>}
              {design.aspectRatio && <Badge variant="outline">{design.aspectRatio}</Badge>}
            </div>

            {design.description && (
              <div className="mt-5 border-t border-border pt-4">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  Design story
                </p>
                <p className="mt-2 text-sm leading-relaxed">{design.description}</p>
              </div>
            )}
          </div>

          {design.generatedPrompt && (
            <div className="rounded-2xl border border-border bg-card/70 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                Art direction
              </p>
              <pre className="mt-2 max-h-64 overflow-auto whitespace-pre-wrap text-xs leading-relaxed text-muted-foreground">
                {design.generatedPrompt}
              </pre>
            </div>
          )}

          {design.prompt && (
            <div className="rounded-2xl border border-border bg-card/70 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                Your notes
              </p>
              <p className="mt-2 text-sm leading-relaxed">{design.prompt}</p>
            </div>
          )}

          {design.originalImageUrl && (
            <div className="rounded-2xl border border-border bg-card/70 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                Original room
              </p>
              <div className="mt-2 overflow-hidden rounded-xl border border-border">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={design.originalImageUrl} alt="Original room" className="w-full" />
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
