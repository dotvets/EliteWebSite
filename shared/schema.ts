import { sql } from "drizzle-orm";
import { pgTable, text, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// ===== ONX Admin & Booking System =====

export const bookings = pgTable("bookings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  phone: text("phone").notNull(),
  email: text("email"),
  petType: text("pet_type"),
  service: text("service"),
  serviceId: text("service_id"),
  branch: text("branch"),
  preferredDate: text("preferred_date"),
  notes: text("notes"),
  status: text("status").notNull().default("new"), // new | confirmed | completed | cancelled
  paymentStatus: text("payment_status").notNull().default("unpaid"), // unpaid | pending | paid | failed
  paymentId: text("payment_id"),
  invoiceId: text("invoice_id"),
  invoiceUrl: text("invoice_url"),
  amount: text("amount"),
  createdAt: text("created_at").notNull().default(sql`now()::text`),
});

export const messages = pgTable("messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  phone: text("phone"),
  email: text("email"),
  subject: text("subject"),
  body: text("body").notNull(),
  isRead: text("is_read").notNull().default("false"),
  createdAt: text("created_at").notNull().default(sql`now()::text`),
});

export const siteContent = pgTable("site_content", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  key: text("key").notNull().unique(), // e.g. home.hero.title
  valueAr: text("value_ar"),
  valueEn: text("value_en"),
  type: text("type").notNull().default("text"), // text | image | richtext
  section: text("section"),
  updatedAt: text("updated_at").notNull().default(sql`now()::text`),
});

export const mediaFiles = pgTable("media_files", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  filename: text("filename").notNull(),
  url: text("url").notNull(),
  mimeType: text("mime_type"),
  size: text("size"),
  uploadedAt: text("uploaded_at").notNull().default(sql`now()::text`),
});

export const adminUsers = pgTable("admin_users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: text("role").notNull().default("admin"),
  createdAt: text("created_at").notNull().default(sql`now()::text`),
});

// ===== Services Management (dynamic booking services) =====

export const services = pgTable("services", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  nameAr: text("name_ar").notNull(),
  nameEn: text("name_en").notNull(),
  descriptionAr: text("description_ar"),
  descriptionEn: text("description_en"),
  price: text("price").notNull(),
  currency: text("currency").notNull().default("SAR"),
  isActive: text("is_active").notNull().default("true"),
  createdAt: text("created_at").notNull().default(sql`now()::text`),
  updatedAt: text("updated_at").notNull().default(sql`now()::text`),
});

// ===== Payment records (linked to bookings) =====

export const payments = pgTable("payments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  bookingId: text("booking_id").notNull(),
  invoiceId: text("invoice_id"),
  paymentId: text("payment_id"),
  amount: text("amount"),
  currency: text("currency").default("SAR"),
  status: text("status").notNull().default("pending"), // pending | paid | failed | cancelled | refunded
  method: text("method"),
  createdAt: text("created_at").notNull().default(sql`now()::text`),
  updatedAt: text("updated_at").notNull().default(sql`now()::text`),
});

// ===== CMS collections (admin dashboard upgrade) =====

export const teamMembers = pgTable("team_members", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  nameAr: text("name_ar").notNull(),
  nameEn: text("name_en"),
  positionAr: text("position_ar"),
  positionEn: text("position_en"),
  specialty: text("specialty"),
  bioAr: text("bio_ar"),
  bioEn: text("bio_en"),
  photo: text("photo"),
  experience: text("experience"),
  certifications: text("certifications"),
  languages: text("languages"),
  branch: text("branch"),
  email: text("email"),
  publishAt: text("publish_at"),
  published: text("published").notNull().default("true"),
  featured: text("featured").notNull().default("false"),
  sortOrder: text("sort_order").notNull().default("0"),
  createdAt: text("created_at").notNull().default(sql`now()::text`),
  updatedAt: text("updated_at").notNull().default(sql`now()::text`),
});

export const testimonials = pgTable("testimonials", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  customerAr: text("customer_ar").notNull(),
  customerEn: text("customer_en"),
  textAr: text("text_ar").notNull(),
  textEn: text("text_en"),
  rating: text("rating").default("5"),
  image: text("image"),
  branch: text("branch"),
  publishAt: text("publish_at"),
  published: text("published").notNull().default("true"),
  featured: text("featured").notNull().default("false"),
  sortOrder: text("sort_order").notNull().default("0"),
  createdAt: text("created_at").notNull().default(sql`now()::text`),
  updatedAt: text("updated_at").notNull().default(sql`now()::text`),
});

export const offers = pgTable("offers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  titleAr: text("title_ar").notNull(),
  titleEn: text("title_en"),
  descriptionAr: text("description_ar"),
  descriptionEn: text("description_en"),
  image: text("image"),
  discount: text("discount"),
  startDate: text("start_date"),
  endDate: text("end_date"),
  cta: text("cta"),
  ctaUrl: text("cta_url"),
  publishAt: text("publish_at"),
  published: text("published").notNull().default("true"),
  featured: text("featured").notNull().default("false"),
  createdAt: text("created_at").notNull().default(sql`now()::text`),
  updatedAt: text("updated_at").notNull().default(sql`now()::text`),
});

export const blogPosts = pgTable("blog_posts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  slug: text("slug").notNull().unique(),
  titleAr: text("title_ar").notNull(),
  titleEn: text("title_en"),
  contentAr: text("content_ar"),
  contentEn: text("content_en"),
  coverImage: text("cover_image"),
  author: text("author"),
  category: text("category"),
  tags: text("tags"),
  publishedAt: text("published_at"),
  metaTitleAr: text("meta_title_ar"),
  metaTitleEn: text("meta_title_en"),
  metaDescAr: text("meta_desc_ar"),
  metaDescEn: text("meta_desc_en"),
  published: text("published").notNull().default("false"),
  featured: text("featured").notNull().default("false"),
  createdAt: text("created_at").notNull().default(sql`now()::text`),
  updatedAt: text("updated_at").notNull().default(sql`now()::text`),
});

export const branches = pgTable("branches", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  nameAr: text("name_ar").notNull(),
  nameEn: text("name_en"),
  addressAr: text("address_ar"),
  addressEn: text("address_en"),
  mapsUrl: text("maps_url"),
  phone: text("phone"),
  whatsapp: text("whatsapp"),
  hours: text("hours"),
  emergency: text("emergency").default("false"),
  image: text("image"),
  publishAt: text("publish_at"),
  published: text("published").notNull().default("true"),
  sortOrder: text("sort_order").notNull().default("0"),
  createdAt: text("created_at").notNull().default(sql`now()::text`),
  updatedAt: text("updated_at").notNull().default(sql`now()::text`),
});

export const seoMeta = pgTable("seo_meta", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  path: text("path").notNull().unique(), // e.g. "/", "/about", "/services"
  titleAr: text("title_ar"),
  titleEn: text("title_en"),
  descAr: text("desc_ar"),
  descEn: text("desc_en"),
  ogImage: text("og_image"),
  canonical: text("canonical"),
  robots: text("robots").default("index,follow"),
  updatedAt: text("updated_at").notNull().default(sql`now()::text`),
});

export const activityLog = pgTable("activity_log", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  action: text("action").notNull(), // e.g. "تحديث خدمة", "إضافة عضو فريق"
  entity: text("entity"),
  entityId: text("entity_id"),
  createdAt: text("created_at").notNull().default(sql`now()::text`),
});
