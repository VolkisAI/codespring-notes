/**
 * Note Detail Page
 * 
 * Purpose:
 * Displays the detailed view of a single note, including its title, category,
 * creation/update dates, and content. This page allows for viewing and (later) 
 * editing the note.
 * 
 * Functionality:
 * - Fetches the specific note data based on the [note-id] from the URL.
 * - Fetches the associated category data for the note.
 * - Uses NoteHeader to display metadata and navigation.
 * - Uses NoteEditor to display the note's content.
 * - Handles cases where the note or category might not be found.
 * 
 * Location: /app/dashboard/notes/[note-id]/page.tsx
 */
// This is now a PURE Server Component
import React from 'react';
import { auth } from "@clerk/nextjs/server"; // Correct static import for Server Component
import { getNoteByIdAction } from '@/actions/notes-actions';
import { getCategoryByIdAction } from '@/actions/categories-actions';
import { SelectNote, SelectCategory } from '@/db/schema';
import { redirect } from 'next/navigation'; // For server-side redirects
import NoteDetailPageClient from './page-client'; // Import the new client component

interface NoteDetailPageProps {
  params: {
    'note-id': string;
  };
}

const NoteDetailPage = async ({ params }: NoteDetailPageProps) => {
  const { userId } = auth();
  const noteId = params['note-id'];

  if (!userId) {
    redirect('/sign-in');
  }

  if (!noteId) {
    // This could be a more user-friendly error page or component
    return <div className="p-4 text-red-500 text-center mt-10">Error: Note ID is missing. Cannot load note details.</div>;
  }

  const noteResult = await getNoteByIdAction(noteId);
  let initialNoteData: SelectNote | undefined = undefined;
  let initialCategoryData: SelectCategory | null = null;

  if (noteResult.isSuccess && noteResult.data) {
    if (noteResult.data.userId !== userId) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
          <div className="bg-white p-8 rounded-lg shadow-md text-center">
            <h1 className="text-2xl font-semibold text-red-600 mb-4">Access Denied</h1>
            <p className="text-gray-700">You do not have permission to view this note.</p>
            <a href="/dashboard/notes" className="mt-6 inline-block px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700">
              Go to My Notes
            </a>
          </div>
        </div>
      );
    }
    initialNoteData = noteResult.data;
    if (initialNoteData.categoryId) {
      const categoryResult = await getCategoryByIdAction(initialNoteData.categoryId);
      if (categoryResult.isSuccess && categoryResult.data) {
        initialCategoryData = categoryResult.data;
      } else {
        console.warn(`NoteDetailPage: Failed to fetch category ${initialNoteData.categoryId}: ${categoryResult.message}`);
        // initialCategoryData remains null, which is handled by the client component
      }
    }
  } else {
    // Note not found or error fetching
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <h1 className="text-2xl font-semibold text-red-600 mb-4">Note Not Found</h1>
          <p className="text-gray-700">The note you are looking for ({noteId}) does not exist or could not be loaded.</p>
          <p className="text-xs text-gray-400 mt-1">({noteResult.message})</p>
          <a href="/dashboard/notes" className="mt-6 inline-block px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700">
            Go to My Notes
          </a>
        </div>
      </div>
    );
  }

  // If, after all checks, initialNoteData is still not populated (should be caught by the else block above)
  if (!initialNoteData) {
    return <div className="p-4 text-red-500 text-center mt-10">Error: Critical issue loading note data. Please try again.</div>;
  }

  // Render the client component with the fetched data
  return <NoteDetailPageClient initialNote={initialNoteData} initialCategory={initialCategoryData} />;
};

export default NoteDetailPage; 