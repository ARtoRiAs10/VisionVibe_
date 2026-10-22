import Link from "next/link";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { Sparkles } from "@/components/icons";

export function SiteHeader({ clerkEnabled }: { clerkEnabled: boolean }) {
  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3.5 sm:px-6">
        <Link href="/" className="group flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white shadow-lg shadow-violet-500/25">
            <Sparkles className="h-4.5 w-4.5" />
          </span>
          <span className="font-display text-lg font-bold tracking-tight">Vision Vibe</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          <Link
            href="/#how"
            className="rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            How it works
          </Link>
          <Link
            href="/#features"
            className="rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Features
          </Link>
          <Link
            href="/#engines"
            className="rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            AI engines
          </Link>
          <Link
            href="/explore"
            className="rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Explore
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          {clerkEnabled ? (
            <>
              <SignedOut>
                <Button variant="ghost" asChild className="hidden sm:inline-flex">
                  <Link href="/sign-in">Sign in</Link>
                </Button>
                <Button asChild>
                  <Link href="/sign-up">Get started</Link>
                </Button>
              </SignedOut>
              <SignedIn>
                <Button variant="ghost" asChild className="hidden sm:inline-flex">
                  <Link href="/dashboard">Studio</Link>
                </Button>
                <UserButton />
              </SignedIn>
            </>
          ) : (
            <Button asChild>
              <Link href="/dashboard">Open studio</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
