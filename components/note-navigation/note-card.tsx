/**
 * NoteCard Component
 * 
 * Purpose:
 * This component displays a summary of a single note with a modern, clean design.
 * It shows the note title and metadata with subtle visual styling.
 * 
 * Functionality:
 * - Receives note data (SelectNote) as props.
 * - Renders the note's title and formatted date information.
 * - Provides visual feedback for interaction states.
 * - Handles click events to navigate to the note's detail page.
 * 
 * Location:
 * /components/note-navigation/note-card.tsx
 */
"use client"; // Required for useRouter

import React from 'react';
import { useRouter } from 'next/navigation';
import { SelectNote } from '@/db/schema/notes-schema';
import { Calendar, Clock } from 'lucide-react';

interface NoteCardProps {
  note: SelectNote;
}

const NoteCard: React.FC<NoteCardProps> = ({ note }) => {
  const router = useRouter();

  // Format date with shorter output for better display
  const formattedDate = new Date(note.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });

  // Check if the note was updated
  const isUpdated = note.updatedAt && note.updatedAt.getTime() > note.createdAt.getTime();
  
  // Format updated date if applicable
  const formattedUpdateDate = isUpdated 
    ? new Date(note.updatedAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      })
    : null;

  const handleCardClick = () => {
    router.push(`/dashboard/notes/${note.id}`);
  };

  return (
    <div 
      className="bg-white border border-gray-200 rounded-md overflow-hidden transition-all duration-200 ease-in-out group hover:shadow-md hover:border-blue-300 cursor-pointer"
      onClick={handleCardClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          handleCardClick();
        }
      }}
      title={`View note: ${note.title}`}
    >
      <div className="p-3">
        <h3 className="font-medium text-gray-900 mb-2 group-hover:text-blue-600 transition-colors truncate">
          {note.title}
        </h3>
        
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            <span>{formattedDate}</span>
          </div>
          
          {isUpdated && (
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>Updated {formattedUpdateDate}</span>
            </div>
          )}
        </div>
      </div>
      
      {/* Add subtle highlight bar at bottom for visual interest */}
      <div className="h-1 bg-gradient-to-r from-blue-400 to-indigo-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
    </div>
  );
};

export default NoteCard; 