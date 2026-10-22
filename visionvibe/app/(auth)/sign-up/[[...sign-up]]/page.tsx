import Link from "next/link";
import { SignUp } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Sparkles } from "@/components/icons";
import { isClerkEnabled } from "@/lib/auth";

export default function SignUpPage() {
  if (!isClerkEnabled) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-5 p-6 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white shadow-lg shadow-violet-500/25">
          <Sparkles className="h-6 w-6" />
        </span>
        <h1 className="font-display text-2xl font-bold">Auth is not configured</h1>
        <p className="max-w-md text-sm text-muted-foreground">
          Add your Clerk keys to enable sign-up. Vision Vibe works without them in demo mode.
        </p>
        <Button asChild>
          <Link href="/dashboard">Continue to the studio</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <SignUp />
    </div>
  );
}
