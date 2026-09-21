import { pool } from "./db";
import { resolveDigitailConfig, digitailConnectionId } from "./digitailConfig";

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
CREATE TABLE IF NOT EXISTS digitail_connections (
  id varchar PRIMARY KEY,
  access_token_enc text NOT NULL,
  refresh_token_enc text NOT NULL,
  access_token_expires_at timestamptz NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS activity_log (
  id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
  action text NOT NULL, entity text, entity_id text,
  created_at text NOT NULL DEFAULT now()::text
);
-- Group Booking Hub Phase 0 (master document Part 3.1 + Addendum A2):
-- multi-connection storage keyed "{env}:{connection_scope}".
-- connection_scope is NOT a brand — group-level connections are supported.
CREATE TABLE IF NOT EXISTS digitail_connections_v2 (
  id varchar PRIMARY KEY,
  env varchar NOT NULL,
  connection_scope varchar NOT NULL,
  access_token_enc text NOT NULL,
  refresh_token_enc text NOT NULL,
  access_token_expires_at timestamptz NOT NULL,
  scopes text,
  updated_at timestamptz NOT NULL DEFAULT now()
);
-- Phase 1 (master document Part 3.2 + 5.2): brand/clinic config + read cache.
-- Additive only; every table carries created_at.
CREATE TABLE IF NOT EXISTS hub_brands (
  brand varchar PRIMARY KEY,
  display_name_ar text NOT NULL,
  display_name_en text NOT NULL,
  theme_json jsonb NOT NULL DEFAULT '{}',
  default_locale varchar NOT NULL DEFAULT 'ar',
  booking_enabled boolean NOT NULL DEFAULT false,
  messaging_enabled boolean NOT NULL DEFAULT false,
  payment_mode varchar NOT NULL DEFAULT 'off',
  config_json jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS hub_clinics (
  id varchar PRIMARY KEY,              -- "{brand}:{digitailClinicId}"
  brand varchar NOT NULL REFERENCES hub_brands(brand),
  digitail_clinic_id integer NOT NULL,
  name_ar text NOT NULL,
  name_en text NOT NULL,
  booking_enabled boolean NOT NULL DEFAULT false,
  payment_mode varchar,
  deposit_amount_halalas integer,
  slot_hold_minutes integer NOT NULL DEFAULT 15,
  timezone varchar NOT NULL DEFAULT 'Asia/Riyadh',
  config_json jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS hub_read_cache (
  cache_key varchar PRIMARY KEY,
  payload_json jsonb NOT NULL,
  fetched_at timestamptz NOT NULL DEFAULT now(),
  ttl_seconds integer NOT NULL DEFAULT 3600,
  created_at timestamptz NOT NULL DEFAULT now()
);
`;

export async function ensureSchema() {
  if (!process.env.DATABASE_URL) {
    console.log("[db] DATABASE_URL not set — admin/booking APIs will be inactive");
    return false;
  }
  try {
    await pool.query(DDL);
    for (const t of ["team_members", "testimonials", "offers", "blog_posts", "branches"]) {
      await pool.query(`ALTER TABLE ${t} ADD COLUMN IF NOT EXISTS publish_at text`);
    }
    // Phase 0: migrate the legacy single 'default' Digitail connection into
    // digitail_connections_v2 under the current "{env}:{scope}" identity.
    // Tokens stay encrypted exactly as they were — copied byte-for-byte, never re-encrypted.
    // The legacy table is intentionally KEPT (Addendum A12: additive-first; removal only
    // in a later dedicated migration after explicit approval).
    try {
      const id = digitailConnectionId(resolveDigitailConfig());
      await pool.query(
        `INSERT INTO digitail_connections_v2 (id, env, connection_scope, access_token_enc, refresh_token_enc, access_token_expires_at, updated_at)
         SELECT $1, $2, $3, access_token_enc, refresh_token_enc, access_token_expires_at, updated_at
         FROM digitail_connections WHERE id = 'default'
         ON CONFLICT (id) DO NOTHING`,
        [id, id.split(":")[0], id.split(":").slice(1).join(":")],
      );
    } catch (e: any) {
      console.error("[db] digitail_connections_v2 migration skipped:", e?.message);
    }
    // Phase 1: seed brand config (idempotent). booking_enabled stays FALSE —
    // the hub ships dark until UX sign-off (master document Part 5.2).
    // Contact fallbacks live in config_json, never hardcoded in the widget.
    try {
      await pool.query(
        `INSERT INTO hub_brands (brand, display_name_ar, display_name_en, config_json) VALUES
           ('elite',   'عيادات النخبة البيطرية', 'Elite Vet Clinics', '{"whatsapp":"966920011626"}'),
           ('drpaws',  'عيادات دكتور باوز',      'Dr Paws Clinics',   '{}'),
           ('vetsvan', 'فيتس فان',               'Vetsvan',           '{}')
         ON CONFLICT (brand) DO NOTHING`,
      );
    } catch (e: any) {
      console.error("[db] hub_brands seed skipped:", e?.message);
    }
    console.log("[db] schema ensured");
    return true;
  } catch (e: any) {
    console.error("[db] schema bootstrap failed:", e?.message);
    return false;
  }
}
