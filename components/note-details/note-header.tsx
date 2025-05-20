/**
 * NoteHeader Component
 * 
 * Purpose:
 * Displays the header section for the note detail page. This includes the note title,
 * category information (name and color), creation date, and a back button.
 * 
 * Functionality:
 * - Shows the note's title prominently.
 * - Displays the category as a colored pill/badge.
 * - Shows the note's creation date, formatted nicely.
 * - Provides a "Back" button to navigate to the main notes board.
 * - (Future) May include a burger menu for actions like delete/edit.
 * 
 * Location:
 * /components/note-details/note-header.tsx
 */
"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Edit3, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { SelectNote, SelectCategory } from '@/db/schema';

interface NoteHeaderProps {
  note: SelectNote;
  category: SelectCategory | null | undefined; // Category might not be found, or be loading
}

const NoteHeader: React.FC<NoteHeaderProps> = ({ note, category }) => {
  const router = useRouter();
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [currentTitle, setCurrentTitle] = useState(note.title);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setCurrentTitle(note.title);
  }, [note.title]);

  useEffect(() => {
    if (isEditingTitle && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditingTitle]);

  const formatDate = (dateString: Date) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleTitleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentTitle(event.target.value);
  };

  const handleTitleSave = async () => {
    console.log('Saving title (placeholder):', currentTitle);
    setIsEditingTitle(false);
  };

  const handleTitleClick = () => {
    setIsEditingTitle(true);
  };

  const handleInputBlur = () => {
    if (currentTitle !== note.title) {
    }
  };
  
  const handleInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleTitleSave();
    } else if (event.key === 'Escape') {
      setCurrentTitle(note.title);
      setIsEditingTitle(false);
    }
  };

  return (
    <div className="p-4 md:p-6 sticky top-0 z-10">
      <div className="mb-6">
        <Button variant="ghost" size="sm" onClick={() => router.push('/dashboard/notes')} className="flex items-center space-x-2 text-gray-600 hover:text-gray-900">
          <ArrowLeft className="h-4 w-4" />
          <span>All Notes</span>
        </Button>
      </div>
      
      <div className="flex items-center gap-x-2 mb-4">
        {isEditingTitle ? (
          <div className="flex-grow flex items-center gap-x-2">
            <Input
              ref={inputRef}
              value={currentTitle}
              onChange={handleTitleChange}
              onBlur={handleInputBlur}
              onKeyDown={handleInputKeyDown}
              className="text-3xl md:text-4xl font-bold text-gray-900 flex-grow h-auto py-2"
            />
            <Button onClick={handleTitleSave} size="icon" variant="ghost" className="text-green-600 hover:text-green-700">
              <Save className="h-6 w-6" />
            </Button>
          </div>
        ) : (
          <h1 
            onClick={handleTitleClick} 
            className="text-3xl md:text-4xl font-bold text-gray-900 truncate cursor-pointer hover:text-blue-600 transition-colors"
            title="Click to edit title"
          >
            {currentTitle}
          </h1>
        )}
        {!isEditingTitle && (
          <Button onClick={handleTitleClick} variant="ghost" size="icon" className="text-gray-500 hover:text-gray-700">
            <Edit3 className="h-5 w-5" />
          </Button>
        )}
      </div>
      
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-500">
        {category && (
          <Badge 
            variant="outline" 
            className="py-1 px-3 text-xs"
            style={{ 
              backgroundColor: category.color + '20',
              borderColor: category.color, 
              color: category.color 
            }}
          >
            <span 
              className="inline-block w-2 h-2 rounded-full mr-2" 
              style={{ backgroundColor: category.color }}
            ></span>
            {category.name}
          </Badge>
        )}
        <span>Created: {formatDate(note.createdAt)}</span>
        {note.updatedAt && note.updatedAt.getTime() !== note.createdAt.getTime() && (
          <span>Updated: {formatDate(note.updatedAt)}</span>
        )}
      </div>
    </div>
  );
};

export default NoteHeader; 