"use client";

import { forwardRef, useImperativeHandle, useRef } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import { type Editor } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";
import TiptapImage from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import {
  Bold,
  Italic,
  Underline,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Link as LinkIcon,
  Link2Off,
  Image as ImageIcon,
  Minus,
  Undo,
  Redo,
} from "lucide-react";

export type TiptapEditorHandle = {
  insertImage: (src: string) => void;
};

type TiptapEditorProps = {
  value: string;
  onChange: (html: string) => void;
};

// Save current selection pos so prompts (which blur the editor) don't lose it
function savedPos(editor: Editor): number {
  return editor.state.selection.anchor;
}

function ToolBtn({
  children,
  onClick,
  active,
  tooltip,
}: {
  children: React.ReactNode;
  onClick: (e: React.MouseEvent) => void;
  active: boolean;
  tooltip: string;
}) {
  return (
    <div className="relative group/tip">
      <button
        type="button"
        onMouseDown={(e) => {
          e.preventDefault();
          onClick(e);
        }}
        className={`flex h-7 w-7 items-center justify-center rounded-sm border transition-colors ${
          active
            ? "border-vcl-gold/60 bg-vcl-gold/10 text-vcl-gold"
            : "border-border text-muted-foreground hover:border-vcl-gold/40 hover:text-foreground"
        }`}
      >
        {children}
      </button>
      <span className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 whitespace-nowrap rounded-sm bg-card border border-border px-2 py-1 text-[10px] text-foreground opacity-0 group-hover/tip:opacity-100 transition-opacity z-50">
        {tooltip}
      </span>
    </div>
  );
}

function Sep() {
  return <span className="h-4 w-px bg-border mx-0.5" />;
}

export const TiptapEditor = forwardRef<TiptapEditorHandle, TiptapEditorProps>(
  function TiptapEditor({ value, onChange }, ref) {
    // Keep a ref to the last known selection anchor so prompts don't lose position
    const insertPosRef = useRef<number | null>(null);

    const editor = useEditor({
      extensions: [
        StarterKit.configure({
          heading: { levels: [2, 3] },
          bulletList: {},
          orderedList: {},
          blockquote: {},
          horizontalRule: {},
          link: {
            openOnClick: false,
            HTMLAttributes: { class: "text-vcl-gold hover:underline" },
          },
        }),
        TiptapImage.configure({
          HTMLAttributes: { class: "rounded-sm w-full my-4" },
        }),
        Placeholder.configure({
          placeholder: "Start writing your article…",
        }),
      ],
      content: value,
      onUpdate({ editor }) {
        onChange(editor.getHTML());
      },
      onSelectionUpdate({ editor }) {
        insertPosRef.current = savedPos(editor);
      },
      editorProps: {
        attributes: {
          class:
            "prose prose-invert prose-sm md:prose-base max-w-none min-h-[320px] px-4 py-3 focus:outline-none " +
            "prose-headings:font-heading prose-headings:tracking-wide " +
            "prose-a:text-vcl-gold prose-a:no-underline " +
            "prose-strong:text-foreground " +
            "prose-blockquote:border-l-4 prose-blockquote:border-vcl-gold prose-blockquote:text-muted-foreground",
        },
      },
      immediatelyRender: false,
    });

    useImperativeHandle(ref, () => ({
      insertImage: (src: string) => {
        if (!editor) return;
        const pos = insertPosRef.current;
        const chain = editor.chain().focus();
        if (pos !== null) {
          chain.setTextSelection(pos).setImage({ src }).run();
        } else {
          chain.setImage({ src }).run();
        }
      },
    }));

    if (!editor) return null;

    // For prompt-based actions: record pos on mousedown, then run after prompt
    const withSavedSelection = (fn: (pos: number) => void) => (e: React.MouseEvent) => {
      e.preventDefault();
      const pos = savedPos(editor);
      // Use setTimeout so the prompt opens after React finishes the event
      setTimeout(() => fn(pos), 0);
    };

    const handleLink = withSavedSelection((pos) => {
      // If cursor is on a link, remove it
      if (editor.isActive("link")) {
        editor.chain().focus().unsetLink().run();
        return;
      }
      const url = window.prompt("Enter URL (e.g. https://example.com)");
      if (!url?.trim()) return;
      const { from, to } = editor.state.selection;
      const hasSelection = from !== to;
      if (hasSelection) {
        editor.chain().focus().setLink({ href: url }).run();
      } else {
        const text = window.prompt("Link text (leave blank to use the URL)") || url;
        editor
          .chain()
          .focus()
          .setTextSelection(pos)
          .insertContent({ type: "text", text, marks: [{ type: "link", attrs: { href: url } }] })
          .run();
      }
    });

    const handlePullQuote = withSavedSelection((pos) => {
      const quote = window.prompt("Pull quote text");
      if (!quote?.trim()) return;
      const attribution = window.prompt("Attribution — who said it? (leave blank if none)") ?? "";
      const attr = attribution.trim();
      // Build as an HTML string and insert at saved position
      const html = [
        `<figure data-pull-quote>`,
        `<blockquote><p>${quote.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</p></blockquote>`,
        attr ? `<figcaption>${attr}</figcaption>` : ``,
        `</figure>`,
        `<p></p>`,
      ].join("");
      editor.chain().focus().setTextSelection(pos).insertContent(html, { parseOptions: { preserveWhitespace: "full" } }).run();
    });

    const handleImageByUrl = withSavedSelection((pos) => {
      const url = window.prompt("Enter image URL");
      if (!url?.trim()) return;
      editor.chain().focus().setTextSelection(pos).setImage({ src: url }).run();
    });

    return (
      <div className="rounded-sm border border-border bg-card">
        <div className="flex flex-wrap items-center gap-1 border-b border-border bg-secondary px-3 py-2">
          <ToolBtn active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()} tooltip="Bold">
            <Bold className="h-3.5 w-3.5" />
          </ToolBtn>
          <ToolBtn active={editor.isActive("italic")} onClick={() => { editor.chain().focus().toggleItalic().run(); }} tooltip="Italic">
            <Italic className="h-3.5 w-3.5" />
          </ToolBtn>
          <ToolBtn active={editor.isActive("underline")} onClick={() => editor.chain().focus().toggleUnderline().run()} tooltip="Underline">
            <Underline className="h-3.5 w-3.5" />
          </ToolBtn>
          <Sep />
          <ToolBtn active={editor.isActive("heading", { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} tooltip="Heading 2 — section title">
            <Heading2 className="h-3.5 w-3.5" />
          </ToolBtn>
          <ToolBtn active={editor.isActive("heading", { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} tooltip="Heading 3 — sub-section title">
            <Heading3 className="h-3.5 w-3.5" />
          </ToolBtn>
          <Sep />
          <ToolBtn active={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()} tooltip="Bullet list">
            <List className="h-3.5 w-3.5" />
          </ToolBtn>
          <ToolBtn active={editor.isActive("orderedList")} onClick={() => editor.chain().focus().toggleOrderedList().run()} tooltip="Numbered list">
            <ListOrdered className="h-3.5 w-3.5" />
          </ToolBtn>
          <ToolBtn active={false} onClick={handlePullQuote} tooltip="Insert pull quote with attribution">
            <Quote className="h-3.5 w-3.5" />
          </ToolBtn>
          <ToolBtn active={false} onClick={() => editor.chain().focus().setHorizontalRule().run()} tooltip="Insert horizontal divider">
            <Minus className="h-3.5 w-3.5" />
          </ToolBtn>
          <Sep />
          <ToolBtn active={editor.isActive("link")} onClick={handleLink} tooltip={editor.isActive("link") ? "Remove link" : "Insert link — select text first, or type link text after"}>
            {editor.isActive("link") ? <Link2Off className="h-3.5 w-3.5" /> : <LinkIcon className="h-3.5 w-3.5" />}
          </ToolBtn>
          <ToolBtn active={false} onClick={handleImageByUrl} tooltip="Insert image by URL">
            <ImageIcon className="h-3.5 w-3.5" />
          </ToolBtn>
          <Sep />
          <ToolBtn active={false} onClick={() => editor.chain().focus().undo().run()} tooltip="Undo">
            <Undo className="h-3.5 w-3.5" />
          </ToolBtn>
          <ToolBtn active={false} onClick={() => editor.chain().focus().redo().run()} tooltip="Redo">
            <Redo className="h-3.5 w-3.5" />
          </ToolBtn>
        </div>
        <EditorContent editor={editor} />
      </div>
    );
  }
);
