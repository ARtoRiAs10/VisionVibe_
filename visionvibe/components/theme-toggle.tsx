"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/theme-provider";
import { cn } from "@/lib/utils";

export function ThemeToggle({ className }: { className?: string }) {
  const { resolvedTheme, toggle } = useTheme();

  return (
    <button
      onClick={toggle}
      aria-label="Toggle colour theme"
      className={cn(
        "relative flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-background/60 text-muted-foreground transition-colors hover:text-foreground",
        className
      )}
    >
      <Sun
        className={cn(
          "h-4 w-4 transition-all",
          resolvedTheme === "dark" ? "rotate-0 scale-100" : "-rotate-90 scale-0"
        )}
      />
      <Moon
        className={cn(
          "absolute h-4 w-4 transition-all",
          resolvedTheme === "dark" ? "-rotate-90 scale-0" : "rotate-0 scale-100"
        )}
      />
    </button>
  );
}
