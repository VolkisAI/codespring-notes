import { eq, desc, inArray, SQL, and } from "drizzle-orm";
import { db } from "../db";
import {
  notesTable,
  InsertNote,
  SelectNote,
} from "../schema/notes-schema";

/**
 * Queries for the "notes" table.
 * Provides functions to create, read, update, and delete notes.
 * Location: /db/queries/notes-queries.ts
 */

export const createNote = async (data: InsertNote): Promise<SelectNote> => {
  try {
    const [newNote] = await db.insert(notesTable).values(data).returning();
    return newNote;
  } catch (error) {
    console.error("Error creating note: ", error);
    throw new Error("Failed to create note. Please try again.");
  }
};

export const getNoteById = async (
  id: string
): Promise<SelectNote | undefined> => {
  try {
    // Ensure notesTable is part of the schema in db.ts for db.query.notesTable
    const note = await db.query.notesTable.findFirst({
      where: eq(notesTable.id, id),
      // Example of loading relation if defined in db.ts schema:
      // with: { category: true }
    });
    return note;
  } catch (error) {
    console.error("Error getting note by ID: ", error);
    throw new Error("Failed to retrieve note. Please try again.");
  }
};

export const getNotesByUserId = async (
  userId: string
): Promise<SelectNote[]> => {
  try {
    // Ensure notesTable is part of the schema in db.ts for db.query.notesTable
    const notes = await db.query.notesTable.findMany({
      where: eq(notesTable.userId, userId),
      orderBy: (table, { desc: sortDesc }) => [sortDesc(table.updatedAt)],
      // Example of loading relation:
      // with: { category: true }
    });
    return notes;
  } catch (error) {
    console.error("Error getting notes by user ID: ", error);
    throw new Error("Failed to retrieve notes. Please try again.");
  }
};

export const getNotesByCategoryId = async (
  categoryId: string,
  userId: string
): Promise<SelectNote[]> => {
  try {
    const notes = await db.query.notesTable.findMany({
      where: and(
        eq(notesTable.categoryId, categoryId),
        eq(notesTable.userId, userId)
      ),
      orderBy: (table, { desc: sortDesc }) => [sortDesc(table.updatedAt)],
    });
    return notes;
  } catch (error) {
    console.error("Error getting notes by category ID and user ID: ", error);
    throw new Error("Failed to retrieve notes for category. Please try again.");
  }
};

export const updateNote = async (
  id: string,
  data: Partial<InsertNote>
): Promise<SelectNote> => {
  try {
    const [updatedNote] = await db
      .update(notesTable)
      .set({...data, updatedAt: new Date() }) // Explicitly set updatedAt
      .where(eq(notesTable.id, id))
      .returning();
    return updatedNote;
  } catch (error) {
    console.error("Error updating note: ", error);
    throw new Error("Failed to update note. Please try again.");
  }
};

export const deleteNote = async (id: string): Promise<{ id: string }> => {
  try {
    const [deletedNote] = await db
      .delete(notesTable)
      .where(eq(notesTable.id, id))
      .returning({ id: notesTable.id });
    return deletedNote;
  } catch (error) {
    console.error("Error deleting note: ", error);
    throw new Error("Failed to delete note. Please try again.");
  }
};

// For bulk deletion
export const deleteNotes = async (ids: string[]): Promise<{ count: number }> => {
  if (ids.length === 0) {
    return { count: 0 };
  }
  try {
    const result = await db.delete(notesTable).where(inArray(notesTable.id, ids)).returning();
    return { count: result.length };
  } catch (error) {
    console.error("Error deleting multiple notes: ", error);
    throw new Error("Failed to delete notes. Please try again.");
  }
}; 