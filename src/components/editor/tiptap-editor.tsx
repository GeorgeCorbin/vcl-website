"use client";

import { forwardRef, useImperativeHandle, useRef, useState, useEffect } from "react";
import { useEditor, EditorContent, NodeViewWrapper, ReactNodeViewRenderer } from "@tiptap/react";
import { type Editor, type NodeViewProps } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";
import TiptapImage from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import UnderlineExtension from "@tiptap/extension-underline";
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
  X,
  Upload,
  Check,
} from "lucide-react";

// ── Constants ──────────────────────────────────────────────────────────────────

const SIZE_PRESETS = [
  { label: "¼",    value: "25%",        tip: "25% width" },
  { label: "½",    value: "50%",        tip: "50% width" },
  { label: "¾",    value: "75%",        tip: "75% width" },
  { label: "Full", value: null as string | null, tip: "Full width" },
];

// ── Helpers ────────────────────────────────────────────────────────────────────

function savedPos(editor: Editor): number {
  return editor.state.selection.anchor;
}

function ToolBtn({
  children, onClick, active, tooltip,
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
        onMouseDown={(e) => { e.preventDefault(); onClick(e); }}
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

// ── Image NodeView ─────────────────────────────────────────────────────────────
// Renders inline controls below the image when it is selected.
// Controls are stopPropagation-isolated so ProseMirror doesn't deselect the
// node when the user interacts with size buttons or the credit input.

function ImageNodeView({ node, updateAttributes, selected }: NodeViewProps) {
  const { src, alt, width, credit } = node.attrs as {
    src: string; alt?: string; width?: string | null; credit?: string | null;
  };

  const [creditDraft, setCreditDraft] = useState<string>(credit ?? "");
  const [creditDirty, setCreditDirty] = useState(false);
  const prevCreditRef = useRef<string | null | undefined>(credit);

  // Sync draft when stored credit changes (new image selected or after apply)
  useEffect(() => {
    if (credit !== prevCreditRef.current) {
      prevCreditRef.current = credit;
      setCreditDraft(credit ?? "");
      setCreditDirty(false);
    }
  }, [credit]);

  const applyCredit = () => {
    const val = creditDraft.trim() || null;
    updateAttributes({ credit: val });
    setCreditDirty(false);
  };

  const imgStyle: React.CSSProperties = width
    ? { width, height: "auto", display: "block", marginLeft: "auto", marginRight: "auto" }
    : {};

  return (
    <NodeViewWrapper as="div" className="my-4">
      {/* The actual image */}
      <img
        src={src}
        alt={alt ?? ""}
        className={`rounded-sm${width ? "" : " w-full"}`}
        style={imgStyle}
        data-credit={credit || undefined}
        draggable="false"
      />

      {/* Controls – only visible when the node is selected */}
      {selected && (
        <div
          // Stop mousedown/click from reaching ProseMirror so the node stays
          // selected while the user interacts with controls.
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
          className="mt-1.5 flex flex-wrap items-center gap-2 rounded-sm border border-vcl-gold/30 bg-card px-3 py-2"
        >
          <span className="text-[10px] font-bold tracking-[0.1em] text-muted-foreground uppercase shrink-0">
            Size
          </span>
          {SIZE_PRESETS.map(({ label, value, tip }) => {
            const isActive = (width ?? null) === value;
            return (
              <button
                key={label}
                type="button"
                title={tip}
                onClick={() => updateAttributes({ width: value })}
                className={`h-6 min-w-[30px] px-1.5 rounded-sm border text-[11px] font-semibold transition-colors ${
                  isActive
                    ? "border-vcl-gold/60 bg-vcl-gold/10 text-vcl-gold"
                    : "border-border text-muted-foreground hover:border-vcl-gold/40 hover:text-foreground"
                }`}
              >
                {label}
              </button>
            );
          })}

          <span className="h-4 w-px bg-border mx-0.5 shrink-0" />

          <span className="text-[10px] font-bold tracking-[0.1em] text-muted-foreground uppercase shrink-0">
            Credit
          </span>
          <input
            type="text"
            placeholder="Photographer name…"
            value={creditDraft}
            onChange={(e) => {
              const val = e.target.value;
              setCreditDraft(val);
              setCreditDirty(val !== (credit ?? ""));
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") { e.preventDefault(); applyCredit(); }
              if (e.key === "Escape") { setCreditDraft(credit ?? ""); setCreditDirty(false); }
            }}
            className="h-6 flex-1 min-w-[160px] rounded-sm border border-border bg-background px-2 text-xs focus:outline-none focus:border-vcl-gold/60"
          />
          {/* Confirm button – appears only while the draft differs from saved */}
          {creditDirty && (
            <button
              type="button"
              title="Confirm credit"
              onClick={applyCredit}
              className="h-6 w-6 flex items-center justify-center rounded-sm border border-vcl-gold/40 text-vcl-gold hover:bg-vcl-gold/10 transition-colors shrink-0"
            >
              <Check className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      )}
    </NodeViewWrapper>
  );
}

// ── Extended Image node ────────────────────────────────────────────────────────

const ResizableImage = TiptapImage.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      width: {
        default: null,
        renderHTML: (attributes) => {
          if (!attributes.width) return {};
          return { style: `width: ${attributes.width}; height: auto; display: block; margin-left: auto; margin-right: auto;` };
        },
        parseHTML: (element) => (element as HTMLImageElement).style.width || null,
      },
      credit: {
        default: null,
        renderHTML: (attributes) => {
          if (!attributes.credit) return {};
          return { "data-credit": attributes.credit };
        },
        parseHTML: (element) => element.getAttribute("data-credit") || null,
      },
    };
  },
  addNodeView() {
    return ReactNodeViewRenderer(ImageNodeView);
  },
});

// ── Types ──────────────────────────────────────────────────────────────────────

export type TiptapEditorHandle = {
  insertImage: (src: string, credit?: string) => void;
  setContent: (html: string) => void;
};

type TiptapEditorProps = {
  value: string;
  onChange: (html: string) => void;
  onImageUpload?: (file: File) => Promise<string | null>;
};

type LinkPanelState = {
  from: number; to: number; pos: number;
  hasSelection: boolean; isOnLink: boolean;
} | null;

type ImagePanelState = { pos: number } | null;

// ── Editor ─────────────────────────────────────────────────────────────────────

export const TiptapEditor = forwardRef<TiptapEditorHandle, TiptapEditorProps>(
  function TiptapEditor({ value, onChange, onImageUpload }, ref) {
    const insertPosRef = useRef<number | null>(null);

    // Link panel
    const [linkPanel, setLinkPanel] = useState<LinkPanelState>(null);
    const [linkUrl, setLinkUrl] = useState("");
    const [linkText, setLinkText] = useState("");
    const linkUrlInputRef = useRef<HTMLInputElement>(null);

    // Image insert panel (toolbar button)
    const [imagePanel, setImagePanel] = useState<ImagePanelState>(null);
    const [imageUrl, setImageUrl] = useState("");
    const [isUploadingImage, setIsUploadingImage] = useState(false);

    const editor = useEditor({
      extensions: [
        StarterKit.configure({
          heading: { levels: [2, 3] },
          bulletList: {},
          orderedList: {},
          blockquote: {},
          horizontalRule: {},
        }),
        Link.configure({
          openOnClick: false,
          HTMLAttributes: { class: "text-vcl-gold hover:underline" },
        }),
        UnderlineExtension,
        ResizableImage.configure({
          HTMLAttributes: { class: "rounded-sm w-full" },
        }),
        Placeholder.configure({ placeholder: "Start writing your article…" }),
      ],
      content: value,
      onUpdate({ editor }) { onChange(editor.getHTML()); },
      onSelectionUpdate({ editor }) { insertPosRef.current = savedPos(editor); },
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

    useEffect(() => {
      if (linkPanel) linkUrlInputRef.current?.focus();
    }, [linkPanel]);

    useImperativeHandle(ref, () => ({
      insertImage: (src: string, credit?: string) => {
        if (!editor) return;
        const pos = insertPosRef.current;
        const attrs: Record<string, unknown> = { src };
        if (credit) attrs.credit = credit;
        const chain = editor.chain().focus();
        if (pos !== null) {
          chain.setTextSelection(pos).insertContent({ type: "image", attrs }).run();
        } else {
          chain.insertContent({ type: "image", attrs }).run();
        }
      },
      setContent: (html: string) => {
        if (!editor) return;
        editor.commands.setContent(html || "", { emitUpdate: false });
      },
    }));

    if (!editor) return null;

    // ── Link panel ──────────────────────────────────────────────────────────

    const openLinkPanel = (e: React.MouseEvent) => {
      e.preventDefault();
      if (linkPanel) { setLinkPanel(null); return; }
      setImagePanel(null); setImageUrl("");

      const { from, to } = editor.state.selection;
      const pos = savedPos(editor);
      const hasSelection = from !== to;
      const isOnLink = editor.isActive("link");
      const existingUrl = editor.getAttributes("link").href ?? "";
      const selectedText = hasSelection ? editor.state.doc.textBetween(from, to) : "";

      setLinkUrl(existingUrl);
      setLinkText(selectedText);
      setLinkPanel({ from, to, pos, hasSelection, isOnLink });
    };

    const applyLink = () => {
      if (!linkPanel) return;
      const url = linkUrl.trim();
      if (!url) return;
      const { from, to, pos, hasSelection } = linkPanel;
      if (hasSelection) {
        editor.chain().focus().setTextSelection({ from, to }).setLink({ href: url }).run();
      } else {
        const text = linkText.trim() || url;
        editor.chain().focus().setTextSelection(pos)
          .insertContent({ type: "text", text, marks: [{ type: "link", attrs: { href: url } }] })
          .run();
      }
      setLinkPanel(null); setLinkUrl(""); setLinkText("");
    };

    const removeLink = () => {
      editor.chain().focus().unsetLink().run();
      setLinkPanel(null);
    };

    // ── Image insert panel ──────────────────────────────────────────────────

    const openImagePanel = (e: React.MouseEvent) => {
      e.preventDefault();
      if (imagePanel) { setImagePanel(null); return; }
      setLinkPanel(null); setLinkUrl(""); setLinkText(""); setImageUrl("");
      setImagePanel({ pos: savedPos(editor) });
    };

    const applyImageByUrl = () => {
      if (!imagePanel) return;
      const url = imageUrl.trim();
      if (!url) return;
      editor.chain().focus().setTextSelection(imagePanel.pos)
        .insertContent({ type: "image", attrs: { src: url } }).run();
      setImagePanel(null); setImageUrl("");
    };

    const handleImageFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file || !onImageUpload) return;
      const pos = imagePanel?.pos ?? insertPosRef.current;
      setIsUploadingImage(true);
      try {
        const src = await onImageUpload(file);
        if (src) {
          const chain = editor.chain().focus();
          if (pos !== null) {
            chain.setTextSelection(pos).insertContent({ type: "image", attrs: { src } }).run();
          } else {
            chain.insertContent({ type: "image", attrs: { src } }).run();
          }
          setImagePanel(null); setImageUrl("");
        }
      } finally {
        setIsUploadingImage(false);
        if (e.target) e.target.value = "";
      }
    };

    // ── Pull quote ──────────────────────────────────────────────────────────

    const handlePullQuote = (e: React.MouseEvent) => {
      e.preventDefault();
      const pos = savedPos(editor);
      setTimeout(() => {
        const quote = window.prompt("Pull quote text");
        if (!quote?.trim()) return;
        const attribution = window.prompt("Attribution — who said it? (leave blank if none)") ?? "";
        const attr = attribution.trim();
        const html = [
          `<figure data-pull-quote>`,
          `<blockquote><p>${quote.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</p></blockquote>`,
          attr ? `<figcaption>${attr}</figcaption>` : ``,
          `</figure><p></p>`,
        ].join("");
        editor.chain().focus().setTextSelection(pos)
          .insertContent(html, { parseOptions: { preserveWhitespace: "full" } }).run();
      }, 0);
    };

    return (
      <>
        {/* Hover / selected ring on images inside the editor */}
        <style>{`
          .ProseMirror img { cursor: pointer; transition: outline 0.1s; }
          .ProseMirror img:hover { outline: 2px dashed rgba(212,175,55,0.35); outline-offset: 3px; border-radius: 2px; }
          .ProseMirror-selectednode img { outline: 2px solid rgba(212,175,55,0.65); outline-offset: 3px; border-radius: 2px; }
        `}</style>

        <div className="rounded-sm border border-border bg-card">
          {/* ── Toolbar ── */}
          <div className="flex flex-wrap items-center gap-1 border-b border-border bg-secondary px-3 py-2">
            <ToolBtn active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()} tooltip="Bold">
              <Bold className="h-3.5 w-3.5" />
            </ToolBtn>
            <ToolBtn active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()} tooltip="Italic">
              <Italic className="h-3.5 w-3.5" />
            </ToolBtn>
            <ToolBtn active={editor.isActive("underline")} onClick={() => editor.chain().focus().toggleUnderline().run()} tooltip="Underline">
              <Underline className="h-3.5 w-3.5" />
            </ToolBtn>
            <Sep />
            <ToolBtn active={editor.isActive("heading", { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} tooltip="Heading 2">
              <Heading2 className="h-3.5 w-3.5" />
            </ToolBtn>
            <ToolBtn active={editor.isActive("heading", { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} tooltip="Heading 3">
              <Heading3 className="h-3.5 w-3.5" />
            </ToolBtn>
            <Sep />
            <ToolBtn active={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()} tooltip="Bullet list">
              <List className="h-3.5 w-3.5" />
            </ToolBtn>
            <ToolBtn active={editor.isActive("orderedList")} onClick={() => editor.chain().focus().toggleOrderedList().run()} tooltip="Numbered list">
              <ListOrdered className="h-3.5 w-3.5" />
            </ToolBtn>
            <ToolBtn active={false} onClick={handlePullQuote} tooltip="Insert pull quote">
              <Quote className="h-3.5 w-3.5" />
            </ToolBtn>
            <ToolBtn active={false} onClick={() => editor.chain().focus().setHorizontalRule().run()} tooltip="Horizontal divider">
              <Minus className="h-3.5 w-3.5" />
            </ToolBtn>
            <Sep />
            <ToolBtn
              active={editor.isActive("link") || !!linkPanel}
              onClick={openLinkPanel}
              tooltip={editor.isActive("link") ? "Edit / remove link" : "Insert link"}
            >
              {editor.isActive("link") ? <Link2Off className="h-3.5 w-3.5" /> : <LinkIcon className="h-3.5 w-3.5" />}
            </ToolBtn>
            <ToolBtn active={!!imagePanel} onClick={openImagePanel} tooltip="Insert image">
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

          {/* ── Link panel ── */}
          {linkPanel && (
            <div className="flex flex-wrap items-center gap-2 border-b border-border bg-secondary/60 px-3 py-2">
              <input
                ref={linkUrlInputRef}
                type="url"
                placeholder="https://example.com"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") { e.preventDefault(); applyLink(); }
                  if (e.key === "Escape") setLinkPanel(null);
                }}
                className="h-7 flex-1 min-w-[200px] rounded-sm border border-border bg-background px-2 text-sm focus:outline-none focus:border-vcl-gold/60"
              />
              {!linkPanel.hasSelection && (
                <input
                  type="text"
                  placeholder="Link text (leave blank to use the URL)"
                  value={linkText}
                  onChange={(e) => setLinkText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") { e.preventDefault(); applyLink(); }
                    if (e.key === "Escape") setLinkPanel(null);
                  }}
                  className="h-7 flex-1 min-w-[180px] rounded-sm border border-border bg-background px-2 text-sm focus:outline-none focus:border-vcl-gold/60"
                />
              )}
              {linkPanel.isOnLink && (
                <button type="button" onClick={removeLink}
                  className="h-7 px-2.5 rounded-sm border border-red-500/40 text-xs text-red-400 hover:bg-red-500/10 transition-colors shrink-0">
                  Remove link
                </button>
              )}
              <button type="button" onClick={applyLink} disabled={!linkUrl.trim()}
                className="h-7 px-2.5 rounded-sm bg-vcl-gold text-xs font-semibold text-vcl-gold-foreground hover:bg-vcl-gold/90 disabled:opacity-40 transition-colors shrink-0">
                Apply
              </button>
              <button type="button" onClick={() => setLinkPanel(null)}
                className="h-7 w-7 flex items-center justify-center rounded-sm border border-border text-muted-foreground hover:text-foreground transition-colors shrink-0">
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          )}

          {/* ── Image insert panel ── */}
          {imagePanel && (
            <div className="flex flex-wrap items-center gap-2 border-b border-border bg-secondary/60 px-3 py-2">
              {onImageUpload && (
                <>
                  <label className={`inline-flex cursor-pointer items-center gap-1.5 h-7 rounded-sm border border-border px-2.5 text-xs font-semibold transition-colors shrink-0 ${
                    isUploadingImage ? "opacity-50 cursor-not-allowed text-muted-foreground" : "text-muted-foreground hover:border-vcl-gold/40 hover:text-vcl-gold"
                  }`}>
                    <Upload className="h-3 w-3" />
                    {isUploadingImage ? "Uploading…" : "Upload file"}
                    <input type="file" accept="image/*" className="hidden" disabled={isUploadingImage} onChange={handleImageFileUpload} />
                  </label>
                  <span className="text-xs text-muted-foreground">or paste a URL</span>
                </>
              )}
              <input
                type="url"
                placeholder="https://example.com/image.jpg"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") { e.preventDefault(); applyImageByUrl(); }
                  if (e.key === "Escape") setImagePanel(null);
                }}
                className="h-7 flex-1 min-w-[220px] rounded-sm border border-border bg-background px-2 text-sm focus:outline-none focus:border-vcl-gold/60"
              />
              <button type="button" onClick={applyImageByUrl} disabled={!imageUrl.trim()}
                className="h-7 px-2.5 rounded-sm bg-vcl-gold text-xs font-semibold text-vcl-gold-foreground hover:bg-vcl-gold/90 disabled:opacity-40 transition-colors shrink-0">
                Insert
              </button>
              <button type="button" onClick={() => setImagePanel(null)}
                className="h-7 w-7 flex items-center justify-center rounded-sm border border-border text-muted-foreground hover:text-foreground transition-colors shrink-0">
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          )}

          <EditorContent editor={editor} />
        </div>

        <p className="mt-1.5 px-1 text-[11px] text-muted-foreground/50">
          Click any image to resize or set a photo credit
        </p>
      </>
    );
  }
);
