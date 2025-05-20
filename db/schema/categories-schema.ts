import { pgTable, text, uuid, timestamp, varchar } from "drizzle-orm/pg-core";

/**
 * Schema for the "categories" table.
 * Each category belongs to a user and has a name, color, and creation timestamp.
 * Location: /db/schema/categories-schema.ts
 */
export const categoriesTable = pgTable("categories", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: varchar("user_id", { length: 255 }), // Clerk user ID, null for base categories
  name: text("name").notNull(),
  color: varchar("color", { length: 7 }).notNull(), // e.g. "#aabbcc"
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type InsertCategory = typeof categoriesTable.$inferInsert;
export type SelectCategory = typeof categoriesTable.$inferSelect; 