import { pgTable, text, serial, integer, boolean, json, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema remains unchanged
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

// Pages schema
export const pages = pgTable("pages", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertPageSchema = createInsertSchema(pages).pick({
  title: true,
  slug: true,
  content: true,
});

// Menu items schema
export const menuItems = pgTable("menu_items", {
  id: serial("id").primaryKey(),
  text: text("text").notNull(),
  order: integer("order").notNull(),
  type: text("type").notNull(), // 'internal', 'external', 'iframe'
  internalLink: text("internal_link"), // slug for internal pages
  externalUrl: text("external_url"), // URL for external links
});

export const insertMenuItemSchema = createInsertSchema(menuItems).pick({
  text: true,
  order: true,
  type: true,
  internalLink: true,
  externalUrl: true,
});

// Site settings schema
export const siteSettings = pgTable("site_settings", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  value: json("value").notNull(),
});

export const insertSiteSettingsSchema = createInsertSchema(siteSettings).pick({
  name: true,
  value: true,
});

// Custom buttons schema
export const customButtons = pgTable("custom_buttons", {
  id: serial("id").primaryKey(),
  text: text("text").notNull(),
  type: text("type").notNull(), // 'internal', 'external', 'iframe', 'email'
  url: text("url").notNull(),
  internalLink: text("internal_link"),
  externalUrl: text("external_url"),
  email: text("email"),
  pageSlug: text("page_slug").notNull(),
  style: text("style").default("primary").notNull(),
  size: text("size").default("default").notNull(),
  openInNewTab: boolean("open_in_new_tab").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertCustomButtonSchema = createInsertSchema(customButtons).pick({
  text: true,
  type: true,
  url: true,
  internalLink: true,
  externalUrl: true,
  email: true,
  pageSlug: true,
  style: true,
  size: true,
  openInNewTab: true,
});

// Type definitions
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Page = typeof pages.$inferSelect;
export type InsertPage = z.infer<typeof insertPageSchema>;

export type MenuItem = typeof menuItems.$inferSelect;
export type InsertMenuItem = z.infer<typeof insertMenuItemSchema>;

export type CustomButton = typeof customButtons.$inferSelect;
export type InsertCustomButton = z.infer<typeof insertCustomButtonSchema>;

export type SiteSettings = typeof siteSettings.$inferSelect;
export type InsertSiteSettings = z.infer<typeof insertSiteSettingsSchema>;
