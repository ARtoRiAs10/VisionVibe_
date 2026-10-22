import { drizzle, type NeonHttpDatabase } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import * as schema from './schema';
import { envValue } from "@/lib/env";

export type Database = NeonHttpDatabase<typeof schema>;

/**
 * The database is optional. When DATABASE_URL is not configured the app
 * runs in "demo mode": everything still works, designs are kept in an
 * in-memory store for the lifetime of the server process.
 */
export const isDatabaseEnabled = !!envValue("DATABASE_URL");

const sql = isDatabaseEnabled ? neon(envValue("DATABASE_URL") as string) : null;

export const db = (sql ? drizzle(sql, { schema }) : null) as Database;
