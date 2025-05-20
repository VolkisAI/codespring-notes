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
import React from 'react';
import { auth } from "@clerk/nextjs/server";
import { getNoteByIdAction } from '@/actions/notes-actions';
import { getCategoryByIdAction } from '@/actions/categories-actions';
import NoteHeader from '@/components/note-details/note-header';
import NoteEditor from '@/components/note-details/note-editor';
import { SelectNote, SelectCategory } from '@/db/schema';
import { redirect } from 'next/navigation';

interface NoteDetailPageProps {
  params: {
    'note-id': string;
  };
}

const NoteDetailPage = async ({ params }: NoteDetailPageProps) => {
  const { userId } = auth();
  const noteId = params['note-id'];

  if (!userId) {
    // This should ideally be handled by middleware, but good to have a check.
    redirect('/sign-in'); // Or your app's sign-in page
  }

  if (!noteId) {
    return <div className="p-4 text-red-500">Note ID is missing.</div>;
  }

  const noteResult = await getNoteByIdAction(noteId);
  let note: SelectNote | undefined = undefined;
  let category: SelectCategory | null | undefined = null;

  if (noteResult.isSuccess && noteResult.data) {
    if (noteResult.data.userId !== userId) {
      // Note does not belong to the current user
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
    note = noteResult.data;
    if (note.categoryId) {
      const categoryResult = await getCategoryByIdAction(note.categoryId);
      if (categoryResult.isSuccess && categoryResult.data) {
        category = categoryResult.data;
      } else {
        console.warn(`Failed to fetch category ${note.categoryId}: ${categoryResult.message}`);
        // Category might be null if it was deleted or an error occurred, header handles this
      }
    }
  } else {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <h1 className="text-2xl font-semibold text-red-600 mb-4">Note Not Found</h1>
          <p className="text-gray-700">The note you are looking for does not exist or could not be loaded.</p>
          <a href="/dashboard/notes" className="mt-6 inline-block px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700">
            Go to My Notes
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <NoteHeader note={note} category={category} />
      <NoteEditor 
        noteId={note.id} 
        initialContent={note.content || ''} 
        categoryColor={category?.color}
      />
      {/* Future: Formatting toolbar could go here or within NoteEditor */}
    </div>
  );
};

export default NoteDetailPage; 