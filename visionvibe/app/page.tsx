import Link from "next/link";
import {
  ArrowRight,
  Brush,
  Coins,
  GalleryHorizontalEnd,
  Layers,
  Palette,
  Rocket,
  ScanSearch,
  Sparkles,
  Wand2,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SiteHeader } from "@/components/site-header";
import { isClerkEnabled } from "@/lib/auth";
import { providerStatus } from "@/lib/ai/config";
import { ASPECT_RATIOS, BUDGETS, LIGHTING_MOODS, ROOM_TYPES, THEMES } from "@/lib/ai/prompt";

const STEPS = [
  {
    icon: ScanSearch,
    title: "Drop in your room",
    body: "Photograph an empty room — or skip it. Vision Vibe detects the space, light and architecture.",
  },
  {
    icon: Palette,
    title: "Direct the look",
    body: "Pick a theme, style, budget, room type and lighting mood. Every choice maps to real design language.",
  },
  {
    icon: Wand2,
    title: "Let AI art-direct it",
    body: "Your brief is expanded into a professional prompt and rendered by the best free image engine available.",
  },
];

const FEATURES = [
  {
    icon: Rocket,
    title: "Free AI routing",
    body: "Requests are routed to Pollinations, Gemini, Hugging Face or Stability — whichever is available, with automatic failover.",
  },
  {
    icon: ScanSearch,
    title: "True photo matching",
    body: "With a Gemini key the AI edits your real photo, keeping windows, walls and perspective intact for a genuine before/after.",
  },
  {
    icon: Layers,
    title: "Art-directed prompts",
    body: "Themes, styles and budgets expand into palettes, materials, furniture plans and camera language — not keyword soup.",
  },
  {
    icon: Coins,
    title: "Budget aware",
    body: "From a $500 refresh to an unlimited dream home, the materials and density of the room change with the budget.",
  },
  {
    icon: GalleryHorizontalEnd,
    title: "Design gallery",
    body: "Every render is stored with its prompt, provider and story so you can revisit, favourite and re-roll variations.",
  },
  {
    icon: Zap,
    title: "Instant variations",
    body: "One click re-rolls the seed for a new arrangement of the same brief, instantly.",
  },
];

export default function Home() {
  const providers = providerStatus();
  const engineList = [
    {
      name: "Pollinations",
      detail: "Free, key-less image + text engine",
      active: providers.pollinations.available,
      free: true,
    },
    {
      name: "AI Horde",
      detail: "Free, key-less image-to-image fallback",
      active: providers.aihorde.available,
      free: true,
    },
    {
      name: "Google Gemini",
      detail: "Photo-accurate editing + vision analysis",
      active: providers.gemini.available,
      free: true,
    },
    {
      name: "OpenRouter",
      detail: "Free text & vision copywriting",
      active: providers.openrouter.available,
      free: true,
    },
    {
      name: "Hugging Face",
      detail: "FLUX text-to-image fallback",
      active: providers.huggingface.available,
      free: true,
    },
  ];

  return (
    <div className="min-h-screen">
      <SiteHeader clerkEnabled={isClerkEnabled} />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 pt-16 pb-20 sm:px-6 sm:pt-24">
          <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="animate-fade-up">
              <Badge className="mb-5 gap-1.5">
                <Sparkles className="h-3 w-3" /> Free AI image routing · no credits
              </Badge>
              <h1 className="font-display text-4xl leading-[1.05] font-bold tracking-tight sm:text-6xl">
                Turn an empty room into a
                <span className="text-gradient"> designed interior</span>
              </h1>
              <p className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
                Vision Vibe turns your selections — theme, style, budget, room type and lighting —
                into a professional art-direction brief and renders it with the best free AI image
                engine you have access to.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Button size="lg" asChild className="gap-2">
                  <Link href="/dashboard">
                    Start designing <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="/designs">Browse gallery</Link>
                </Button>
              </div>

              <dl className="mt-10 grid max-w-lg grid-cols-3 gap-4">
                {[
                  { k: `${Object.keys(THEMES).length}`, v: "design themes" },
                  { k: `${Object.values(THEMES).flat().length}`, v: "art-directed styles" },
                  { k: `${ROOM_TYPES.length * LIGHTING_MOODS.length}`, v: "room & light combos" },
                ].map((stat) => (
                  <div key={stat.v} className="rounded-2xl border border-border bg-card/60 p-4">
                    <dt className="font-display text-2xl font-bold">{stat.k}</dt>
                    <dd className="mt-0.5 text-xs text-muted-foreground">{stat.v}</dd>
                  </div>
                ))}
              </dl>
            </div>

            {/* Visual */}
            <div className="relative animate-fade-up">
              <div className="absolute -inset-6 rounded-[2.5rem] bg-gradient-to-br from-violet-500/20 via-fuchsia-500/10 to-transparent blur-2xl" />
              <div className="relative overflow-hidden rounded-3xl border border-border bg-card/70 p-3 shadow-2xl backdrop-blur">
                <div className="rounded-2xl border border-border/70 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
                  <div className="flex items-center gap-2 text-xs text-white/70">
                    <span className="h-2 w-2 rounded-full bg-emerald-400" />
                    rendering · lifestyle / modern
                  </div>
                  <div className="mt-5 space-y-3">
                    {["Theme", "Style", "Budget", "Room", "Light"].map((label, i) => (
                      <div key={label} className="flex items-center gap-3">
                        <span className="w-14 text-[11px] uppercase tracking-wider text-white/40">
                          {label}
                        </span>
                        <span className="h-2 flex-1 overflow-hidden rounded-full bg-white/10">
                          <span
                            className="block h-full rounded-full bg-gradient-to-r from-violet-400 to-fuchsia-400"
                            style={{ width: `${55 + i * 9}%` }}
                          />
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 flex items-center gap-3 rounded-2xl bg-white/5 p-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/20 text-violet-300">
                      <Brush className="h-5 w-5" />
                    </span>
                    <p className="text-xs leading-relaxed text-white/70">
                      "Photorealistic interior of a living room, modern style, sage &amp; warm
                      oak palette, natural daylight…"
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="border-y border-border/70 bg-card/40">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
          <SectionHeading
            eyebrow="How it works"
            title="Three steps from empty room to designed space"
          />
          <div className="grid gap-6 md:grid-cols-3">
            {STEPS.map((step, index) => (
              <div
                key={step.title}
                className="group relative rounded-2xl border border-border bg-card/70 p-6 transition-all hover:-translate-y-1 hover:shadow-xl"
              >
                <span className="absolute top-5 right-5 font-display text-4xl font-bold text-muted-foreground/15">
                  0{index + 1}
                </span>
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/12 text-primary">
                  <step.icon className="h-5 w-5" />
                </span>
                <h3 className="mt-4 font-semibold">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <SectionHeading
          eyebrow="Features"
          title="A complete design studio, not a one-click toy"
        />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature) => (
            <div
              key={feature.title}
              className="rounded-2xl border border-border bg-card/60 p-5 transition-colors hover:border-primary/40"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <feature.icon className="h-5 w-5" />
              </span>
              <h3 className="mt-3.5 font-semibold">{feature.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{feature.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Engines */}
      <section id="engines" className="border-y border-border/70 bg-card/40">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
          <SectionHeading
            eyebrow="AI routing"
            title="One brief, many engines — the router picks the best one"
          />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {engineList.map((engine) => (
              <div
                key={engine.name}
                className="rounded-2xl border border-border bg-card/70 p-5"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">{engine.name}</h3>
                  <span
                    className={`h-2.5 w-2.5 rounded-full ${
                      engine.active ? "bg-emerald-500" : "bg-amber-500"
                    }`}
                  />
                </div>
                <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                  {engine.detail}
                </p>
                <Badge variant={engine.active ? "success" : "warning"} className="mt-3">
                  {engine.active ? "Ready" : "Add API key to enable"}
                </Badge>
              </div>
            ))}
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-border bg-card/60 p-5 text-sm">
              <p className="font-semibold">Works with zero configuration</p>
              <p className="mt-1.5 leading-relaxed text-muted-foreground">
                Pollinations needs no key at all, so the studio renders images the moment you press
                generate. Add optional keys to unlock photo-accurate editing and richer copy.
              </p>
            </div>
            <div className="rounded-2xl border border-border bg-card/60 p-5 text-sm">
              <p className="font-semibold">Every selection changes the picture</p>
              <p className="mt-1.5 leading-relaxed text-muted-foreground">
                {BUDGETS.length} budget tiers, {LIGHTING_MOODS.length} lighting moods,{" "}
                {Object.keys(ASPECT_RATIOS).length} aspect ratios and{" "}
                {ROOM_TYPES.length} room types are translated into concrete art direction.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-4xl px-4 py-24 text-center sm:px-6">
        <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
          Ready to design your room?
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
          Upload a photo, pick a mood, and let the router art-direct and render it. Free, fast and
          saved to your gallery.
        </p>
        <Button size="lg" asChild className="mt-8 gap-2">
          <Link href="/dashboard">
            Open the studio <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </section>

      <footer className="border-t border-border/70 py-8 text-center text-xs text-muted-foreground">
        Vision Vibe · AI interior design studio · built with Next.js, Drizzle & free AI engines
      </footer>
    </div>
  );
}

function SectionHeading({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div className="mb-10 max-w-2xl">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">{eyebrow}</p>
      <h2 className="mt-2 font-display text-3xl font-bold tracking-tight sm:text-4xl">{title}</h2>
    </div>
  );
}
