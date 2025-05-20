/**
 * NoteCard Component
 * 
 * Purpose:
 * This component displays a summary of a single note, typically including its
 * title and creation date. It is a clickable card that navigates to the
 * detailed note view.
 * 
 * Functionality:
 * - Receives note data (SelectNote) as props.
 * - Renders the note's title and formatted creation date.
 * - Handles click events to navigate to the note's detail page.
 * 
 * Location:
 * /components/note-navigation/note-card.tsx
 */
"use client"; // Required for useRouter

import React from 'react';
import { useRouter } from 'next/navigation';
import { SelectNote } from '@/db/schema/notes-schema'; // Use actual SelectNote type

interface NoteCardProps {
  note: SelectNote; // Changed from PlaceholderNote
  // onClick prop is removed as navigation is handled internally
}

const NoteCard: React.FC<NoteCardProps> = ({ note }) => {
  const router = useRouter();

  const formattedDate = new Date(note.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  const handleCardClick = () => {
    router.push(`/dashboard/notes/${note.id}`);
  };

  return (
    <div 
      className="p-3 border rounded-md shadow-sm bg-white hover:shadow-lg hover:border-blue-500 transition-all duration-150 ease-in-out cursor-pointer active:shadow-inner"
      onClick={handleCardClick} // Internal click handler for navigation
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          handleCardClick();
        }
      }}
      title={`View note: ${note.title}`}
    >
      <h3 className="text-md font-semibold text-gray-800 mb-1 truncate">
        {note.title}
      </h3>
      <p className="text-xs text-gray-500">
        {/* Displaying updatedAt if it's different and more recent than createdAt can be useful */}
        {note.updatedAt && note.updatedAt.getTime() > note.createdAt.getTime() 
          ? `Updated: ${new Date(note.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
          : `Created: ${formattedDate}`}
      </p>
      {/* Future additions: excerpt, tags */}
    </div>
  );
};

export default NoteCard; 