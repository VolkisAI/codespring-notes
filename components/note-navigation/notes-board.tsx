/**
 * NotesBoard Component
 * 
 * Purpose:
 * This component serves as the main interface for viewing notes in a Trello-like board.
 * It receives categories (user-specific and base) and fetches their associated notes,
 * displaying each category as a column and each note as a card.
 * 
 * Functionality:
 * - Receives categories as a prop.
 * - For each category, fetches/displays its associated notes (currently mock notes).
 * - Renders categories as distinct columns using the CategoryColumn component.
 * - Renders notes as cards within these columns using the NoteCard component (via CategoryColumn).
 * - Includes a toolbar with a button to trigger the AddNoteModal for creating new notes, passing categories to it.
 * 
 * Location:
 * /components/note-navigation/notes-board.tsx
 */
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { SelectCategory, SelectNote } from '@/db/schema'; // Using actual types
import { Button } from "@/components/ui/button";
import AddNoteModal from './add-note-modal';
import CategoryColumn from './category-column';
import { getNotesByCategoryIdAction } from '@/actions/notes-actions'; // Import notes action
import { useAuth } from "@clerk/nextjs"; // Import useAuth for userId
import { useRouter } from 'next/navigation'; // Import useRouter

interface NotesBoardProps {
  initialCategories: SelectCategory[];
}

const NotesBoard: React.FC<NotesBoardProps> = ({ initialCategories }) => {
  const { userId, isLoaded: authLoaded } = useAuth();
  const router = useRouter(); // Initialize useRouter
  const [notesByCategoryId, setNotesByCategoryId] = useState<Record<string, SelectNote[]>>({});
  const [isLoadingNotes, setIsLoadingNotes] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddNoteModal, setShowAddNoteModal] = useState(false);

  const fetchNotesForCategory = useCallback(async (categoryId: string, currentUserId: string) => {
    const result = await getNotesByCategoryIdAction(categoryId, currentUserId);
    if (result.isSuccess && result.data) {
      return result.data;
    }
    console.error(`Failed to fetch notes for category ${categoryId}:`, result.message);
    setError(`Failed to load notes for ${initialCategories.find(c=>c.id === categoryId)?.name || 'a category'}.`);
    return []; // Return empty array on error for this category
  }, [initialCategories]); // initialCategories in dep array for category name in error

  useEffect(() => {
    const loadAllNotes = async () => {
      if (!authLoaded) return; // Wait for Clerk to load userId

      if (!userId) {
        setError("User not authenticated. Please sign in to view notes.");
        setIsLoadingNotes(false);
        setNotesByCategoryId({});
        return;
      }

      if (!initialCategories || initialCategories.length === 0) {
        setNotesByCategoryId({});
        setIsLoadingNotes(false);
        return;
      }
      
      setIsLoadingNotes(true);
      setError(null);
      try {
        const allNotesPromises = initialCategories.map(category => 
          fetchNotesForCategory(category.id, userId)
        );
        const notesArrays = await Promise.all(allNotesPromises);
        
        const newNotesByCatId: Record<string, SelectNote[]> = {};
        initialCategories.forEach((category, index) => {
          newNotesByCatId[category.id] = notesArrays[index];
        });
        setNotesByCategoryId(newNotesByCatId);
      } catch (e) {
        console.error("Error loading notes for categories:", e);
        setError("An unexpected error occurred while loading notes.");
      } finally {
        setIsLoadingNotes(false);
      }
    };

    loadAllNotes();
  }, [initialCategories, userId, authLoaded, fetchNotesForCategory]);

  const handleNoteAdded = (newNote: SelectNote) => {
    setNotesByCategoryId(prevNotes => {
      const categoryNotes = prevNotes[newNote.categoryId] || [];
      return {
        ...prevNotes,
        [newNote.categoryId]: [...categoryNotes, newNote],
      };
    });
    // Redirect to the new note's page
    router.push(`/dashboard/notes/${newNote.id}`);
  };

  if (!authLoaded) {
    return <div className="flex justify-center items-center h-screen text-gray-600">Authenticating...</div>;
  }

  if (!initialCategories && isLoadingNotes) { // Show general loading if initialCategories aren't even there yet (though page.tsx should provide them)
    return <div className="flex justify-center items-center h-screen text-gray-600">Loading board...</div>;
  }

  if (error) {
    return <div className="text-red-500 text-center p-4 bg-red-50 rounded-md">{error}</div>;
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 bg-gray-100 min-h-screen">
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
        <h1 className="text-3xl font-bold text-gray-800">My Notes Board</h1>
        <Button onClick={() => setShowAddNoteModal(true)} size="lg" disabled={initialCategories.length === 0}>
          + Create New Note
        </Button>
      </div>

      {initialCategories.length === 0 && !isLoadingNotes && (
        <div className="text-center text-gray-500 py-10">
          <p className="text-xl mb-2">No categories found.</p>
          <p>Get started by creating a category or check if base categories are available!</p>
        </div>
      )}

      {isLoadingNotes && initialCategories.length > 0 && !userId && (
         <div className="text-center text-orange-600 py-10">
           <p className="text-xl mb-2">Waiting for user authentication to load notes...</p>
         </div>
      )}

      {!isLoadingNotes && initialCategories.length > 0 && userId && Object.keys(notesByCategoryId).length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 items-start">
          {initialCategories.map((category) => (
            <CategoryColumn 
              key={category.id} 
              category={category} 
              notes={notesByCategoryId[category.id] || []} 
            />
          ))}
        </div>
      )}

      {!isLoadingNotes && initialCategories.length > 0 && userId && Object.keys(notesByCategoryId).length === 0 && !error && (
         <div className="text-center text-gray-500 py-10">
          <p className="text-xl mb-2">No notes found for your categories.</p>
          <p>Try creating some notes!</p>
        </div>
      )}

      {showAddNoteModal && (
        <AddNoteModal 
          onClose={() => setShowAddNoteModal(false)} 
          onNoteAdded={handleNoteAdded} 
          categories={initialCategories} // Pass the server-fetched categories
        />
      )}
    </div>
  );
};

export default NotesBoard; 