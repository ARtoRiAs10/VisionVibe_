import { auth, currentUser } from "@clerk/nextjs/server";
import { findUserByClerkId, upsertUser } from "./db/repository";
import type { User } from "./db/schema";
import { hasEnv } from "./env";

/**
 * Auth helpers that work in three situations:
 *  1. Clerk configured + signed in  -> real user
 *  2. Clerk configured + signed out -> null
 *  3. Clerk NOT configured           -> demo user (so the app is fully usable)
 */
export const isClerkEnabled = hasEnv("NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY") && hasEnv("CLERK_SECRET_KEY");

export interface SessionUser {
  clerkId: string;
  email: string;
  name: string | null;
  profileImageUrl: string | null;
  isDemo: boolean;
}

export async function getSessionUser(): Promise<SessionUser | null> {
  if (!isClerkEnabled) {
    return {
      clerkId: "demo_user",
      email: "demo@visionvibe.app",
      name: "Demo Designer",
      profileImageUrl: null,
      isDemo: true,
    };
  }

  try {
    const { userId } = await auth();
    if (!userId) return null;

    const clerkUser = await currentUser();
    if (!clerkUser) return null;

    const primaryEmail =
      clerkUser.emailAddresses?.find((e) => e.id === clerkUser.primaryEmailAddressId)?.emailAddress ??
      clerkUser.emailAddresses?.[0]?.emailAddress ??
      `${clerkUser.id}@users.noreply.clerk.dev`;

    return {
      clerkId: clerkUser.id,
      email: primaryEmail,
      name: [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") || clerkUser.username || null,
      profileImageUrl: clerkUser.imageUrl,
      isDemo: false,
    };
  } catch {
    return null;
  }
}

/** Returns the DB user, creating it on first sign-in. */
export async function requireUser(): Promise<User | null> {
  const session = await getSessionUser();
  if (!session) return null;

  const existing = await findUserByClerkId(session.clerkId);
  if (existing) return existing;

  try {
    return await upsertUser({
      clerkId: session.clerkId,
      email: session.email,
      name: session.name,
      profileImageUrl: session.profileImageUrl,
    });
  } catch {
    return existing;
  }
}

/** Backwards compatible helper. */
export async function getCurrentUser() {
  return requireUser();
}
