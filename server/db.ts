import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

// DB is optional at boot: public site works without it; admin/booking APIs
// report a clean error until DATABASE_URL is configured.
export const dbEnabled = !!process.env.DATABASE_URL;

export const pool: Pool = new Pool({
  connectionString: process.env.DATABASE_URL || "postgres://localhost:5432/placeholder",
});

export const db = drizzle({ client: pool, schema });
