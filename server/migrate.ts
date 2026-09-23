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
-- Phase 2 (master document Part 3.3): booking write path + OTP identity.
-- Dependency order: hub_customers before hub_pets/hub_bookings.
CREATE TABLE IF NOT EXISTS hub_customers (
  id varchar PRIMARY KEY,              -- uuid — THE identity; stable even if phone changes
  phone varchar NOT NULL UNIQUE,       -- E.164 verified CONTACT field, not identity
  name text,
  locale varchar NOT NULL DEFAULT 'ar',
  pdpl_consent_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS hub_pets (
  id varchar PRIMARY KEY,
  customer_id varchar NOT NULL REFERENCES hub_customers(id),
  brand varchar NOT NULL,
  digitail_patient_id varchar,
  digitail_parent_id varchar,
  name text NOT NULL,
  species varchar NOT NULL,
  breed text,
  sex varchar,
  date_of_birth date,
  weight_kg numeric,
  microchip_number varchar,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS hub_bookings (
  id varchar PRIMARY KEY,
  brand varchar NOT NULL,
  clinic_id varchar NOT NULL REFERENCES hub_clinics(id),
  digitail_appointment_id varchar,
  status varchar NOT NULL,             -- held | pending_payment | confirmed | failed | cancelled | expired | completed | no_show
  idempotency_key varchar NOT NULL UNIQUE,
  customer_id varchar REFERENCES hub_customers(id),
  customer_name text NOT NULL,
  customer_phone varchar NOT NULL,
  customer_phone_verified boolean NOT NULL DEFAULT false,
  pet_id varchar REFERENCES hub_pets(id),
  pet_snapshot_json jsonb NOT NULL,
  service_json jsonb NOT NULL,
  hold_expires_at timestamptz,
  payment_id varchar,
  payment_mode_effective varchar,  -- G3: resolved at hold time (static or dynamic rule)
  payment_mode_override varchar,   -- G3: admin override — always wins, audit-logged
  locale varchar NOT NULL DEFAULT 'ar',
  source_json jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS hub_bookings_status_idx ON hub_bookings (status, hold_expires_at);
CREATE INDEX IF NOT EXISTS hub_bookings_phone_idx ON hub_bookings (customer_phone, created_at);
CREATE TABLE IF NOT EXISTS hub_payments (
  id varchar PRIMARY KEY,
  booking_id varchar NOT NULL REFERENCES hub_bookings(id),
  provider varchar NOT NULL DEFAULT 'myfatoorah',
  provider_invoice_id varchar,
  amount_halalas integer NOT NULL,
  currency varchar NOT NULL DEFAULT 'SAR',
  status varchar NOT NULL,
  idempotency_key varchar NOT NULL UNIQUE,
  raw_webhook_json jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS hub_notifications (
  id varchar PRIMARY KEY,
  booking_id varchar REFERENCES hub_bookings(id),
  kind varchar NOT NULL,
  channel varchar NOT NULL,
  to_phone varchar NOT NULL,
  template_key varchar NOT NULL,
  payload_json jsonb NOT NULL DEFAULT '{}',
  status varchar NOT NULL,
  provider_message_id varchar,
  attempt_count integer NOT NULL DEFAULT 0,
  scheduled_at timestamptz NOT NULL,
  sent_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS hub_notifications_due_idx ON hub_notifications (status, scheduled_at);
CREATE TABLE IF NOT EXISTS hub_audit_log (
  id varchar PRIMARY KEY,
  actor varchar NOT NULL,
  action varchar NOT NULL,
  entity varchar NOT NULL,
  entity_id varchar NOT NULL,
  meta_json jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS hub_audit_entity_idx ON hub_audit_log (entity, entity_id);
CREATE TABLE IF NOT EXISTS hub_otp_codes (
  id varchar PRIMARY KEY,
  phone varchar NOT NULL,
  code_hash varchar NOT NULL,
  expires_at timestamptz NOT NULL,
  attempts integer NOT NULL DEFAULT 0,
  consumed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS hub_otp_phone_idx ON hub_otp_codes (phone, created_at);
-- Phase 4 / G4: emergency triage path. No phone field by design (PDPL minimization).
CREATE TABLE IF NOT EXISTS hub_emergency_requests (
  id varchar PRIMARY KEY,
  brand varchar NOT NULL,
  species varchar NOT NULL,
  symptoms text NOT NULL,
  eta varchar NOT NULL,
  locale varchar NOT NULL DEFAULT 'ar',
  channel varchar,
  status varchar NOT NULL,
  source_json jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS hub_emergency_requests_brand_idx ON hub_emergency_requests (brand, created_at);
-- Integrations Manager V1 (approved design 2026-09-22): additive only.
-- Category A config only — Category B secrets are NEVER stored here (references only).
CREATE TABLE IF NOT EXISTS hub_integrations_configs (
  id varchar PRIMARY KEY,
  provider_key varchar NOT NULL,
  scope_type varchar NOT NULL,           -- global | brand | clinic | connection
  scope_id varchar NOT NULL,
  environment varchar NOT NULL,          -- test | sandbox | production
  config_json jsonb NOT NULL DEFAULT '{}',
  secret_refs_json jsonb NOT NULL DEFAULT '{}',  -- env names only, never values
  enabled boolean NOT NULL DEFAULT false,
  blocked_reason varchar,
  created_by varchar,
  updated_by varchar,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (provider_key, scope_type, scope_id, environment)
);
-- Health metadata + timestamps only (never webhook/response payloads).
CREATE TABLE IF NOT EXISTS hub_integrations_health (
  provider_key varchar NOT NULL,
  scope_id varchar NOT NULL DEFAULT '*',
  last_test_at timestamptz,
  last_test_result varchar,
  last_success_at timestamptz,
  last_failure_at timestamptz,
  last_error_class varchar,
  consecutive_failures integer NOT NULL DEFAULT 0,
  circuit_opened_at timestamptz,
  webhook_last_event_at timestamptz,
  PRIMARY KEY (provider_key, scope_id)
);
CREATE TABLE IF NOT EXISTS hub_integrations_events (
  id varchar PRIMARY KEY,
  actor varchar NOT NULL,
  provider_key varchar NOT NULL,
  scope_id varchar,
  action varchar NOT NULL,
  meta_json jsonb NOT NULL DEFAULT '{}',
  result varchar NOT NULL DEFAULT 'ok',
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS hub_integrations_events_provider_idx ON hub_integrations_events (provider_key, created_at);
CREATE TABLE IF NOT EXISTS hub_messaging_routes (
  id varchar PRIMARY KEY,
  brand_id varchar NOT NULL,
  purpose varchar NOT NULL,              -- otp | booking_confirmation | reminder | payment_notification | emergency | fallback
  provider_key varchar NOT NULL,
  environment varchar NOT NULL,
  updated_by varchar,
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (brand_id, purpose, environment)
);

-- Slot-level concurrency guard for the confirm pipeline (2026-09-23).
-- One row per (clinic, service, slot start). Claims are atomic
-- INSERT .. ON CONFLICT and self-expire via expires_at (TTL) so a crashed
-- confirm can never deadlock the slot — the next attempt takes over an
-- expired claim. Claims are released explicitly after the pipeline finishes.
CREATE TABLE IF NOT EXISTS hub_slot_claims (
  clinic_id varchar NOT NULL,
  service_id varchar NOT NULL,
  slot_start timestamptz NOT NULL,
  booking_id varchar NOT NULL,
  expires_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (clinic_id, service_id, slot_start)
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
    // Phase 4+ / G3: dynamic deposit columns (additive, idempotent).
    await pool.query(`ALTER TABLE hub_bookings ADD COLUMN IF NOT EXISTS payment_mode_effective varchar`);
    await pool.query(`ALTER TABLE hub_bookings ADD COLUMN IF NOT EXISTS payment_mode_override varchar`);
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
