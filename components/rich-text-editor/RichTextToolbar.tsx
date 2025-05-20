/**
 * RichTextToolbar Component
 *
 * Purpose:
 * Provides a toolbar with formatting options for the Tiptap rich text editor.
 *
 * Functionality:
 * - Receives a Tiptap editor instance as a prop.
 * - Displays buttons for common text formatting actions (bold, italic, headings, lists, etc.).
 * - Toggles formatting on the editor when buttons are clicked.
 * - Highlights active formatting options.
 *
 * Location: /components/rich-text-editor/RichTextToolbar.tsx
 */
"use client";

import React from 'react';
import { type Editor } from '@tiptap/react';
import {
  Bold,
  Italic,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Code,
  Undo,
  Redo,
} from 'lucide-react';
import { Toggle } from '@/components/ui/toggle';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

interface RichTextToolbarProps {
  editor: Editor | null;
}

const RichTextToolbar: React.FC<RichTextToolbarProps> = ({ editor }) => {
  if (!editor) {
    return null;
  }

  const iconSize = 18;

  return (
    <div className="p-2 border-b border-gray-200 bg-gray-50 rounded-t-md flex flex-wrap items-center gap-1">
      <Toggle
        size="sm"
        pressed={editor.isActive('bold')}
        onPressedChange={() => editor.chain().focus().toggleBold().run()}
        disabled={!editor.can().chain().focus().toggleBold().run()}
        aria-label="Toggle bold"
      >
        <Bold size={iconSize} />
      </Toggle>
      <Toggle
        size="sm"
        pressed={editor.isActive('italic')}
        onPressedChange={() => editor.chain().focus().toggleItalic().run()}
        disabled={!editor.can().chain().focus().toggleItalic().run()}
        aria-label="Toggle italic"
      >
        <Italic size={iconSize} />
      </Toggle>
      <Toggle
        size="sm"
        pressed={editor.isActive('strike')}
        onPressedChange={() => editor.chain().focus().toggleStrike().run()}
        disabled={!editor.can().chain().focus().toggleStrike().run()}
        aria-label="Toggle strikethrough"
      >
        <Strikethrough size={iconSize} />
      </Toggle>

      <Separator orientation="vertical" className="h-6 mx-1" />

      <Toggle
        size="sm"
        pressed={editor.isActive('heading', { level: 1 })}
        onPressedChange={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        disabled={!editor.can().chain().focus().toggleHeading({ level: 1 }).run()}
        aria-label="Toggle heading 1"
      >
        <Heading1 size={iconSize} />
      </Toggle>
      <Toggle
        size="sm"
        pressed={editor.isActive('heading', { level: 2 })}
        onPressedChange={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        disabled={!editor.can().chain().focus().toggleHeading({ level: 2 }).run()}
        aria-label="Toggle heading 2"
      >
        <Heading2 size={iconSize} />
      </Toggle>
      <Toggle
        size="sm"
        pressed={editor.isActive('heading', { level: 3 })}
        onPressedChange={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        disabled={!editor.can().chain().focus().toggleHeading({ level: 3 }).run()}
        aria-label="Toggle heading 3"
      >
        <Heading3 size={iconSize} />
      </Toggle>
      
      <Separator orientation="vertical" className="h-6 mx-1" />

      <Toggle
        size="sm"
        pressed={editor.isActive('bulletList')}
        onPressedChange={() => editor.chain().focus().toggleBulletList().run()}
        disabled={!editor.can().chain().focus().toggleBulletList().run()}
        aria-label="Toggle bullet list"
      >
        <List size={iconSize} />
      </Toggle>
      <Toggle
        size="sm"
        pressed={editor.isActive('orderedList')}
        onPressedChange={() => editor.chain().focus().toggleOrderedList().run()}
        disabled={!editor.can().chain().focus().toggleOrderedList().run()}
        aria-label="Toggle ordered list"
      >
        <ListOrdered size={iconSize} />
      </Toggle>
      <Toggle
        size="sm"
        pressed={editor.isActive('codeBlock')}
        onPressedChange={() => editor.chain().focus().toggleCodeBlock().run()}
        disabled={!editor.can().chain().focus().toggleCodeBlock().run()}
        aria-label="Toggle code block"
      >
        <Code size={iconSize} />
      </Toggle>

      <Separator orientation="vertical" className="h-6 mx-1" />

      {/* Color Picker Input */}
      <input
        type="color"
        onInput={(event) => editor.chain().focus().setColor((event.target as HTMLInputElement).value).run()}
        value={editor.getAttributes('textStyle').color || '#000000'} // Default to black or current color
        className="w-6 h-6 p-0 border-none rounded cursor-pointer bg-transparent"
        title="Set text color"
        aria-label="Set text color"
      />

      <Separator orientation="vertical" className="h-6 mx-1" />

      <Button
        variant="ghost"
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
        size="sm"
        aria-label="Undo"
      >
        <Undo size={iconSize} />
      </Button>
      <Button
        variant="ghost"
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
        size="sm"
        aria-label="Redo"
      >
        <Redo size={iconSize} />
      </Button>
    </div>
  );
};

export default RichTextToolbar; 