import { and, desc, eq } from "drizzle-orm";
import { db, isDatabaseEnabled } from "./index";
import { designs, type Design } from "./schema";

/** Public (shared) designs for the explore page. */
export async function listPublicDesigns(limit = 60): Promise<Design[]> {
  if (isDatabaseEnabled) {
    return db
      .select()
      .from(designs)
      .where(eq(designs.isPublic, true))
      .orderBy(desc(designs.createdAt))
      .limit(limit);
  }
  const { listDesigns } = await import("./repository");
  const all = await listDesigns(-1);
  return all.filter((d) => d.isPublic).slice(0, limit);
}

export async function countDesigns(): Promise<number> {
  if (isDatabaseEnabled) {
    const rows = await db.select({ id: designs.id }).from(designs);
    return rows.length;
  }
  return 0;
}

export { and, eq };
