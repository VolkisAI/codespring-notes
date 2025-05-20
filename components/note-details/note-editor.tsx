/**
 * NoteEditor Component
 * 
 * Purpose:
 * Displays the main content area for a note using a Tiptap rich-text editor.
 * It updates the parent component with content changes for centralized saving.
 * 
 * Functionality:
 * - Initializes a Tiptap editor instance.
 * - Renders RichTextToolbar and EditorContent.
 * - Uses `initialContent` to set the editor's starting content.
 * - Calls `onContentChange` (passed from parent) when editor content is updated,
 *   allowing the parent to manage the content state and orchestrate saves.
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
// updateNoteAction is no longer called directly from here.

interface NoteEditorProps {
  noteId: string; // Still useful for context, though save is external
  initialContent: string;
  categoryColor?: string;
  onContentChange: (htmlContent: string) => void; // Mandatory callback
}

const CONTENT_UPDATE_DEBOUNCE_DELAY = 750; // ms to wait after typing stops to call onContentChange

const NoteEditor: React.FC<NoteEditorProps> = ({ 
  noteId, 
  initialContent, 
  categoryColor,
  onContentChange 
}) => {
  const updateTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Callback to inform parent of content change, debounced
  const debouncedNotifyParentOfChange = useCallback(
    (htmlContent: string) => {
      onContentChange(htmlContent);
      // console.log("NoteEditor: Notified parent of content change.");
    },
    [onContentChange]
  );

  const editor = useEditor({
    extensions: [
      StarterKit,
      TextStyle,
      Color,
      Placeholder.configure({
        placeholder: 'Start typing your note here...',
      }),
    ],
    content: initialContent, // Set initial content
    editorProps: {
      attributes: {
        class: 
          'prose prose-sm sm:prose lg:prose-lg xl:prose-xl max-w-none w-full h-full bg-white focus:outline-none p-5 min-h-[calc(100vh-300px)]',
      },
    },
    onUpdate: ({ editor: currentEditor }) => {
      const html = currentEditor.getHTML();
      
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
      updateTimeoutRef.current = setTimeout(() => {
        debouncedNotifyParentOfChange(html);
      }, CONTENT_UPDATE_DEBOUNCE_DELAY);
    },
    // onBlur: ({ editor: currentEditor }) => { // Alternative: update parent on blur
    //   const html = currentEditor.getHTML();
    //   onContentChange(html);
    //   if (updateTimeoutRef.current) clearTimeout(updateTimeoutRef.current); // Clear timeout if blur happens
    // }
  });

  // Effect to update editor content if initialContent prop changes from parent
  // This is important if the parent component might provide new initialContent
  // after the editor has already initialized (e.g. after a save and re-fetch).
  useEffect(() => {
    if (editor && editor.isEditable) {
      const currentEditorContent = editor.getHTML();
      if (initialContent !== currentEditorContent) {
        // console.log("NoteEditor: initialContent prop changed. Updating editor content.");
        editor.commands.setContent(initialContent, false); // false to avoid triggering onUpdate again
      }
    }
  }, [initialContent, editor]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
    };
  }, []);

  const editorWrapperStyle: React.CSSProperties = {
    border: `1px solid ${categoryColor || '#e0e0e0'}`,
    boxShadow: `0 0 12px ${categoryColor ? categoryColor + '30' : 'rgba(0, 0, 0, 0.08)'}`, 
    borderRadius: '0.375rem',
    overflow: 'hidden',
  };

  return (
    <div className="p-4 md:p-6 flex-grow bg-transparent">
      <div 
        className="w-full h-full bg-white flex flex-col shadow-md"
        style={editorWrapperStyle}
      >
        <RichTextToolbar editor={editor as Editor | null}/>
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