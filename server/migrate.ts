import { pool } from "./db";

// Bootstrap tables on startup (idempotent) — avoids external migration access.
const DDL = `
CREATE TABLE IF NOT EXISTS users (
  id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
  username text NOT NULL UNIQUE,
  password text NOT NULL
);
CREATE TABLE IF NOT EXISTS bookings (
  id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  phone text NOT NULL,
  email text,
  pet_type text,
  service text,
  branch text,
  preferred_date text,
  notes text,
  status text NOT NULL DEFAULT 'new',
  payment_status text NOT NULL DEFAULT 'unpaid',
  payment_id text,
  invoice_id text,
  invoice_url text,
  amount text,
  created_at text NOT NULL DEFAULT now()::text
);
CREATE TABLE IF NOT EXISTS messages (
  id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  phone text,
  email text,
  subject text,
  body text NOT NULL,
  is_read text NOT NULL DEFAULT 'false',
  created_at text NOT NULL DEFAULT now()::text
);
CREATE TABLE IF NOT EXISTS site_content (
  id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL UNIQUE,
  value_ar text,
  value_en text,
  type text NOT NULL DEFAULT 'text',
  section text,
  updated_at text NOT NULL DEFAULT now()::text
);
CREATE TABLE IF NOT EXISTS media_files (
  id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
  filename text NOT NULL,
  url text NOT NULL,
  mime_type text,
  size text,
  uploaded_at text NOT NULL DEFAULT now()::text
);
CREATE TABLE IF NOT EXISTS admin_users (
  id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
  username text NOT NULL UNIQUE,
  password_hash text NOT NULL,
  role text NOT NULL DEFAULT 'admin',
  created_at text NOT NULL DEFAULT now()::text
);
`;

export async function ensureSchema() {
  if (!process.env.DATABASE_URL) {
    console.log("[db] DATABASE_URL not set — admin/booking APIs will be inactive");
    return false;
  }
  try {
    await pool.query(DDL);
    console.log("[db] schema ensured");
    return true;
  } catch (e: any) {
    console.error("[db] schema bootstrap failed:", e?.message);
    return false;
  }
}
