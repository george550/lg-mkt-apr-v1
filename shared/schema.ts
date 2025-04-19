import { pgTable, text, serial, integer, boolean, timestamp, doublePrecision, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email"),
  avatarUrl: text("avatar_url"),
  bio: text("bio"),
  isVerified: boolean("is_verified").default(false),
  rating: doublePrecision("rating"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  iconName: text("icon_name"),
  color: text("color"),
  listingCount: integer("listing_count").default(0),
});

export const listings = pgTable("listings", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  price: integer("price").notNull(), // in cents
  sellerId: integer("seller_id").notNull(),
  categoryId: integer("category_id").notNull(),
  demoUrl: text("demo_url"),
  tags: text("tags").array(),
  screenshots: text("screenshots").array(),
  rating: doublePrecision("rating"),
  reviewCount: integer("review_count").default(0),
  isVerified: boolean("is_verified").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const purchases = pgTable("purchases", {
  id: serial("id").primaryKey(),
  listingId: integer("listing_id").notNull(),
  buyerId: integer("buyer_id").notNull(),
  sellerId: integer("seller_id").notNull(),
  amount: integer("amount").notNull(), // in cents
  status: text("status").notNull().default("completed"),
  stripePaymentId: text("stripe_payment_id"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  listingId: integer("listing_id").notNull(),
  userId: integer("user_id").notNull(),
  rating: integer("rating").notNull(),
  comment: text("comment"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const quotes = pgTable("quotes", {
  id: serial("id").primaryKey(),
  listingId: integer("listing_id").notNull(),
  buyerId: integer("buyer_id").notNull(),
  sellerId: integer("seller_id").notNull(),
  requirements: text("requirements").notNull(),
  budget: integer("budget"), // in cents
  status: text("status").notNull().default("pending"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  avatarUrl: true,
  bio: true,
});

export const insertCategorySchema = createInsertSchema(categories).pick({
  name: true,
  slug: true,
  description: true,
  iconName: true,
  color: true,
});

export const insertListingSchema = createInsertSchema(listings).pick({
  title: true,
  description: true,
  price: true,
  sellerId: true,
  categoryId: true,
  demoUrl: true,
  tags: true,
  screenshots: true,
});

export const insertPurchaseSchema = createInsertSchema(purchases).pick({
  listingId: true,
  buyerId: true,
  sellerId: true,
  amount: true,
  stripePaymentId: true,
});

export const insertReviewSchema = createInsertSchema(reviews).pick({
  listingId: true,
  userId: true,
  rating: true,
  comment: true,
});

export const insertQuoteSchema = createInsertSchema(quotes).pick({
  listingId: true,
  buyerId: true,
  sellerId: true,
  requirements: true,
  budget: true,
});

// Export types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Category = typeof categories.$inferSelect;
export type InsertCategory = z.infer<typeof insertCategorySchema>;

export type Listing = typeof listings.$inferSelect;
export type InsertListing = z.infer<typeof insertListingSchema>;

export type Purchase = typeof purchases.$inferSelect;
export type InsertPurchase = z.infer<typeof insertPurchaseSchema>;

export type Review = typeof reviews.$inferSelect;
export type InsertReview = z.infer<typeof insertReviewSchema>;

export type Quote = typeof quotes.$inferSelect;
export type InsertQuote = z.infer<typeof insertQuoteSchema>;

// Note: Relationships defined through foreign keys in table schemas
// For version 0.39.1 of Drizzle ORM, we don't use the relations API
// but can manually join tables in queries as needed
