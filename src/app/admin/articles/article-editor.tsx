"use client";

import Image from "next/image";
import { useMemo, useRef, useState, useTransition } from "react";
import { uploadImageAction } from "./actions";
import { isUploadedImage } from "@/lib/upload-path";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Type, Eye, ImageIcon, Calendar } from "lucide-react";
import { ArticleStatus, League } from "@prisma/client";

type ArticleEditorProps = {
  mode: "create" | "edit";
  article?: {
    id: string;
    title: string;
    slug: string;
    excerpt: string | null;
    content: string;
    coverImage: string | null;
    status: ArticleStatus;
    featured: boolean;
    author: string | null;
    league?: League | null;
    publishedAt?: Date | null;
  };
  initialImages: string[];
  leagues: { id: string; name: string; code: string }[];
  formAction: (formData: FormData) => Promise<void>;
  deleteSlot?: React.ReactNode;
};

const statuses: { label: string; value: ArticleStatus }[] = [
  { label: "Draft", value: "DRAFT" },
  { label: "Published", value: "PUBLISHED" },
  { label: "Archived", value: "ARCHIVED" },
];

const MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024;
const MAX_ARTICLE_PAYLOAD_BYTES = 20 * 1024 * 1024;

function formatMegabytes(bytes: number) {
  return `${Math.round(bytes / (1024 * 1024))} MB`;
}

function getSaveErrorMessage(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error);
  if (message.includes("Body exceeded") || message.includes("413")) {
    return "This article is too large to save. Upload images separately using the image uploader instead of embedding them in the content.";
  }
  return message || "Failed to save article. Please try again.";
}

function estimateArticlePayloadSize(fields: Record<string, string>) {
  return new Blob(Object.values(fields)).size;
}

export function ArticleEditor({ mode, article, initialImages, leagues, formAction, deleteSlot }: ArticleEditorProps) {
  const [title, setTitle] = useState(article?.title ?? "");
  const [slug, setSlug] = useState(article?.slug ?? "");
  const [excerpt, setExcerpt] = useState(article?.excerpt ?? "");
  const [content, setContent] = useState(article?.content ?? "");
  const [coverPreview, setCoverPreview] = useState(article?.coverImage ?? "");
  const [selectedStatus, setSelectedStatus] = useState<ArticleStatus>(article?.status ?? "DRAFT");
  const [featured, setFeatured] = useState(article?.featured ?? false);
  const [author, setAuthor] = useState(article?.author ?? "");
  const [league, setLeague] = useState<string>(article?.league ?? (leagues[0]?.code || ""));
  const [publishDate, setPublishDate] = useState(
    article?.publishedAt ? new Date(article.publishedAt).toISOString().slice(0, 16) : ""
  );
  const [showPreview, setShowPreview] = useState(false);
  const [images, setImages] = useState(initialImages);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverError, setCoverError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleTitleChange = (value: string) => {
    setTitle(value);
    if (!article?.slug && slug.trim().length === 0) {
      const generated = value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
      setSlug(generated);
    }
  };

  const insertTag = (openTag: string, closeTag = "") => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    const newContent =
      selectedText.length > 0
        ? `${content.substring(0, start)}${openTag}${selectedText}${closeTag}${content.substring(end)}`
        : `${content.substring(0, start)}${openTag}${closeTag}${content.substring(end)}`;
    const cursorPosition = start + openTag.length + selectedText.length + closeTag.length;
    setContent(newContent);
    requestAnimationFrame(() => {
      textarea.focus();
      textarea.setSelectionRange(cursorPosition, cursorPosition);
    });
  };

  const insertAtCursor = (text: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const newText = content.substring(0, start) + text + content.substring(start);
    setContent(newText);
    requestAnimationFrame(() => {
      textarea.focus();
      textarea.setSelectionRange(start + text.length, start + text.length);
    });
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_FILE_SIZE_BYTES) {
      setUploadError(`Images must be ${formatMegabytes(MAX_FILE_SIZE_BYTES)} or smaller.`);
      event.target.value = "";
      return;
    }
    setIsUploading(true);
    setUploadError(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const result = await uploadImageAction(formData);
      if (result.error) {
        setUploadError(result.error);
      } else if (result.path) {
        setImages((prev) => [result.path!, ...prev]);
      }
    } catch (error) {
      setUploadError(getSaveErrorMessage(error));
    } finally {
      setIsUploading(false);
      if (event.target) event.target.value = "";
    }
  };

  const handleCoverChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setCoverError(null);
    if (file.size > MAX_FILE_SIZE_BYTES) {
      setCoverError(`Cover image must be ${formatMegabytes(MAX_FILE_SIZE_BYTES)} or smaller.`);
      event.target.value = "";
      return;
    }
    setCoverFile(file);
    const previewUrl = URL.createObjectURL(file);
    setCoverPreview(previewUrl);
  };

  const handleSubmit = (formData: FormData) => {
    setSubmitError(null);
    startTransition(async () => {
      try {
        let coverPath = "";
        if (coverPreview) {
          if (coverFile) {
            const uploadFormData = new FormData();
            uploadFormData.append("file", coverFile);
            const result = await uploadImageAction(uploadFormData);
            if (result.error) {
              setSubmitError(result.error);
              return;
            }
            coverPath = result.path ?? "";
          } else if (coverPreview.startsWith("/")) {
            coverPath = coverPreview;
          } else {
            coverPath = article?.coverImage ?? "";
          }
        }

        formData.delete("coverImageFile");
        formData.delete("coverImage");
        formData.delete("images");
        formData.set("title", title);
        formData.set("slug", slug);
        formData.set("excerpt", excerpt);
        formData.set("content", content);
        formData.set("status", selectedStatus);
        formData.set("featured", featured ? "on" : "");
        formData.set("author", author);
        formData.set("league", league);
        formData.set("coverImageCurrent", coverPath);
        if (publishDate) {
          formData.set("publishedAt", new Date(publishDate).toISOString());
        }

        const payloadSize = estimateArticlePayloadSize({
          title,
          slug,
          excerpt,
          content,
          author,
          league,
          coverPath,
        });
        if (payloadSize > MAX_ARTICLE_PAYLOAD_BYTES) {
          setSubmitError(
            `Article content is too large (${formatMegabytes(payloadSize)}). Keep it under ${formatMegabytes(MAX_ARTICLE_PAYLOAD_BYTES)} or remove embedded images from the body.`
          );
          return;
        }

        await formAction(formData);
      } catch (error) {
        setSubmitError(getSaveErrorMessage(error));
      }
    });
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-border pb-6">
        <div>
          <h1 className="font-heading text-4xl tracking-wide text-foreground">
            {mode === "create" ? "New Article" : "Edit Article"}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {mode === "create" ? "Draft — unsaved" : "Draft — edit and save changes"}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowPreview(!showPreview)}
          className="inline-flex items-center gap-2 rounded-sm border border-border px-4 h-9 text-xs font-semibold text-muted-foreground hover:border-vcl-gold/40 hover:text-vcl-gold transition-colors shrink-0"
        >
          <Eye className="h-3.5 w-3.5" />
          {showPreview ? "Hide Preview" : "Preview"}
        </button>
      </div>

      {showPreview && (
        <section className="rounded-sm border border-border bg-card p-6">
          <h2 className="mb-4 text-[10px] font-bold tracking-[0.15em] text-muted-foreground uppercase">Article Preview</h2>
          <div className="prose prose-invert max-w-none">
            {coverPreview && (
              <div className="relative mb-6 aspect-video w-full overflow-hidden rounded-sm">
                <Image src={coverPreview} alt="Cover" fill className="object-cover" sizes="800px" unoptimized={isUploadedImage(coverPreview)} />
              </div>
            )}
            <h1>{title || "Untitled Article"}</h1>
            {excerpt && <p className="lead text-muted-foreground">{excerpt}</p>}
            <div dangerouslySetInnerHTML={{ __html: content }} />
          </div>
        </section>
      )}

      <form action={handleSubmit} className="space-y-8">
        {article?.id && <input type="hidden" name="id" value={article.id} />}
        <input type="hidden" name="coverImageCurrent" value={article?.coverImage ?? ""} />

        <section className="rounded-sm border border-border bg-card p-6 space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input id="title" value={title} onChange={(e) => handleTitleChange(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="slug">Slug</Label>
              <Input id="slug" value={slug} onChange={(e) => setSlug(e.target.value)} required />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="excerpt">Excerpt</Label>
            <Textarea id="excerpt" value={excerpt} onChange={(e) => setExcerpt(e.target.value)} rows={3} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="content" className="flex items-center gap-2">
              Content <Type className="h-4 w-4 text-muted-foreground" />
            </Label>
            <div className="flex flex-wrap gap-1.5 rounded-t-sm border border-border bg-secondary px-3 py-2">
              <ToolbarButton onClick={() => insertTag("<strong>", "</strong>")}>Bold</ToolbarButton>
              <ToolbarButton onClick={() => insertTag("<em>", "</em>")}>Italic</ToolbarButton>
              <ToolbarButton onClick={() => insertTag("<u>", "</u>")}>Underline</ToolbarButton>
              <Divider />
              <ToolbarButton onClick={() => insertTag("<h2>", "</h2>")}>H2</ToolbarButton>
              <ToolbarButton onClick={() => insertTag("<h3>", "</h3>")}>H3</ToolbarButton>
              <ToolbarButton onClick={() => insertTag("<p>", "</p>")}>Paragraph</ToolbarButton>
              <Divider />
              <ToolbarButton onClick={() => insertTag("<ul>\n  <li>", "</li>\n</ul>")}>Bullets</ToolbarButton>
              <ToolbarButton onClick={() => insertTag("<ol>\n  <li>", "</li>\n</ol>")}>Numbers</ToolbarButton>
              <ToolbarButton onClick={() => insertTag('<blockquote class="border-l-4 border-vcl-gold pl-4 italic">', "</blockquote>")}>
                Quote
              </ToolbarButton>
              <ToolbarButton
                onClick={() => {
                  const url = prompt("Enter URL");
                  if (url) insertTag(`<a href="${url}" class="text-vcl-gold hover:underline">`, "</a>");
                }}
              >
                Link
              </ToolbarButton>
            </div>
            <Textarea
              ref={textareaRef}
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={14}
              required
              className="rounded-t-none"
            />
          </div>
        </section>

        <section className="rounded-sm border border-border bg-card p-6 space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={selectedStatus} onValueChange={(value) => setSelectedStatus(value as ArticleStatus)}>
                <SelectTrigger id="status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {statuses.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="author">Author</Label>
              <Input
                id="author"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="Enter author name"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="league">League</Label>
            <Select value={league} onValueChange={setLeague}>
              <SelectTrigger id="league">
                <SelectValue placeholder="Select league" />
              </SelectTrigger>
              <SelectContent>
                {leagues.map((l) => (
                  <SelectItem key={l.id} value={l.code}>
                    {l.code}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="publishDate" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" /> Publish Date (optional)
            </Label>
            <Input
              id="publishDate"
              type="datetime-local"
              value={publishDate}
              onChange={(e) => setPublishDate(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">Leave empty to publish immediately when status is set to Published</p>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="featured"
              checked={featured}
              onChange={(e) => setFeatured(e.target.checked)}
              className="h-4 w-4 rounded border-border"
            />
            <Label htmlFor="featured">Featured article</Label>
          </div>
        </section>

        <section className="rounded-sm border border-border bg-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-[10px] font-bold tracking-[0.15em] text-muted-foreground uppercase flex items-center gap-2">
                <ImageIcon className="h-3.5 w-3.5" /> Cover Image
              </h3>
              <p className="text-sm text-muted-foreground mt-1">Featured image displayed at the top of the article.</p>
            </div>
            <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-sm border border-border px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:border-vcl-gold/40 hover:text-vcl-gold transition-colors">
              {coverPreview ? "Change" : "Upload"}
              <input type="file" name="coverImageFile" accept="image/*" className="hidden" onChange={handleCoverChange} />
            </label>
          </div>
          {coverPreview ? (
            <div className="relative aspect-video w-full max-w-md overflow-hidden rounded-sm border border-border">
              <Image src={coverPreview} alt="Cover preview" fill className="object-cover" sizes="400px" unoptimized={isUploadedImage(coverPreview)} />
              <button
                type="button"
                onClick={() => { setCoverPreview(""); setCoverFile(null); setCoverError(null); }}
                className="absolute right-2 top-2 rounded-sm bg-black/60 px-2 py-1 text-xs text-white hover:bg-black/80"
              >
                Remove
              </button>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No cover image set.</p>
          )}
          {coverError && <p className="text-sm text-red-400">{coverError}</p>}
        </section>

        <section className="rounded-sm border border-border bg-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-[10px] font-bold tracking-[0.15em] text-muted-foreground uppercase">Content Images</h3>
              <p className="text-sm text-muted-foreground mt-1">Upload assets to embed in the article body.</p>
            </div>
            <label className={`inline-flex cursor-pointer items-center gap-1.5 rounded-sm border border-border px-3 py-1.5 text-xs font-semibold transition-colors ${
              isUploading ? "text-muted-foreground opacity-50 cursor-not-allowed" : "text-muted-foreground hover:border-vcl-gold/40 hover:text-vcl-gold"
            }`}>
              {isUploading ? "Uploading..." : "Upload Image"}
              <input type="file" name="images" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={isUploading} />
            </label>
          </div>
          {uploadError && <p className="text-sm text-red-400">{uploadError}</p>}
          {images.length === 0 ? (
            <p className="text-sm text-muted-foreground">No uploads yet.</p>
          ) : (
            <div className="grid gap-3 md:grid-cols-3">
              {images.map((image) => (
                <button
                  key={image}
                  type="button"
                  onClick={() => insertAtCursor(`<img src="${image}" alt="" class="rounded-sm w-full" />`)}
                  className="relative aspect-video overflow-hidden rounded-sm border border-border hover:border-vcl-gold/40 transition-colors"
                >
                  <Image src={image} alt="" fill sizes="200px" className="object-cover" unoptimized={isUploadedImage(image)} />
                </button>
              ))}
            </div>
          )}
        </section>

        {submitError && (
          <div className="rounded-sm border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {submitError}
          </div>
        )}

        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between pt-2">
          <div>{deleteSlot}</div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                setTitle(article?.title ?? "");
                setSlug(article?.slug ?? "");
                setExcerpt(article?.excerpt ?? "");
                setContent(article?.content ?? "");
                setCoverPreview(article?.coverImage ?? "");
                setCoverFile(null);
                setCoverError(null);
                setSubmitError(null);
                setSelectedStatus(article?.status ?? "DRAFT");
                setFeatured(article?.featured ?? false);
                setAuthor(article?.author ?? "");
              }}
              className="inline-flex items-center gap-1.5 rounded-sm border border-border px-4 h-10 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
            >
              Reset
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="inline-flex items-center gap-1.5 rounded-sm bg-vcl-gold px-5 h-10 text-sm font-bold text-vcl-gold-foreground hover:bg-vcl-gold/90 transition-colors disabled:opacity-60"
            >
              {isPending ? "Saving..." : mode === "create" ? "Publish Article" : "Save Changes"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

function ToolbarButton({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-sm border border-border bg-card px-2 py-1 text-xs font-semibold text-muted-foreground transition hover:border-vcl-gold/40 hover:text-foreground"
    >
      {children}
    </button>
  );
}

function Divider() {
  return <span className="h-4 w-px bg-border" />;
}
