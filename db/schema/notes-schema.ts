import { pgTable, text, uuid, timestamp, varchar } from "drizzle-orm/pg-core";
import { categoriesTable } from "./categories-schema"; // Import for the foreign key reference

/**
 * Schema for the "notes" table.
 * Each note belongs to a user and a category, and includes title, content, and timestamps.
 * Location: /db/schema/notes-schema.ts
 */
export const notesTable = pgTable("notes", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: varchar("user_id", { length: 255 }).notNull(), // Clerk user ID
  categoryId: uuid("category_id")
    .references(() => categoriesTable.id, { onDelete: "cascade" }) // Added onDelete cascade for referential integrity
    .notNull(),
  title: text("title").notNull(),
  content: text("content").notNull(), // Rich text content, potentially HTML
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()), // Ensures updatedAt is updated on record changes
});

export type InsertNote = typeof notesTable.$inferInsert;
export type SelectNote = typeof notesTable.$inferSelect; 