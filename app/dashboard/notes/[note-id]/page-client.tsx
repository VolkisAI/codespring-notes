"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from "@clerk/nextjs"; // Client-side auth hook
import { updateNoteAction } from '@/actions/notes-actions';
import NoteHeader, { NoteHeaderProps } from '@/components/note-details/note-header';
import NoteEditor from '@/components/note-details/note-editor';
import { SelectNote, SelectCategory } from '@/db/schema';
import { useToast } from "@/components/ui/use-toast";

// Props for this client component
interface NoteDetailPageClientProps {
  // params: { 'note-id': string }; // params might not be needed if noteId is directly in initialNote
  initialNote: SelectNote;
  initialCategory: SelectCategory | null;
}

const NoteDetailPageClient: React.FC<NoteDetailPageClientProps> = ({ 
  initialNote,
  initialCategory 
}) => {
  const router = useRouter();
  const { toast } = useToast();
  const { userId } = useAuth(); // For any client-side checks if necessary, though primary auth is server-side

  const [note, setNote] = useState<SelectNote>(initialNote);
  const [category, setCategory] = useState<SelectCategory | null | undefined>(initialCategory);
  
  const [currentTitle, setCurrentTitle] = useState(initialNote.title);
  const [currentContent, setCurrentContent] = useState(initialNote.content || '');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setNote(initialNote);
    setCurrentTitle(initialNote.title);
    setCurrentContent(initialNote.content || '');
    setCategory(initialCategory);
  }, [initialNote, initialCategory]);

  const handleTitleChange = (newTitle: string) => {
    setCurrentTitle(newTitle);
  };

  const handleContentChange = (newContent: string) => {
    setCurrentContent(newContent);
  };

  const handleSaveChangesAndNavigateBack = async () => {
    if (!userId) {
      toast({
        title: "Authentication Error",
        description: "You must be signed in to save changes.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    const hasTitleChanged = currentTitle.trim() !== note.title.trim();
    const hasContentChanged = currentContent !== (note.content || '');

    if (!currentTitle.trim()) {
        toast({
            title: "Title Required",
            description: "Note title cannot be empty.",
            variant: "destructive",
        });
        setIsSaving(false);
        return;
    }

    if (hasTitleChanged || hasContentChanged) {
      toast({
        title: "Saving Note...",
        description: "Your changes are being saved.",
      });
      try {
        const result = await updateNoteAction(note.id, { 
          title: currentTitle.trim(), 
          content: currentContent 
        });
        if (result.isSuccess && result.data) {
          setNote(result.data);
          toast({
            title: "Note Saved!",
            description: "Successfully saved your note.",
          });
        } else {
          toast({
            title: "Save Failed",
            description: result.message || "Could not save the note.",
            variant: "destructive",
          });
          setIsSaving(false);
          return;
        }
      } catch (error) {
        toast({
          title: "Save Error",
          description: "An unexpected error occurred while saving.",
          variant: "destructive",
        });
        setIsSaving(false);
        return;
      }
    } else {
      toast({ 
        title: "No Changes",
        description: "No changes detected. Navigating back.",
      });
    }
    setIsSaving(false);
    router.push('/dashboard/notes');
  };

  // Fallback if initialNote is somehow not what expected (should be caught by server wrapper)
  if (!note || !note.id) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <h1 className="text-2xl font-semibold text-red-600 mb-4">Note Data Error</h1>
          <p className="text-gray-700">There was an issue loading the note details.</p>
          <button onClick={() => router.push('/dashboard/notes')} className="mt-6 inline-block px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700">
            Go to My Notes
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <NoteHeader 
        note={note} 
        category={category}
        currentTitle={currentTitle}
        onTitleChange={handleTitleChange}
        onSaveAndNavigateBack={handleSaveChangesAndNavigateBack}
        isSaving={isSaving}
      />
      <NoteEditor 
        noteId={note.id} 
        initialContent={currentContent} 
        onContentChange={handleContentChange} 
        categoryColor={category?.color}
      />
    </div>
  );
};

export default NoteDetailPageClient; 