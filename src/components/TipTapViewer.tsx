"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Highlight from "@tiptap/extension-highlight";

interface TipTapViewerProps {
  content: string;
}

export default function TipTapViewer({ content }: TipTapViewerProps) {
  const editor = useEditor({
    extensions: [StarterKit, Highlight],
    content,
    immediatelyRender: false,
    editable: false,
    editorProps: {
      attributes: {
        class: "prose prose-invert prose-sm max-w-none",
      },
    },
  });

  if (!editor) return null;

  return <EditorContent editor={editor} />;
}
