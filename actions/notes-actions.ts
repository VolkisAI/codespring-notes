"use server";

import {
  createNote,
  deleteNote,
  deleteNotes, // For bulk delete
  getNoteById,
  getNotesByCategoryId,
  getNotesByUserId,
  updateNote,
} from "@/db/queries/notes-queries";
import type { InsertNote, SelectNote } from "@/db/schema/notes-schema";
import type { ActionResult } from "@/types";
import { revalidatePath } from "next/cache";

/**
 * Server actions for managing notes.
 * These actions interact with the database queries and handle cache revalidation.
 * Location: /actions/notes-actions.ts
 */

export async function createNoteAction(
  data: InsertNote
): Promise<ActionResult<SelectNote>> {
  try {
    const newNote = await createNote(data);
    revalidatePath("/notes"); // Revalidate the main notes listing page
    if (data.categoryId) {
      revalidatePath(`/notes?categoryId=${data.categoryId}`); // If filtering by category
    }
    return {
      isSuccess: true,
      message: "Note created successfully",
      data: newNote,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error creating note";
    console.error("createNoteAction Error: ", errorMessage);
    return { isSuccess: false, message: errorMessage };
  }
}

export async function getNoteByIdAction(
  id: string
): Promise<ActionResult<SelectNote>> {
  try {
    const note = await getNoteById(id);
    if (!note) {
      return { isSuccess: false, message: "Note not found" };
    }
    return { isSuccess: true, message: "Note retrieved successfully", data: note };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error retrieving note";
    console.error("getNoteByIdAction Error: ", errorMessage);
    return { isSuccess: false, message: errorMessage };
  }
}

export async function getNotesByUserIdAction(
  userId: string
): Promise<ActionResult<SelectNote[]>> {
  try {
    const notes = await getNotesByUserId(userId);
    return {
      isSuccess: true,
      message: "Notes retrieved successfully",
      data: notes,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error retrieving notes";
    console.error("getNotesByUserIdAction Error: ", errorMessage);
    return { isSuccess: false, message: errorMessage };
  }
}

export async function getNotesByCategoryIdAction(
  categoryId: string,
  userId: string
): Promise<ActionResult<SelectNote[]>> {
  try {
    if (!userId) {
      console.error("getNotesByCategoryIdAction Error: userId was not provided.");
      return { isSuccess: false, message: "User identification is required to fetch notes by category." };
    }
    const notes = await getNotesByCategoryId(categoryId, userId);
    return {
      isSuccess: true,
      message: "Notes for category retrieved successfully",
      data: notes,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error retrieving notes for category";
    console.error("getNotesByCategoryIdAction Error: ", errorMessage);
    return { isSuccess: false, message: errorMessage };
  }
}

export async function updateNoteAction(
  id: string,
  data: Partial<InsertNote>
): Promise<ActionResult<SelectNote>> {
  try {
    const updatedNote = await updateNote(id, data);
    revalidatePath("/notes"); // Revalidate main listing
    revalidatePath(`/notes/${id}`); // Revalidate specific note page
    if (updatedNote.categoryId) {
      revalidatePath(`/notes?categoryId=${updatedNote.categoryId}`);
    }
    return {
      isSuccess: true,
      message: "Note updated successfully",
      data: updatedNote,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error updating note";
    console.error("updateNoteAction Error: ", errorMessage);
    return { isSuccess: false, message: errorMessage };
  }
}

export async function deleteNoteAction(
  id: string
): Promise<ActionResult<{ id: string }>> {
  try {
    const deletedNoteInfo = await deleteNote(id);
    revalidatePath("/notes"); // Revalidate main listing
    // Potentially revalidate category view if note was listed there
    return {
      isSuccess: true,
      message: "Note deleted successfully",
      data: deletedNoteInfo,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error deleting note";
    console.error("deleteNoteAction Error: ", errorMessage);
    return { isSuccess: false, message: errorMessage };
  }
}

export async function deleteNotesAction(
  ids: string[]
): Promise<ActionResult<{ count: number }>> {
  try {
    const result = await deleteNotes(ids);
    revalidatePath("/notes");
    // Could also revalidate specific category paths if known
    return {
      isSuccess: true,
      message: `${result.count} note(s) deleted successfully`,
      data: result,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error deleting multiple notes";
    console.error("deleteNotesAction Error: ", errorMessage);
    return { isSuccess: false, message: errorMessage };
  }
}

export async function createQuickNoteAction(
  categoryId: string,
  userId: string,
  title?: string // Optional title, can default in the action
): Promise<ActionResult<SelectNote>> {
  if (!userId) {
    console.error("createQuickNoteAction Error: User not authenticated.");
    return { isSuccess: false, message: "User not authenticated." };
  }
  if (!categoryId) {
    console.error("createQuickNoteAction Error: Category ID is required.");
    return { isSuccess: false, message: "Category ID is required." };
  }

  const noteData: InsertNote = {
    title: title || "Untitled Note", // Default title if not provided
    content: "", // Default empty content
    categoryId: categoryId,
    userId: userId,
    // createdAt and updatedAt will be handled by the DB schema defaults (e.g., defaultNow())
  };

  try {
    const newNote = await createNote(noteData); // Reuse existing createNote query
    
    // Revalidate paths
    revalidatePath("/dashboard/notes"); // Main notes board
    revalidatePath(`/dashboard/notes/${newNote.id}`); // The new note's page
    // Consider revalidating the specific category view if your setup uses query params for that
    // For example: revalidatePath(`/dashboard/notes?category=${categoryId}`);
    // However, revalidating /dashboard/notes might cover general updates effectively.

    return {
      isSuccess: true,
      message: "Note created successfully and quickly!",
      data: newNote,
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error creating quick note";
    console.error("createQuickNoteAction Error: ", errorMessage, error);
    return { isSuccess: false, message: errorMessage };
  }
} 