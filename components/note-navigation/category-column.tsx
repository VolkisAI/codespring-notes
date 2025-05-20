/**
 * CategoryColumn Component
 * 
 * Purpose:
 * This component displays a single category as a column within the NotesBoard.
 * It shows the category's name, styled with its specific color, and lists all
 * notes belonging to this category using the NoteCard component.
 * 
 * Functionality:
 * - Receives category data (name, color) and an array of notes as props.
 * - Renders the category title with its designated color.
 * - Maps through the notes array and renders a NoteCard component for each note.
 * - Displays a message if there are no notes in the category.
 * 
 * Location:
 * /components/note-navigation/category-column.tsx
 */
import React from 'react';
import NoteCard from './note-card';
import { SelectCategory } from '@/db/schema/categories-schema';
import { SelectNote } from '@/db/schema/notes-schema';
import { Badge } from '@/components/ui/badge';

// PlaceholderNote can be refined or replaced when actual note fetching is implemented
// For now, assuming it's compatible with what NoteCard expects or NoteCard uses a similar placeholder.
// interface PlaceholderNote { Commenting out as we now use SelectNote
//   id: string;
//   title: string;
//   createdAt: Date;
//   // other fields NoteCard might expect
// }

interface CategoryColumnProps {
  category: SelectCategory;
  notes: SelectNote[];
}

const CategoryColumn: React.FC<CategoryColumnProps> = ({ category, notes }) => {
  // const handleNoteClick = (noteId: string) => { // This function is no longer needed
  //   console.log(`Note clicked: ${noteId}, from category: ${category.name}`);
  // };

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-sm overflow-hidden">
      {/* Category Header */}
      <div 
        className="p-4 border-b flex items-center justify-between sticky top-0 bg-white z-10"
        style={{ borderColor: `${category.color}40` }}
      >
        <div className="flex items-center gap-2">
          <div 
            className="w-3 h-3 rounded-full" 
            style={{ backgroundColor: category.color }}
          ></div>
          <h2 
            className="font-medium text-gray-900"
            style={{ color: category.color }} 
          >
            {category.name}
          </h2>
        </div>
        <Badge 
          variant="outline" 
          className="text-xs"
          style={{ 
            backgroundColor: `${category.color}10`,
            borderColor: `${category.color}30`, 
            color: category.color 
          }}
        >
          {notes.length}
        </Badge>
      </div>
      
      {/* Notes Container */}
      <div className="flex-grow p-3 space-y-3 overflow-y-auto max-h-[calc(100vh-220px)] bg-gray-50">
        {notes.length > 0 ? (
          notes.map(note => (
            <NoteCard 
              key={note.id} 
              note={note} 
            />
          ))
        ) : (
          <div className="flex flex-col items-center justify-center h-full min-h-[120px] text-center">
            <p className="text-sm text-gray-400">No notes in this category</p>
            <p className="text-xs text-gray-300 mt-1">Notes you create will appear here</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryColumn; 