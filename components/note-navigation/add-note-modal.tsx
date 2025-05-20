/**
 * AddNoteModal Component
 * 
 * Purpose:
 * This component provides a modal dialog for creating a new note.
 * It will contain a form with fields for the note's title, content,
 * and category selection (populated with user and base categories).
 * 
 * Functionality:
 * - Displays as a modal overlay.
 * - Includes a form for note creation (title, content, category).
 * - Handles form submission to create a new note.
 * - Provides a way to close the modal.
 * - Receives a list of categories (SelectCategory[]) to populate a category selector.
 * 
 * Location:
 * /components/note-navigation/add-note-modal.tsx
 */
"use client";

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SelectCategory } from '@/db/schema/categories-schema';
import { createNoteAction } from '@/actions/notes-actions';
import { useAuth } from "@clerk/nextjs";
import { InsertNote, SelectNote } from "@/db/schema/notes-schema";

interface AddNoteModalProps {
  onClose: () => void;
  onNoteAdded: (newNote: SelectNote) => void;
  categories: SelectCategory[];
}

const AddNoteModal: React.FC<AddNoteModalProps> = ({ onClose, onNoteAdded, categories }) => {
  const { userId } = useAuth();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | undefined>(
    categories.length > 0 ? categories[0].id : undefined
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Title is required.");
      return;
    }
    if (!selectedCategoryId) {
      setError("Please select a category.");
      return;
    }
    setError(null);
    setIsSubmitting(true);

    if (!userId) {
      setError("User not authenticated. Please sign in.");
      setIsSubmitting(false);
      return;
    }

    const noteData: InsertNote = {
      title: title.trim(),
      content: content.trim() || "",
      categoryId: selectedCategoryId,
      userId: userId,
    };

    console.log("Submitting note:", noteData);
    try {
      const result = await createNoteAction(noteData);
      if (result.isSuccess && result.data) {
        onNoteAdded(result.data);
        onClose();
      } else {
        setError(result.message || "Failed to create note. Please try again.");
      }
    } catch (err: any) {
      console.error("Failed to create note:", err);
      setError(err instanceof Error ? err.message : "Failed to create note. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl max-w-lg w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Create New Note</h2>
          <Button variant="ghost" size="sm" onClick={onClose} disabled={isSubmitting}>&times;</Button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="note-title" className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <Input 
              id="note-title" 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              placeholder="Enter note title"
              disabled={isSubmitting}
              required
            />
          </div>

          <div>
            <label htmlFor="note-category" className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <Select 
              value={selectedCategoryId}
              onValueChange={setSelectedCategoryId}
              disabled={isSubmitting || categories.length === 0}
            >
              <SelectTrigger id="note-category">
                <SelectValue placeholder={categories.length === 0 ? "No categories available" : "Select a category"} />
              </SelectTrigger>
              <SelectContent>
                {categories.length > 0 ? (
                  categories.map(category => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="disabled" disabled>No categories available. Please create one or ensure base categories are loaded.</SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label htmlFor="note-content" className="block text-sm font-medium text-gray-700 mb-1">Content</label>
            <Textarea 
              id="note-content" 
              value={content} 
              onChange={(e) => setContent(e.target.value)} 
              placeholder="Enter note content (optional)"
              rows={6}
              disabled={isSubmitting}
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex justify-end space-x-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || !selectedCategoryId || !title.trim()}>
              {isSubmitting ? 'Creating...' : 'Create Note'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddNoteModal; 