/**
 * NoteHeader Component
 * 
 * Purpose:
 * Displays the header section for the note detail page. This includes the note title,
 * category information, creation date, and a back button that triggers save.
 * 
 * Functionality:
 * - Shows the note's title (controlled by parent).
 * - Displays the category as a colored pill/badge.
 * - Shows the note's creation date, formatted nicely.
 * - Provides a "Back" button that calls a parent-provided save and navigation function.
 * 
 * Location:
 * /components/note-details/note-header.tsx
 */
"use client";

import React, { useState, useEffect, useRef } from 'react';
// useRouter is not used here anymore directly for back navigation
import { ArrowLeft, Edit3, Save, Loader2 } from 'lucide-react'; // Added Loader2 for saving state
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { SelectNote, SelectCategory } from '@/db/schema';
// updateNoteAction is no longer called directly from here for title saving

// Exporting the props interface
export interface NoteHeaderProps {
  note: SelectNote; // Original note data for display (created/updated dates)
  category: SelectCategory | null | undefined;
  currentTitle: string; // Controlled title from parent
  onTitleChange: (newTitle: string) => void; // Callback to update parent's title state
  onSaveAndNavigateBack: () => Promise<void>; // Callback to save and navigate
  isSaving: boolean; // To show loading state on back button if needed
}

const NoteHeader: React.FC<NoteHeaderProps> = ({ 
  note, 
  category, 
  currentTitle, 
  onTitleChange, 
  onSaveAndNavigateBack,
  isSaving 
}) => {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Effect to focus input when editing starts
  useEffect(() => {
    if (isEditingTitle && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditingTitle]);

  const formatDate = (dateString: Date) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  };

  const handleLocalTitleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onTitleChange(event.target.value); // Update parent state
  };

  // This function is now primarily for UI state, actual save is handled by parent
  const handleTitleEditConfirm = () => {
    // if (!currentTitle.trim()) {
    //   // Optionally, revert to original note title if empty, parent will handle validation
    //   onTitleChange(note.title); 
    // }
    setIsEditingTitle(false);
    // The actual save of title will happen via onSaveAndNavigateBack or other parent logic
  };

  const handleTitleClick = () => {
    setIsEditingTitle(true);
  };

  const handleInputBlur = () => {
    // Confirm edit (which just stops editing UI state). Parent handles save.
    handleTitleEditConfirm();
  };
  
  const handleInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleTitleEditConfirm();
    } else if (event.key === 'Escape') {
      onTitleChange(note.title); // Revert to original title from prop if escape
      setIsEditingTitle(false);
    }
  };

  return (
    <div className="p-4 md:p-6 sticky top-0 z-10 bg-white border-b border-gray-200">
      <div className="mb-4">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onSaveAndNavigateBack} // Changed to call the new handler
          disabled={isSaving} // Disable button while saving/navigating
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
        >
          {isSaving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <ArrowLeft className="h-4 w-4" />
          )}
          <span>{isSaving ? 'Saving & Exiting...' : 'All Notes'}</span>
        </Button>
      </div>
      
      <div className="flex items-center gap-x-2 mb-4">
        {isEditingTitle ? (
          <div className="flex-grow flex items-center gap-x-2">
            <Input
              ref={inputRef}
              value={currentTitle} // Controlled by parent state
              onChange={handleLocalTitleChange} // Updates parent state
              onBlur={handleInputBlur}
              onKeyDown={handleInputKeyDown}
              className="text-2xl md:text-3xl font-bold text-gray-900 flex-grow h-auto py-1.5"
              placeholder="Note Title"
            />
            {/* Save button for title is less critical if save-on-back is primary */}
            <Button onClick={handleTitleEditConfirm} size="icon" variant="ghost" className="text-green-600 hover:text-green-700">
              <Save className="h-5 w-5" />
            </Button>
          </div>
        ) : (
          <h1 
            onClick={handleTitleClick} 
            className="text-2xl md:text-3xl font-bold text-gray-900 truncate cursor-pointer hover:text-blue-600 transition-colors"
            title="Click to edit title"
          >
            {currentTitle.trim() || "Untitled Note"} {/* Display placeholder if empty */}
          </h1>
        )}
        {!isEditingTitle && (
          <Button onClick={handleTitleClick} variant="ghost" size="icon" className="text-gray-500 hover:text-gray-700 ml-1">
            <Edit3 className="h-4 w-4" />
          </Button>
        )}
      </div>
      
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500">
        {category && (
          <Badge 
            variant="outline" 
            className="py-0.5 px-2 text-xs"
            style={{ 
              backgroundColor: category.color + '1A',
              borderColor: category.color + '4D', 
              color: category.color 
            }}
          >
            <span 
              className="inline-block w-1.5 h-1.5 rounded-full mr-1.5" 
              style={{ backgroundColor: category.color }}
            ></span>
            {category.name}
          </Badge>
        )}
        <span className="whitespace-nowrap">Created: {formatDate(note.createdAt)}</span>
        {note.updatedAt && note.updatedAt.getTime() !== note.createdAt.getTime() && (
          <span className="whitespace-nowrap">Updated: {formatDate(note.updatedAt)}</span>
        )}
      </div>
    </div>
  );
};

export default NoteHeader; 