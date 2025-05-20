/**
 * NotesBoard Component
 * 
 * Purpose:
 * This component serves as the main interface for viewing notes in a modern, flexible layout.
 * It receives categories (user-specific and base) and fetches their associated notes,
 * displaying them in either a column-based or table-based view.
 * 
 * Functionality:
 * - Receives categories as a prop.
 * - For each category, fetches/displays its associated notes.
 * - Supports switching between column view and table view.
 * - Allows creation of new notes via a floating action button.
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
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { PlusCircle, LayoutGrid, List, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

interface NotesBoardProps {
  initialCategories: SelectCategory[];
}

const NotesBoard: React.FC<NotesBoardProps> = ({ initialCategories }) => {
  const { userId, isLoaded: authLoaded } = useAuth();
  const router = useRouter();
  const [notesByCategoryId, setNotesByCategoryId] = useState<Record<string, SelectNote[]>>({});
  const [isLoadingNotes, setIsLoadingNotes] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddNoteModal, setShowAddNoteModal] = useState(false);
  const [viewMode, setViewMode] = useState<"columns" | "table">("columns");
  const [searchQuery, setSearchQuery] = useState("");

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

  // Get all notes flattened for table view
  const allNotes = Object.values(notesByCategoryId).flat();
  
  // Filter notes based on search query
  const filteredNotes = searchQuery.trim() === "" 
    ? allNotes 
    : allNotes.filter(note => 
        note.title.toLowerCase().includes(searchQuery.toLowerCase())
      );

  if (!authLoaded) {
    return <div className="flex justify-center items-center h-screen text-gray-600">Authenticating...</div>;
  }

  if (!initialCategories && isLoadingNotes) {
    return <div className="flex justify-center items-center h-screen text-gray-600">Loading board...</div>;
  }

  if (error) {
    return <div className="text-red-500 text-center p-4 bg-red-50 rounded-md">{error}</div>;
  }

  // Count total notes
  const totalNotes = allNotes.length;

  return (
    <Tabs defaultValue="columns" value={viewMode} onValueChange={(value) => setViewMode(value as "columns" | "table")} className="bg-gradient-to-b from-gray-50 to-white min-h-screen flex flex-col">
      <div className="px-6 py-4 border-b bg-white sticky top-0 z-20 shadow-sm">
        <div className="container mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="relative w-full sm:w-64 md:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input 
                  placeholder="Search notes..." 
                  className="pl-10 bg-gray-50 border-gray-200"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                {totalNotes} {totalNotes === 1 ? 'note' : 'notes'}
              </Badge>
            </div>
            
            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <TabsList className="grid grid-cols-2 w-[180px] mr-2">
                <TabsTrigger value="columns" className="flex items-center gap-1">
                  <LayoutGrid className="h-4 w-4 mr-1" />
                  Columns
                </TabsTrigger>
                <TabsTrigger value="table" className="flex items-center gap-1">
                  <List className="h-4 w-4 mr-1" />
                  Table
                </TabsTrigger>
              </TabsList>
              
              <Button 
                onClick={() => setShowAddNoteModal(true)} 
                className="rounded-full shadow-lg" 
                disabled={initialCategories.length === 0}
              >
                <PlusCircle className="h-4 w-4 mr-1" />
                New Note
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto p-6 flex-grow">
        {initialCategories.length === 0 && !isLoadingNotes && (
          <div className="text-center text-gray-500 py-10 bg-white rounded-lg shadow-sm">
            <p className="text-xl mb-2">No categories found.</p>
            <p>Get started by creating a category or check if base categories are available!</p>
          </div>
        )}

        {isLoadingNotes && initialCategories.length > 0 && !userId && (
          <div className="text-center text-orange-600 py-10 bg-white rounded-lg shadow-sm">
            <p className="text-xl mb-2">Waiting for user authentication to load notes...</p>
          </div>
        )}

        {/* TabsContent for Columns View */}
        <TabsContent value="columns" className="mt-0 h-full">
          {!isLoadingNotes && initialCategories.length > 0 && userId && (
            Object.keys(notesByCategoryId).length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 h-full">
                {initialCategories.map((category) => (
                  <CategoryColumn 
                    key={category.id} 
                    category={category} 
                    notes={notesByCategoryId[category.id]?.filter(note => 
                      searchQuery === "" || note.title.toLowerCase().includes(searchQuery.toLowerCase())
                    ) || []} 
                  />
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-500 py-10 bg-white rounded-lg shadow-sm">
                <p className="text-xl mb-2">No notes found for your categories.</p>
                <p>Try creating some notes!</p>
              </div>
            )
          )}
        </TabsContent>
        
        {/* TabsContent for Table View */}
        <TabsContent value="table" className="mt-0 h-full">
          {!isLoadingNotes && initialCategories.length > 0 && userId && (
            filteredNotes.length > 0 ? (
              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Title</th>
                      <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Category</th>
                      <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Created</th>
                      <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Updated</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredNotes.map((note) => {
                      const category = initialCategories.find(c => c.id === note.categoryId);
                      return (
                        <tr 
                          key={note.id} 
                          className="border-b hover:bg-gray-50 cursor-pointer transition-colors"
                          onClick={() => router.push(`/dashboard/notes/${note.id}`)}
                        >
                          <td className="px-6 py-4">
                            <div className="font-medium text-gray-900">{note.title}</div>
                          </td>
                          <td className="px-6 py-4">
                            {category && (
                              <div 
                                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                                style={{ 
                                  backgroundColor: `${category.color}20`,
                                  color: category.color,
                                  border: `1px solid ${category.color}40`
                                }}
                              >
                                {category.name}
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            {new Date(note.createdAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            {note.updatedAt && note.updatedAt.getTime() !== note.createdAt.getTime() ? 
                              new Date(note.updatedAt).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                              }) : '-'
                            }
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center text-gray-500 py-10 bg-white rounded-lg shadow-sm">
                <p className="text-xl mb-2">No notes found matching your search criteria.</p>
                <p>Try adjusting your search or creating new notes.</p>
              </div>
            )
          )}
        </TabsContent>
      </div>

      {showAddNoteModal && (
        <AddNoteModal 
          onClose={() => setShowAddNoteModal(false)} 
          onNoteAdded={handleNoteAdded} 
          categories={initialCategories}
        />
      )}
    </Tabs>
  );
};

export default NotesBoard; 