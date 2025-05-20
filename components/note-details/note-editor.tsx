/**
 * NoteEditor Component
 * 
 * Purpose:
 * Displays the main content area for a note using a Tiptap rich-text editor.
 * It includes a toolbar for formatting options.
 * 
 * Functionality:
 * - Initializes a Tiptap editor instance with StarterKit and Placeholder extensions.
 * - Renders RichTextToolbar, passing the editor instance.
 * - Renders EditorContent for the actual text editing area.
 * - Uses initialContent to set the editor's starting content.
 * - Logs content changes for debugging.
 * - (Future) Will handle content changes and saving.
 * 
 * Location: /components/note-details/note-editor.tsx
 */
"use client";

import React, { useEffect, useCallback, useState, useRef } from 'react';
import { useEditor, EditorContent, Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { Color } from '@tiptap/extension-color';
import TextStyle from '@tiptap/extension-text-style';
import RichTextToolbar from '@/components/rich-text-editor/RichTextToolbar';
import { updateNoteAction } from '@/actions/notes-actions';

interface NoteEditorProps {
  noteId: string; // For saving
  initialContent: string;
  categoryColor?: string;
  onContentChange?: (htmlContent: string) => void; // Optional: for immediate parent feedback
}

const SAVE_DEBOUNCE_DELAY = 1500; // 1.5 seconds

const NoteEditor: React.FC<NoteEditorProps> = ({ 
  noteId, 
  initialContent, 
  categoryColor,
  onContentChange 
}) => {
  const [isSaving, setIsSaving] = useState(false);
  const [lastSavedContent, setLastSavedContent] = useState(initialContent);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Debounced save function
  const debouncedSave = useCallback(
    async (htmlContent: string) => {
      if (htmlContent === lastSavedContent) {
        console.log("NoteEditor: Content unchanged, skipping save.");
        return;
      }
      setIsSaving(true);
      console.log("NoteEditor: Debounced save triggered for noteId:", noteId);
      try {
        const result = await updateNoteAction(noteId, { content: htmlContent });
        if (result.isSuccess) {
          console.log("NoteEditor: Content saved successfully.");
          setLastSavedContent(htmlContent);
        } else {
          console.error("NoteEditor: Failed to save content - ", result.message);
          // TODO: Consider adding user feedback for save failure (e.g., toast notification)
        }
      } catch (error) {
        console.error("NoteEditor: Error during debounced save - ", error);
        // TODO: User feedback
      }
      setIsSaving(false);
    },
    [noteId, lastSavedContent] // Dependencies for useCallback
  );

  const editor = useEditor({
    extensions: [
      StarterKit, // Using default StarterKit to ensure all basic extensions are enabled
      TextStyle, // Added TextStyle
      Color, // Added Color
      Placeholder.configure({
        placeholder: 'Start typing your note here...',
      }),
    ],
    content: initialContent,
    editorProps: {
      attributes: {
        class: 
          'prose prose-sm sm:prose lg:prose-lg xl:prose-xl max-w-none w-full h-full bg-white focus:outline-none p-5 min-h-[calc(100vh-300px)]',
      },
    },
    onUpdate: ({ editor: currentEditor }) => {
      const html = currentEditor.getHTML();
      if (onContentChange) {
        onContentChange(html);
      }

      // Clear previous timeout
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      // Setup a new timeout to call debouncedSave
      saveTimeoutRef.current = setTimeout(() => {
        debouncedSave(html);
      }, SAVE_DEBOUNCE_DELAY);
    },
  });

  // Effect to clear timeout on unmount or if editor/debouncedSave changes
  useEffect(() => {
    // Cleanup function to clear the timeout
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []); // Empty dependency array means this runs on mount and cleans up on unmount

  useEffect(() => {
    if (editor && editor.isEditable) {
      const currentEditorContent = editor.getHTML();
      if (initialContent !== currentEditorContent) {
        console.log("NoteEditor: useEffect - initialContent changed. Updating editor content.");
        console.log("NoteEditor: useEffect - Old editor content:", currentEditorContent);
        console.log("NoteEditor: useEffect - New initialContent:", initialContent);
        editor.commands.setContent(initialContent, false); 
        setLastSavedContent(initialContent); // Update lastSavedContent when initialContent changes
      }
    }
  }, [initialContent, editor]);

  // Style for the outer container with border and glow
  const editorWrapperStyle: React.CSSProperties = {
    border: `1px solid ${categoryColor || '#e0e0e0'}`, // Default to a light gray
    boxShadow: `0 0 12px ${categoryColor ? categoryColor + '30' : 'rgba(0, 0, 0, 0.08)'}`, 
    borderRadius: '0.375rem', // Corresponds to rounded-md
    overflow: 'hidden', // To ensure children (toolbar, editor content) respect border radius
  };

  return (
    <div className="p-4 md:p-6 flex-grow bg-transparent">
      <div 
        className="w-full h-full bg-white flex flex-col shadow-md"
        style={editorWrapperStyle}
      >
        <RichTextToolbar editor={editor as Editor | null}/>
        {/* Inner container for the dashed border effect and EditorContent */}
        <div className="relative flex-grow p-2 bg-white">
          <div 
            className="absolute inset-2 border-2 border-dashed border-gray-300 rounded pointer-events-none"
            aria-hidden="true"
          ></div>
          <div className="relative z-10 h-full">
            <EditorContent editor={editor as Editor | null} className="h-full" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default NoteEditor; 