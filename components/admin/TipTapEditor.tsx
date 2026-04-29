"use client";

import * as React from "react";
import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import { StarterKit } from "@tiptap/starter-kit";
import { Link } from "@tiptap/extension-link";
import { Image } from "@tiptap/extension-image";
import { Youtube } from "@tiptap/extension-youtube";
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableCell } from "@tiptap/extension-table-cell";
import { TableHeader } from "@tiptap/extension-table-header";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Heading3,
  Link as LinkIcon,
  Code,
  Quote,
  Minus,
  Undo2,
  Redo2,
  Image as ImageIcon,
  Film as YoutubeIcon,
  Table as TableIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  initial: string;
  onChange: (html: string) => void;
  placeholder?: string;
};

export function TipTapEditor({ initial, onChange, placeholder }: Props) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({ openOnClick: false, HTMLAttributes: { rel: "noreferrer noopener", target: "_blank" } }),
      Image.configure({ inline: false }),
      Youtube.configure({ inline: false, controls: true, modestBranding: true }),
      Table.configure({ resizable: false }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    content: initial,
    editorProps: {
      attributes: {
        class: "prose prose-neutral dark:prose-invert max-w-none min-h-[180px] p-4 focus:outline-none",
        "aria-label": placeholder ?? "Éditeur de contenu",
      },
    },
    immediatelyRender: false,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  });

  if (!editor) {
    return (
      <div className="rounded-xl border border-input bg-background min-h-[220px] animate-pulse" />
    );
  }

  const wordCount = editor.storage.characterCount?.words?.() ?? null;
  const charCount = editor.getText().length;

  return (
    <div className="rounded-xl border border-input bg-background overflow-hidden">
      <Toolbar editor={editor} />
      <EditorContent editor={editor} />
      <div className="px-3 py-2 text-[11px] text-muted-foreground border-t border-input flex justify-between">
        <span>
          {charCount} caractère{charCount > 1 ? "s" : ""}
          {wordCount !== null && ` · ${wordCount} mot${wordCount > 1 ? "s" : ""}`}
        </span>
        <span>Markdown supporté</span>
      </div>
    </div>
  );
}

function ToolbarButton({
  active,
  onClick,
  label,
  children,
}: {
  active?: boolean;
  onClick: () => void;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      aria-label={label}
      aria-pressed={active}
      className={cn(
        "h-8 w-8 rounded-md flex items-center justify-center text-sm transition-colors",
        active ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-muted"
      )}
    >
      {children}
    </button>
  );
}

function Toolbar({ editor }: { editor: Editor }) {
  const promptLink = () => {
    const previous = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("URL du lien", previous ?? "https://");
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  const insertImage = () => {
    const url = window.prompt("URL de l'image");
    if (!url) return;
    editor.chain().focus().setImage({ src: url, alt: "" }).run();
  };

  const insertYoutube = () => {
    const url = window.prompt("URL YouTube");
    if (!url) return;
    editor.chain().focus().setYoutubeVideo({ src: url }).run();
  };

  const insertTable = () => {
    editor
      .chain()
      .focus()
      .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
      .run();
  };

  return (
    <div className="border-b border-input p-2 flex flex-wrap items-center gap-1">
      <ToolbarButton
        label="Titre 1"
        active={editor.isActive("heading", { level: 1 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
      >
        <Heading1 className="w-4 h-4" />
      </ToolbarButton>
      <ToolbarButton
        label="Titre 2"
        active={editor.isActive("heading", { level: 2 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
      >
        <Heading2 className="w-4 h-4" />
      </ToolbarButton>
      <ToolbarButton
        label="Titre 3"
        active={editor.isActive("heading", { level: 3 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
      >
        <Heading3 className="w-4 h-4" />
      </ToolbarButton>
      <span className="w-px h-6 bg-border mx-1" />
      <ToolbarButton
        label="Gras"
        active={editor.isActive("bold")}
        onClick={() => editor.chain().focus().toggleBold().run()}
      >
        <Bold className="w-4 h-4" />
      </ToolbarButton>
      <ToolbarButton
        label="Italique"
        active={editor.isActive("italic")}
        onClick={() => editor.chain().focus().toggleItalic().run()}
      >
        <Italic className="w-4 h-4" />
      </ToolbarButton>
      <ToolbarButton
        label="Souligné"
        active={editor.isActive("underline")}
        onClick={() => editor.chain().focus().toggleStrike().run()}
      >
        <UnderlineIcon className="w-4 h-4" />
      </ToolbarButton>
      <span className="w-px h-6 bg-border mx-1" />
      <ToolbarButton
        label="Liste à puces"
        active={editor.isActive("bulletList")}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
      >
        <List className="w-4 h-4" />
      </ToolbarButton>
      <ToolbarButton
        label="Liste numérotée"
        active={editor.isActive("orderedList")}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
      >
        <ListOrdered className="w-4 h-4" />
      </ToolbarButton>
      <ToolbarButton
        label="Citation"
        active={editor.isActive("blockquote")}
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
      >
        <Quote className="w-4 h-4" />
      </ToolbarButton>
      <ToolbarButton
        label="Code"
        active={editor.isActive("codeBlock")}
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
      >
        <Code className="w-4 h-4" />
      </ToolbarButton>
      <ToolbarButton
        label="Séparateur"
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
      >
        <Minus className="w-4 h-4" />
      </ToolbarButton>
      <span className="w-px h-6 bg-border mx-1" />
      <ToolbarButton
        label="Lien"
        active={editor.isActive("link")}
        onClick={promptLink}
      >
        <LinkIcon className="w-4 h-4" />
      </ToolbarButton>
      <ToolbarButton label="Image (URL)" onClick={insertImage}>
        <ImageIcon className="w-4 h-4" />
      </ToolbarButton>
      <ToolbarButton label="YouTube" onClick={insertYoutube}>
        <YoutubeIcon className="w-4 h-4" />
      </ToolbarButton>
      <ToolbarButton label="Tableau" onClick={insertTable}>
        <TableIcon className="w-4 h-4" />
      </ToolbarButton>
      <span className="w-px h-6 bg-border mx-1 ml-auto" />
      <ToolbarButton label="Annuler" onClick={() => editor.chain().focus().undo().run()}>
        <Undo2 className="w-4 h-4" />
      </ToolbarButton>
      <ToolbarButton label="Rétablir" onClick={() => editor.chain().focus().redo().run()}>
        <Redo2 className="w-4 h-4" />
      </ToolbarButton>
    </div>
  );
}
