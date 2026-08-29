import pg from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "@shared/schema";

// DB is optional at boot: public site works without it; admin/booking APIs
// report a clean error until DATABASE_URL is configured.
export const dbEnabled = !!process.env.DATABASE_URL;

export const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL || "postgres://localhost:5432/placeholder",
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : undefined,
});

export const db = drizzle(pool, { schema });
