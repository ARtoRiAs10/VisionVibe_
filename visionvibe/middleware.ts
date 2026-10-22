import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import type { NextMiddleware } from "next/server";
import { hasEnv } from "@/lib/env";

const clerkEnabled = hasEnv("NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY") && hasEnv("CLERK_SECRET_KEY");

const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/webhooks(.*)",
  "/api/generate(.*)",
  "/api/decorate-image(.*)",
  "/api/describe-image(.*)",
  "/api/enhance-prompt(.*)",
  "/api/providers(.*)",
]);

const protectedRoutes = createRouteMatcher([
  "/dashboard(.*)",
  "/designs(.*)",
  "/api/designs(.*)",
]);

/**
 * Without Clerk keys we pass requests straight through (demo mode).
 * `clerkMiddleware()` is only created when the keys exist, because it throws
 * on import when the publishable key is missing.
 */
let handler: NextMiddleware | null = null;

if (clerkEnabled) {
  handler = clerkMiddleware(async (auth, req) => {
    if (isPublicRoute(req)) return;
    if (protectedRoutes(req)) {
      await auth.protect();
    }
  });
}

export default function middleware(request: any, event: any) {
  if (!handler) return undefined;
  return handler(request, event);
}

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
