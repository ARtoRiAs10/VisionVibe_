import { Suspense } from "react";
import { Studio } from "@/components/studio";
import { Badge } from "@/components/ui/badge";
import { providerStatus } from "@/lib/ai/config";

export default function DashboardPage() {
  const providers = providerStatus();
  const active = Object.entries(providers)
    .filter(([, value]) => value.available)
    .map(([name]) => name);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">Design studio</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Upload a room, direct the look, and let the AI router render it.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs text-muted-foreground">Active engines:</span>
          {active.map((name) => (
            <Badge key={name} variant="success" className="capitalize">
              {name}
            </Badge>
          ))}
        </div>
      </div>

      <Suspense fallback={<div className="h-[600px] animate-pulse rounded-2xl border border-border bg-card/40" />}>
        <Studio />
      </Suspense>
    </div>
  );
}
