import { and, desc, eq } from "drizzle-orm";
import { db, isDatabaseEnabled } from "./index";
import { designs, users, type Design, type User } from "./schema";

/**
 * Repository layer. Uses Drizzle + Neon when DATABASE_URL is available and
 * transparently falls back to an in-memory store (demo mode) otherwise, so
 * every feature of the app remains usable without any credentials.
 */

type MemoryStore = { users: User[]; designs: Design[]; nextUserId: number; nextDesignId: number };

const globalForStore = globalThis as unknown as { __visionvibeStore?: MemoryStore };

const store: MemoryStore =
  globalForStore.__visionvibeStore ??
  (globalForStore.__visionvibeStore = {
    users: [],
    designs: [],
    nextUserId: 1,
    nextDesignId: 1,
  });

function now() {
  return new Date();
}

export async function findUserByClerkId(clerkId: string): Promise<User | null> {
  if (isDatabaseEnabled) {
    const user = await db.query.users.findFirst({ where: eq(users.clerkId, clerkId) });
    return user ?? null;
  }
  return store.users.find((u) => u.clerkId === clerkId) ?? null;
}

export async function findUserByEmail(email: string): Promise<User | null> {
  if (isDatabaseEnabled) {
    const user = await db.query.users.findFirst({ where: eq(users.email, email) });
    return user ?? null;
  }
  return store.users.find((u) => u.email === email) ?? null;
}

export async function upsertUser(input: {
  clerkId: string;
  email: string;
  name?: string | null;
  profileImageUrl?: string | null;
}): Promise<User> {
  const existing = await findUserByClerkId(input.clerkId);
  if (existing) {
    if (isDatabaseEnabled) {
      const [updated] = await db
        .update(users)
        .set({ name: input.name ?? existing.name, profileImageUrl: input.profileImageUrl ?? existing.profileImageUrl, updatedAt: now() })
        .where(eq(users.id, existing.id))
        .returning();
      return updated;
    }
    existing.name = input.name ?? existing.name;
    existing.profileImageUrl = input.profileImageUrl ?? existing.profileImageUrl;
    existing.updatedAt = now();
    return existing;
  }

  if (isDatabaseEnabled) {
    const [created] = await db
      .insert(users)
      .values({
        clerkId: input.clerkId,
        email: input.email,
        name: input.name ?? null,
        profileImageUrl: input.profileImageUrl ?? null,
      })
      .returning();
    return created;
  }

  const created: User = {
    id: store.nextUserId++,
    clerkId: input.clerkId,
    email: input.email,
    name: input.name ?? null,
    profileImageUrl: input.profileImageUrl ?? null,
    createdAt: now(),
    updatedAt: now(),
  };
  store.users.push(created);
  return created;
}

export interface CreateDesignInput {
  userId: number;
  originalImageUrl: string;
  generatedImageUrl: string;
  description?: string | null;
  theme: string;
  subTheme: string;
  budget: string;
  prompt?: string | null;
  generatedPrompt?: string | null;
  roomType?: string | null;
  lighting?: string | null;
  aspectRatio?: string | null;
  provider?: string | null;
  model?: string | null;
  isPublic?: boolean;
}

export async function createDesign(input: CreateDesignInput): Promise<Design> {
  if (isDatabaseEnabled) {
    const [created] = await db.insert(designs).values(input).returning();
    return created;
  }

  const created: Design = {
    id: store.nextDesignId++,
    userId: input.userId,
    originalImageUrl: input.originalImageUrl,
    generatedImageUrl: input.generatedImageUrl,
    description: input.description ?? null,
    theme: input.theme,
    subTheme: input.subTheme,
    budget: input.budget,
    prompt: input.prompt ?? null,
    generatedPrompt: input.generatedPrompt ?? null,
    roomType: input.roomType ?? null,
    lighting: input.lighting ?? null,
    aspectRatio: input.aspectRatio ?? null,
    provider: input.provider ?? null,
    model: input.model ?? null,
    isPublic: input.isPublic ?? false,
    isFavorite: false,
    createdAt: now(),
    updatedAt: now(),
  };
  store.designs.push(created);
  return created;
}

export async function listDesigns(userId: number): Promise<Design[]> {
  if (isDatabaseEnabled) {
    return db.query.designs.findMany({
      where: eq(designs.userId, userId),
      orderBy: (d, { desc: orderDesc }) => [orderDesc(d.createdAt)],
    });
  }
  return store.designs
    .filter((d) => d.userId === userId)
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

export async function getDesign(id: number, userId?: number): Promise<Design | null> {
  if (isDatabaseEnabled) {
    const conditions = userId
      ? and(eq(designs.id, id), eq(designs.userId, userId))
      : eq(designs.id, id);
    const design = await db.query.designs.findFirst({ where: conditions });
    return design ?? null;
  }
  const design = store.designs.find((d) => d.id === id);
  if (!design) return null;
  if (userId !== undefined && design.userId !== userId) return null;
  return design;
}

export async function updateDesign(
  id: number,
  values: Partial<Design>,
  userId?: number
): Promise<Design | null> {
  if (isDatabaseEnabled) {
    const conditions = userId
      ? and(eq(designs.id, id), eq(designs.userId, userId))
      : eq(designs.id, id);
    const [updated] = await db
      .update(designs)
      .set({ ...values, updatedAt: now() })
      .where(conditions)
      .returning();
    return updated ?? null;
  }

  const design = await getDesign(id, userId);
  if (!design) return null;
  Object.assign(design, values, { updatedAt: now() });
  return design;
}

export async function deleteDesign(id: number, userId?: number): Promise<boolean> {
  if (isDatabaseEnabled) {
    const conditions = userId
      ? and(eq(designs.id, id), eq(designs.userId, userId))
      : eq(designs.id, id);
    const deleted = await db.delete(designs).where(conditions).returning();
    return deleted.length > 0;
  }
  const index = store.designs.findIndex(
    (d) => d.id === id && (userId === undefined || d.userId === userId)
  );
  if (index === -1) return false;
  store.designs.splice(index, 1);
  return true;
}

export { desc };
