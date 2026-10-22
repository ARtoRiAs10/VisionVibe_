"use client";

import { useMemo } from "react";
import { Loader2, WandSparkles } from "lucide-react";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Select } from "./ui/select";
import { cn } from "@/lib/utils";
import {
  ASPECT_RATIOS,
  BUDGETS,
  BUDGET_PROFILES,
  LIGHTING_MOODS,
  ROOM_TYPES,
  SUBTHEME_PROFILES,
  THEMES,
  THEME_PROFILES,
} from "@/lib/ai/prompt";
import type { VisionVibeControls } from "@/types";

const THEME_ICONS: Record<string, string> = {
  Celebration: "🎉",
  Lifestyle: "🛋️",
  Fantasy: "🪄",
  Seasonal: "🌿",
  Workspace: "💻",
  Wellness: "🧘",
  Kids: "🧸",
  Rustic: "🏡",
};

export interface DesignControlsProps {
  value: VisionVibeControls;
  onChange: (next: VisionVibeControls) => void;
  onGenerate: () => void;
  onEnhancePrompt?: () => void | Promise<void>;
  enhancing?: boolean;
  disabled?: boolean;
  loading?: boolean;
}

function Chip({
  active,
  disabled,
  onClick,
  children,
  title,
}: {
  active?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
  title?: string;
}) {
  return (
    <button
      type="button"
      title={title}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "rounded-full border px-3 py-1.5 text-xs font-medium transition-all",
        "hover:border-primary/60 hover:bg-primary/5",
        active
          ? "border-primary bg-primary text-primary-foreground shadow-sm"
          : "border-border bg-background/50 text-muted-foreground",
        disabled && "cursor-not-allowed opacity-40 hover:border-border hover:bg-transparent"
      )}
    >
      {children}
    </button>
  );
}

export function DesignControls({
  value,
  onChange,
  onGenerate,
  onEnhancePrompt,
  enhancing = false,
  disabled = false,
  loading = false,
}: DesignControlsProps) {
  const subThemes = useMemo(() => THEMES[value.theme] ?? [], [value.theme]);
  const themeProfile = THEME_PROFILES[value.theme];
  const styleProfile = SUBTHEME_PROFILES[value.subTheme];
  const budgetProfile = BUDGET_PROFILES[value.budget];

  const set = (patch: Partial<VisionVibeControls>) => onChange({ ...value, ...patch });

  const complete = Boolean(value.theme && value.subTheme && value.budget);

  return (
    <div className="space-y-6">
      {/* Theme */}
      <section className="space-y-2.5">
        <Label>1 · Theme</Label>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {Object.keys(THEMES).map((theme) => (
            <button
              key={theme}
              type="button"
              disabled={disabled}
              onClick={() => set({ theme, subTheme: "" })}
              className={cn(
                "flex flex-col items-center gap-1 rounded-xl border px-2 py-2.5 text-xs font-medium transition-all",
                value.theme === theme
                  ? "border-primary bg-primary/10 text-foreground shadow-sm"
                  : "border-border bg-background/40 text-muted-foreground hover:border-primary/50 hover:bg-primary/5"
              )}
            >
              <span className="text-lg leading-none">{THEME_ICONS[theme] ?? "✨"}</span>
              {theme}
            </button>
          ))}
        </div>
        {themeProfile && (
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            {themeProfile.palette.slice(0, 5).map((color) => (
              <span
                key={color}
                className="rounded-full border border-border/60 px-2 py-0.5 text-[10px] text-muted-foreground"
              >
                {color}
              </span>
            ))}
          </div>
        )}
      </section>

      {/* Style */}
      <section className="space-y-2.5">
        <Label>2 · Style</Label>
        {value.theme ? (
          <div className="flex flex-wrap gap-2">
            {subThemes.map((subTheme) => (
              <Chip
                key={subTheme}
                active={value.subTheme === subTheme}
                disabled={disabled}
                onClick={() => set({ subTheme })}
                title={SUBTHEME_PROFILES[subTheme]?.descriptors}
              >
                {subTheme}
              </Chip>
            ))}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">Pick a theme first to unlock its styles.</p>
        )}
        {styleProfile && (
          <p className="pt-1 text-xs leading-relaxed text-muted-foreground">
            {styleProfile.descriptors} · {styleProfile.materials}
          </p>
        )}
      </section>

      {/* Budget */}
      <section className="space-y-2.5">
        <Label>3 · Budget</Label>
        <div className="flex flex-wrap gap-2">
          {BUDGETS.map((budget) => (
            <Chip
              key={budget}
              active={value.budget === budget}
              disabled={disabled}
              onClick={() => set({ budget })}
            >
              {budget}
            </Chip>
          ))}
        </div>
        {budgetProfile && (
          <p className="pt-1 text-xs text-muted-foreground">
            {budgetProfile.level} · {budgetProfile.detail}
          </p>
        )}
      </section>

      {/* Room + lighting + ratio */}
      <section className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Room type</Label>
          <Select
            value={value.roomType ?? ""}
            disabled={disabled}
            onChange={(e) => set({ roomType: e.target.value })}
          >
            <option value="">Detect automatically</option>
            {ROOM_TYPES.map((room) => (
              <option key={room} value={room}>
                {room}
              </option>
            ))}
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Aspect ratio</Label>
          <Select
            value={value.aspectRatio ?? "4:3"}
            disabled={disabled}
            onChange={(e) => set({ aspectRatio: e.target.value })}
          >
            {Object.entries(ASPECT_RATIOS).map(([key, meta]) => (
              <option key={key} value={key}>
                {key} — {meta.label}
              </option>
            ))}
          </Select>
        </div>
      </section>

      <section className="space-y-2.5">
        <Label>Lighting mood</Label>
        <div className="flex flex-wrap gap-2">
          {LIGHTING_MOODS.map((mood) => (
            <Chip
              key={mood}
              active={value.lighting === mood}
              disabled={disabled}
              onClick={() => set({ lighting: mood })}
            >
              {mood}
            </Chip>
          ))}
        </div>
      </section>

      {/* Notes */}
      <section className="space-y-2.5">
        <div className="flex items-center justify-between">
          <Label>Your notes</Label>
          {onEnhancePrompt && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 gap-1.5 px-2 text-xs"
              onClick={onEnhancePrompt}
              disabled={disabled || enhancing}
            >
              {enhancing ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <WandSparkles className="h-3.5 w-3.5" />
              )}
              Enhance with AI
            </Button>
          )}
        </div>
        <Textarea
          value={value.prompt ?? ""}
          disabled={disabled}
          placeholder="e.g. keep the large window, add a reading corner and warm pendant lighting…"
          onChange={(e) => set({ prompt: e.target.value })}
        />
      </section>

      <Button
        onClick={onGenerate}
        disabled={disabled || loading || !complete}
        className="w-full gap-2 py-2.5 text-base font-semibold"
      >
        {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <WandSparkles className="h-5 w-5" />}
        {loading ? "Designing your room…" : "Generate design"}
      </Button>
      {!complete && (
        <p className="-mt-3 text-center text-xs text-muted-foreground">
          Choose a theme, style and budget to continue.
        </p>
      )}
    </div>
  );
}
