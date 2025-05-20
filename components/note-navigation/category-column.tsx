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
import { SelectCategory } from '@/db/schema/categories-schema'; // Using actual type
import { SelectNote } from '@/db/schema/notes-schema'; // Import SelectNote

// PlaceholderNote can be refined or replaced when actual note fetching is implemented
// For now, assuming it's compatible with what NoteCard expects or NoteCard uses a similar placeholder.
// interface PlaceholderNote { Commenting out as we now use SelectNote
//   id: string;
//   title: string;
//   createdAt: Date;
//   // other fields NoteCard might expect
// }

interface CategoryColumnProps {
  category: SelectCategory; // Changed to SelectCategory
  notes: SelectNote[]; // Changed to SelectNote[]
}

const CategoryColumn: React.FC<CategoryColumnProps> = ({ category, notes }) => {
  // const handleNoteClick = (noteId: string) => { // This function is no longer needed
  //   console.log(`Note clicked: ${noteId}, from category: ${category.name}`);
  // };

  return (
    <div 
      className="p-4 rounded-lg shadow-md bg-white h-full flex flex-col min-h-[300px] max-h-[calc(100vh-200px)]"
      style={{ borderTop: `4px solid ${category.color}` }}
    >
      <h2 
        className="text-xl font-semibold mb-4 pb-2 border-b sticky top-0 bg-white z-10"
        style={{ color: category.color, borderBottomColor: category.color + '40' }} 
      >
        {category.name} ({notes.length})
      </h2>
      <div className="flex-grow space-y-3 overflow-y-auto pr-1 pb-2">
        {notes.length > 0 ? (
          notes.map(note => (
            <NoteCard 
              key={note.id} 
              note={note} 
              // onClick={() => handleNoteClick(note.id)} // Removed onClick prop
            />
          ))
        ) : (
          <p className="text-sm text-gray-400 text-center py-4">No notes in this category yet.</p>
        )}
      </div>
    </div>
  );
};

export default CategoryColumn; 