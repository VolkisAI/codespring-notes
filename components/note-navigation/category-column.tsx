/**
 * CategoryColumn Component
 * 
 * Purpose:
 * This component displays a single category as a column within the NotesBoard.
 * It shows the category's name, styled with its specific color, lists all
 * notes belonging to this category, and provides a button to quickly add a new note.
 * 
 * Functionality:
 * - Receives category data and an array of notes as props.
 * - Renders the category title with its designated color and note count.
 * - Maps through the notes array and renders a NoteCard component for each note.
 * - Displays a message if there are no notes in the category.
 * - Includes a button at the bottom to quickly create a new note in this category.
 * 
 * Location:
 * /components/note-navigation/category-column.tsx
 */
import React, { useState } from 'react';
import NoteCard from './note-card';
import { SelectCategory } from '@/db/schema/categories-schema';
import { SelectNote } from '@/db/schema/notes-schema';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useAuth } from "@clerk/nextjs";
import { useRouter } from 'next/navigation';
import { createQuickNoteAction } from '@/actions/notes-actions';
import { useToast } from "@/components/ui/use-toast"; // For user feedback

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
  const { userId } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isCreatingNote, setIsCreatingNote] = useState(false);

  const handleCreateQuickNote = async () => {
    if (!userId) {
      toast({
        title: "Authentication Error",
        description: "You must be signed in to create a note.",
        variant: "destructive",
      });
      return;
    }
    setIsCreatingNote(true);
    try {
      // Use a slightly more descriptive default title
      const result = await createQuickNoteAction(category.id, userId, `New note in ${category.name}`);
      if (result.isSuccess && result.data) {
        toast({
          title: "Note Created!",
          description: `Successfully created "${result.data.title}". Taking you there...`,
        });
        router.push(`/dashboard/notes/${result.data.id}`);
      } else {
        toast({
          title: "Error Creating Note",
          description: result.message || "An unknown error occurred.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error in handleCreateQuickNote:", error);
      toast({
        title: "Unexpected Error",
        description: "An unexpected error occurred while creating the note.",
        variant: "destructive",
      });
    } finally {
      setIsCreatingNote(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
      {/* Category Header */}
      <div 
        className="p-3 border-b flex items-center justify-between sticky top-0 bg-white z-10"
        style={{ borderColor: `${category.color}50` }} // Slightly more visible border
      >
        <div className="flex items-center gap-2 truncate">
          <div 
            className="w-2.5 h-2.5 rounded-full flex-shrink-0" 
            style={{ backgroundColor: category.color }}
          ></div>
          <h2 
            className="font-semibold text-sm truncate"
            style={{ color: category.color }} 
          >
            {category.name}
          </h2>
        </div>
        <Badge 
          variant="outline" 
          className="text-xs font-medium flex-shrink-0"
          style={{ 
            backgroundColor: `${category.color}1A`, // Slightly more opaque background
            borderColor: `${category.color}4D`, 
            color: category.color 
          }}
        >
          {notes.length}
        </Badge>
      </div>
      
      {/* Notes Container */}
      <div className="flex-grow p-3 space-y-2.5 overflow-y-auto bg-slate-50 min-h-[100px]">
        {notes.length > 0 ? (
          notes.map(note => (
            <NoteCard 
              key={note.id} 
              note={note} 
            />
          ))
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center py-6 px-3">
            <p className="text-xs text-gray-400">No notes in this category yet.</p>
          </div>
        )}
      </div>

      {/* Add Note Button Footer */}
      <div className="p-2 border-t bg-white">
        <Button 
          variant="ghost" 
          className="w-full justify-start text-xs text-gray-500 hover:text-blue-600 hover:bg-blue-50 py-2 h-auto"
          onClick={handleCreateQuickNote}
          disabled={isCreatingNote || !userId}
        >
          <Plus className="h-3.5 w-3.5 mr-1.5 flex-shrink-0" />
          {isCreatingNote ? 'Creating Note...' : 'Add a note'}
        </Button>
      </div>
    </div>
  );
};

export default CategoryColumn; 