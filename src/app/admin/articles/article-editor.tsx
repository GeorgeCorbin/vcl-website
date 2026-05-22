"use client";

import Image from "next/image";
import { useRef, useState, useTransition } from "react";
import { uploadImageAction } from "./actions";
import { isUploadedImage } from "@/lib/upload-path";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Eye, ImageIcon, Calendar, X } from "lucide-react";
import { TiptapEditor, type TiptapEditorHandle } from "@/components/editor/tiptap-editor";
import { ArticleStatus } from "@prisma/client";

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
    league?: string | null;
    publishedAt?: Date | null;
    tags?: { id: string; name: string; slug: string }[];
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
  const [tags, setTags] = useState<string[]>(
    article?.tags?.map((t) => t.name) ?? []
  );
  const [tagInput, setTagInput] = useState("");
  const [isPending, startTransition] = useTransition();
  const editorRef = useRef<TiptapEditorHandle>(null);

  const addTag = (value: string) => {
    const trimmed = value.trim().toLowerCase();
    if (trimmed && !tags.includes(trimmed)) {
      setTags((prev) => [...prev, trimmed]);
    }
    setTagInput("");
  };

  const removeTag = (tag: string) => {
    setTags((prev) => prev.filter((t) => t !== tag));
  };

  const insertImageIntoEditor = (src: string) => {
    editorRef.current?.insertImage(src);
  };

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
        formData.delete("tags");
        tags.forEach((tag) => formData.append("tags", tag));
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
            <Label>Content</Label>
            <TiptapEditor ref={editorRef} value={content} onChange={setContent} />
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

          <div className="space-y-2">
            <Label>Tags</Label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {tags.map((tag) => (
                <span key={tag} className="inline-flex items-center gap-1 rounded-full border border-border bg-accent px-2.5 py-0.5 text-xs text-muted-foreground">
                  {tag}
                  <button type="button" onClick={() => removeTag(tag)} className="hover:text-foreground transition-colors">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === ",") {
                    e.preventDefault();
                    addTag(tagInput);
                  }
                }}
                placeholder="Type a tag and press Enter"
                className="flex-1"
              />
              <button
                type="button"
                onClick={() => addTag(tagInput)}
                className="rounded-sm border border-border px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground hover:border-vcl-gold/40 transition-colors"
              >
                Add
              </button>
            </div>
            <p className="text-xs text-muted-foreground">Press Enter or comma to add a tag. Tags are created automatically if they don&apos;t exist.</p>
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
                  onClick={() => insertImageIntoEditor(image)}
                  title="Click to insert into article body"
                  className="group relative aspect-video overflow-hidden rounded-sm border border-border hover:border-vcl-gold/40 transition-colors"
                >
                  <Image src={image} alt="" fill sizes="200px" className="object-cover" unoptimized={isUploadedImage(image)} />
                  <span className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-bold tracking-widest uppercase text-vcl-gold">
                    Insert
                  </span>
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
