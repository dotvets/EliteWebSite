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

ALTER TABLE bookings ADD COLUMN IF NOT EXISTS service_id text;
CREATE TABLE IF NOT EXISTS services (
  id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
  name_ar text NOT NULL,
  name_en text NOT NULL,
  description_ar text,
  description_en text,
  price text NOT NULL,
  currency text NOT NULL DEFAULT 'SAR',
  is_active text NOT NULL DEFAULT 'true',
  created_at text NOT NULL DEFAULT now()::text,
  updated_at text NOT NULL DEFAULT now()::text
);
CREATE TABLE IF NOT EXISTS payments (
  id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id text NOT NULL,
  invoice_id text,
  payment_id text,
  amount text,
  currency text DEFAULT 'SAR',
  status text NOT NULL DEFAULT 'pending',
  method text,
  created_at text NOT NULL DEFAULT now()::text,
  updated_at text NOT NULL DEFAULT now()::text
);
CREATE TABLE IF NOT EXISTS team_members (
  id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
  name_ar text NOT NULL, name_en text, position_ar text, position_en text,
  specialty text, bio_ar text, bio_en text, photo text, experience text,
  certifications text, languages text, branch text, email text,
  published text NOT NULL DEFAULT 'true', featured text NOT NULL DEFAULT 'false',
  sort_order text NOT NULL DEFAULT '0',
  created_at text NOT NULL DEFAULT now()::text, updated_at text NOT NULL DEFAULT now()::text
);
CREATE TABLE IF NOT EXISTS testimonials (
  id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_ar text NOT NULL, customer_en text, text_ar text NOT NULL, text_en text,
  rating text DEFAULT '5', image text, branch text,
  published text NOT NULL DEFAULT 'true', featured text NOT NULL DEFAULT 'false',
  sort_order text NOT NULL DEFAULT '0',
  created_at text NOT NULL DEFAULT now()::text, updated_at text NOT NULL DEFAULT now()::text
);
CREATE TABLE IF NOT EXISTS offers (
  id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
  title_ar text NOT NULL, title_en text, description_ar text, description_en text,
  image text, discount text, start_date text, end_date text, cta text, cta_url text,
  published text NOT NULL DEFAULT 'true', featured text NOT NULL DEFAULT 'false',
  created_at text NOT NULL DEFAULT now()::text, updated_at text NOT NULL DEFAULT now()::text
);
CREATE TABLE IF NOT EXISTS blog_posts (
  id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE, title_ar text NOT NULL, title_en text,
  content_ar text, content_en text, cover_image text, author text, category text, tags text,
  published_at text, meta_title_ar text, meta_title_en text, meta_desc_ar text, meta_desc_en text,
  published text NOT NULL DEFAULT 'false', featured text NOT NULL DEFAULT 'false',
  created_at text NOT NULL DEFAULT now()::text, updated_at text NOT NULL DEFAULT now()::text
);
CREATE TABLE IF NOT EXISTS branches (
  id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
  name_ar text NOT NULL, name_en text, address_ar text, address_en text,
  maps_url text, phone text, whatsapp text, hours text, emergency text DEFAULT 'false',
  image text, published text NOT NULL DEFAULT 'true', sort_order text NOT NULL DEFAULT '0',
  created_at text NOT NULL DEFAULT now()::text, updated_at text NOT NULL DEFAULT now()::text
);
CREATE TABLE IF NOT EXISTS seo_meta (
  id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
  path text NOT NULL UNIQUE, title_ar text, title_en text, desc_ar text, desc_en text,
  og_image text, canonical text, robots text DEFAULT 'index,follow',
  updated_at text NOT NULL DEFAULT now()::text
);
CREATE TABLE IF NOT EXISTS activity_log (
  id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
  action text NOT NULL, entity text, entity_id text,
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
