import Link from "next/link";
import { redirect } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { Sparkles } from "@/components/icons";
import { getSessionUser, isClerkEnabled } from "@/lib/auth";

const NAV = [
  { href: "/dashboard", label: "Studio" },
  { href: "/designs", label: "Gallery" },
  { href: "/explore", label: "Explore" },
];

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getSessionUser();

  if (!session) {
    redirect("/sign-in");
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 border-b border-border/70 bg-background/75 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[92rem] items-center justify-between gap-4 px-4 py-3.5 sm:px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white shadow-lg shadow-violet-500/25">
              <Sparkles className="h-4 w-4" />
            </span>
            <span className="font-display text-lg font-bold tracking-tight">Vision Vibe</span>
          </Link>

          <nav className="flex items-center gap-1 rounded-xl border border-border bg-card/60 p-1">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-lg px-3.5 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            {session.isDemo && (
              <span className="hidden rounded-full border border-amber-500/40 bg-amber-500/10 px-3 py-1 text-xs text-amber-600 dark:text-amber-400 sm:inline">
                Demo mode
              </span>
            )}
            <ThemeToggle />
            {isClerkEnabled ? (
              <UserButton />
            ) : (
              <Button variant="outline" size="sm" asChild>
                <Link href="/">Home</Link>
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[92rem] flex-1 px-4 py-8 sm:px-6">{children}</main>

      <footer className="border-t border-border/70 py-6 text-center text-xs text-muted-foreground">
        Vision Vibe · free AI engines with automatic provider routing
      </footer>
    </div>
  );
}
