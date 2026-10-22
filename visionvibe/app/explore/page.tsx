import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SiteHeader } from "@/components/site-header";
import { isClerkEnabled } from "@/lib/auth";
import { listPublicDesigns } from "@/lib/db/public";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function ExplorePage() {
  const designs = await listPublicDesigns();

  return (
    <div className="min-h-screen">
      <SiteHeader clerkEnabled={isClerkEnabled} />

      <main className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <div className="max-w-2xl">
          <Badge className="mb-4 gap-1.5">
            <Sparkles className="h-3 w-3" /> Community gallery
          </Badge>
          <h1 className="font-display text-4xl font-bold tracking-tight">Explore shared designs</h1>
          <p className="mt-3 text-muted-foreground">
            Rooms that other designers published. Open one to see the exact art direction that
            produced it, then remix it in your own studio.
          </p>
        </div>

        {designs.length === 0 ? (
          <div className="mt-12 flex flex-col items-center gap-4 rounded-2xl border border-dashed border-border py-20 text-center">
            <p className="font-semibold">Nothing published yet</p>
            <p className="max-w-sm text-sm text-muted-foreground">
              Generate a design in the studio and press “Publish” to share it with the community.
            </p>
            <Button asChild>
              <Link href="/dashboard">
                Create a design <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        ) : (
          <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {designs.map((design) => (
              <Link
                key={design.id}
                href={`/designs/${design.id}`}
                className="group overflow-hidden rounded-2xl border border-border bg-card/70 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg"
              >
                <div className="aspect-[4/3] overflow-hidden bg-muted">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={design.generatedImageUrl}
                    alt={`${design.theme} ${design.subTheme}`}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="space-y-2 p-4">
                  <h2 className="truncate text-sm font-semibold">
                    {design.theme} · {design.subTheme}
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    {design.roomType ?? "Interior"} · {design.budget} ·{" "}
                    {formatDate(new Date(design.createdAt ?? Date.now()))}
                  </p>
                  {design.description && (
                    <p className="line-clamp-2 text-xs text-muted-foreground">{design.description}</p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
