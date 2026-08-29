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
