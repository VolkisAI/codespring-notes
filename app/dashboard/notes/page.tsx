/**
 * Note Navigation Page
 * 
 * Purpose:
 * This page serves as the entry point for the note navigation feature,
 * displaying the main NotesBoard component that allows users to view and manage
 * their notes in a modern, professional interface.
 * 
 * Functionality:
 * - Fetches user-specific and base categories.
 * - Imports and renders the NotesBoard component, passing categories to it.
 * - Provides the overall page structure with optimized layout.
 * 
 * Location:
 * /app/dashboard/notes/page.tsx
 */
import React from 'react';
import NotesBoard from '@/components/note-navigation/notes-board';
import { getCategoriesForUserAndBaseAction } from '@/actions/categories-actions';
import { auth } from "@clerk/nextjs/server"; // Assuming Clerk for auth
import { SelectCategory } from '@/db/schema/categories-schema';

const NoteNavigationPage = async () => {
  const { userId } = auth();
  let categories: SelectCategory[] = [];

  if (userId) {
    const result = await getCategoriesForUserAndBaseAction(userId);
    if (result.isSuccess && result.data) {
      categories = result.data;
    } else {
      // Handle error case, e.g., log it or show a message
      console.error("Failed to fetch categories:", result.message);
      // categories will remain empty, NotesBoard should handle this gracefully
    }
  } else {
    // Handle case where there is no logged-in user, 
    // depending on app logic, might fetch only base categories or show an error/redirect.
    // For now, attempting to get base categories if a general non-user specific view is ever needed.
    // Or, more likely, this page should be protected by auth middleware.
    // Assuming for now if no userId, we might only want to show base categories if the action supported it
    // without a userId, or redirect. Let's fetch with a placeholder or handle as an error.
    console.warn("No userId found, categories will be limited or page should be protected.");
    // If you have a way to fetch only base categories without a user context:
    // const result = await getCategoriesForUserAndBaseAction(null); // This would require action modification
    // For now, categories will be empty if no userId.
  }

  return (
    <div className="w-full min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* 
        The NotesBoard component handles its own padding and layout internally,
        so we typically don't need to add extra containers here unless 
        there are page-specific headers or footers outside the board itself.
      */}
      <NotesBoard initialCategories={categories} />
    </div>
  );
};

export default NoteNavigationPage; 