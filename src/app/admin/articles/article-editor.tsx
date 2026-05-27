"use client";

import Image from "next/image";
import { useRef, useState, useTransition } from "react";
import { useEffect } from "react";
import { useNavGuard } from "@/lib/nav-guard";
import { uploadImageAction } from "./actions";
import { isUploadedImage } from "@/lib/upload-path";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { Eye, ImageIcon, Calendar, X, ArrowLeft, Lock } from "lucide-react";
import { TiptapEditor, type TiptapEditorHandle } from "@/components/editor/tiptap-editor";
import { CoverImageEditor, type FocalPoint } from "./cover-image-editor";
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
    coverFocalX?: number | null;
    coverFocalY?: number | null;
    photographerCredit: string | null;
    status: ArticleStatus;
    featured: boolean;
    author: string | null;
    league?: string | null;
    publishedAt?: Date | null;
    tags?: { id: string; name: string; slug: string }[];
  };
  leagues: { id: string; name: string; code: string }[];
  formAction: (formData: FormData) => Promise<void>;
  deleteSlot?: React.ReactNode;
};

const statuses: { label: string; value: ArticleStatus }[] = [
  { label: "Draft", value: "DRAFT" },
  { label: "Published", value: "PUBLISHED" },
  { label: "Unlisted", value: "ARCHIVED" },
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

function toLocalDatetimeString(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function nowLocalString(): string {
  return toLocalDatetimeString(new Date());
}

export function ArticleEditor({ mode, article, leagues, formAction, deleteSlot }: ArticleEditorProps) {
  const [title, setTitle] = useState(article?.title ?? "");
  const [slug, setSlug] = useState(article?.slug ?? "");
  const [excerpt, setExcerpt] = useState(article?.excerpt ?? "");
  const [content, setContent] = useState(article?.content ?? "");
  const [coverPreview, setCoverPreview] = useState(article?.coverImage ?? "");
  const [focal, setFocal] = useState<FocalPoint>({
    x: article?.coverFocalX ?? 50,
    y: article?.coverFocalY ?? 50,
  });
  const [photographerCredit, setPhotographerCredit] = useState(article?.photographerCredit ?? "");
  const [selectedStatus, setSelectedStatus] = useState<ArticleStatus | "">(article?.status ?? "");
  const [featured, setFeatured] = useState(article?.featured ?? false);
  const [author, setAuthor] = useState(article?.author ?? "");
  const [league, setLeague] = useState<string>(article?.league ?? "");
  const [publishDate, setPublishDate] = useState(
    article?.publishedAt && article.status !== "PUBLISHED"
      ? toLocalDatetimeString(new Date(article.publishedAt))
      : ""
  );
  const [showPreview, setShowPreview] = useState(false);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverError, setCoverError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [tags, setTags] = useState<string[]>(
    article?.tags?.map((t) => t.name) ?? []
  );
  const [tagInput, setTagInput] = useState("");
  const [isPending, startTransition] = useTransition();
  const [isDirty, setIsDirty] = useState(false);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const editorRef = useRef<TiptapEditorHandle>(null);
  const { setDirty: setGuardDirty, guardNavigate } = useNavGuard();

  // Keep the global nav guard in sync with local dirty state
  useEffect(() => {
    setGuardDirty(isDirty);
  }, [isDirty, setGuardDirty]);

  // Clear guard when the editor unmounts
  useEffect(() => {
    return () => setGuardDirty(false);
  }, [setGuardDirty]);

  const isAlreadyPublished = article?.status === "PUBLISHED" && Boolean(article?.publishedAt);
  const publishDateLocked = isAlreadyPublished && selectedStatus === "PUBLISHED";

  const isScheduledForFuture =
    selectedStatus === "PUBLISHED" &&
    !publishDateLocked &&
    Boolean(publishDate) &&
    Number.isFinite(new Date(publishDate).getTime()) &&
    new Date(publishDate).getTime() > Date.now();

  const submitLabel =
    !selectedStatus || selectedStatus === "DRAFT"
      ? "Save"
      : selectedStatus === "PUBLISHED"
      ? publishDateLocked
        ? "Update Published"
        : isScheduledForFuture
        ? "Schedule Publish"
        : "Publish Article"
      : mode === "create"
      ? "Create Article"
      : "Save Changes";

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
    // Reset focal point to centre for a newly chosen image
    setFocal({ x: 50, y: 50 });
    setValidationErrors((err) => { const n = {...err}; delete n.cover; return n; });
  };

  const validate = (): Record<string, string> => {
    const errors: Record<string, string> = {};
    if (!selectedStatus) errors.status = "Status is required.";
    if (selectedStatus === "PUBLISHED") {
      if (!league) errors.league = "League is required before publishing.";
      if (!coverPreview) errors.cover = "A cover image is required before publishing.";
      if (tags.length < 2) errors.tags = `At least 2 tags are required before publishing (${tags.length} added).`;
    }
    return errors;
  };

  const doSubmit = () => {
    const errors = validate();
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      // Scroll to first error
      setTimeout(() => {
        document.querySelector("[data-validation-error]")?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 50);
      return;
    }
    setValidationErrors({});
    if (selectedStatus === "PUBLISHED") {
      setShowPublishModal(true);
    } else {
      handleSubmit(new FormData());
    }
  };

  const handleSubmit = (formData: FormData) => {
    setSubmitError(null);
    startTransition(async () => {
      try {
        // Ensure the article id is always present when editing
        if (article?.id) formData.set("id", article.id);

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
        formData.set("title", title);
        formData.set("slug", slug);
        formData.set("excerpt", excerpt);
        formData.set("content", content);
        formData.set("status", selectedStatus);
        formData.set("featured", featured ? "on" : "");
        formData.set("author", author);
        formData.set("photographerCredit", photographerCredit);
        formData.set("coverFocalX", String(focal.x));
        formData.set("coverFocalY", String(focal.y));
        formData.set("league", league === "__none__" ? "" : league);
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

        setIsDirty(false);
        await formAction(formData);
      } catch (error) {
        setSubmitError(getSaveErrorMessage(error));
      }
    });
  };

  const handleBack = () => {
    guardNavigate("/admin/articles");
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

      <form action={handleSubmit} onChange={() => setIsDirty(true)} className="space-y-8">
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
            <TiptapEditor
              ref={editorRef}
              value={content}
              onChange={(val) => { setContent(val); setIsDirty(true); }}
              onImageUpload={async (file) => {
                if (file.size > MAX_FILE_SIZE_BYTES) {
                  setUploadError(`Images must be ${formatMegabytes(MAX_FILE_SIZE_BYTES)} or smaller.`);
                  return null;
                }
                setUploadError(null);
                try {
                  const formData = new FormData();
                  formData.append("file", file);
                  const result = await uploadImageAction(formData);
                  if (result.error) {
                    setUploadError(result.error);
                    return null;
                  }
                  return result.path ?? null;
                } catch (error) {
                  setUploadError(getSaveErrorMessage(error));
                  return null;
                }
              }}
            />
          </div>
        </section>

        <section className="rounded-sm border border-border bg-card p-6 space-y-6">
          {/* Status + Author */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={selectedStatus} onValueChange={(value) => {
                setSelectedStatus(value as ArticleStatus);
                setIsDirty(true);
                setValidationErrors((e) => { const n = {...e}; delete n.status; return n; });
                if (value !== "PUBLISHED") setPublishDate("");
              }}>
                <SelectTrigger id="status" className={validationErrors.status ? "border-red-500/60" : ""}>
                  <SelectValue placeholder="————" />
                </SelectTrigger>
                <SelectContent>
                  {statuses.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {validationErrors.status && <p className="text-xs text-red-400">{validationErrors.status}</p>}
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
            <Select value={league} onValueChange={(v) => { setLeague(v); setIsDirty(true); }}>
              <SelectTrigger id="league">
                <SelectValue placeholder="Select league" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__">N/A</SelectItem>
                {leagues.map((l) => (
                  <SelectItem key={l.id} value={l.code}>
                    {l.code}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {validationErrors.league && <p className="text-xs text-red-400">{validationErrors.league}</p>}
          </div>

          {/* Publish Date */}
          <div className="space-y-2">
            <Label htmlFor="publishDate" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              {publishDateLocked ? "Published On" : "Schedule Publish (optional)"}
            </Label>
            {publishDateLocked ? (
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-2 h-9 rounded-sm border border-border bg-muted/30 px-3 text-sm text-muted-foreground select-none">
                  <Lock className="h-3.5 w-3.5 shrink-0 text-muted-foreground/50" />
                  {new Date(article!.publishedAt!).toLocaleString(undefined, {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </div>
                <p className="text-xs text-muted-foreground">
                  Locked while published — switch to Draft or Unlisted to change.
                </p>
              </div>
            ) : (
              <>
                <Input
                  id="publishDate"
                  type="datetime-local"
                  value={publishDate}
                  min={nowLocalString()}
                  onChange={(e) => setPublishDate(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Leave empty to publish immediately. Cannot be set in the past.
                </p>
              </>
            )}
          </div>

          {/* Tags */}
          <div className="space-y-2" data-validation-error={validationErrors.tags ? true : undefined}>
            <Label>
              Tags
              <span className="ml-1 font-normal text-muted-foreground text-xs">(min. 2 required to publish)</span>
            </Label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {tags.map((tag) => (
                <span key={tag} className="inline-flex items-center gap-1 rounded-full border border-border bg-accent px-2.5 py-0.5 text-xs text-muted-foreground">
                  {tag}
                  <button type="button" onClick={() => { removeTag(tag); setIsDirty(true); }} className="hover:text-foreground transition-colors">
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
                    setIsDirty(true);
                    setValidationErrors((err) => { const n = {...err}; delete n.tags; return n; });
                  }
                }}
                placeholder="Type a tag and press Enter"
                className="flex-1"
              />
              <button
                type="button"
                onClick={() => { addTag(tagInput); setIsDirty(true); setValidationErrors((err) => { const n = {...err}; delete n.tags; return n; }); }}
                className="rounded-sm border border-border px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground hover:border-vcl-gold/40 transition-colors"
              >
                Add
              </button>
            </div>
            {validationErrors.tags
              ? <p className="text-xs text-red-400">{validationErrors.tags}</p>
              : <p className="text-xs text-muted-foreground">Press Enter or comma to add a tag. New tags are saved automatically.</p>}
          </div>

          {/* Featured */}
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

        {/* Cover Image */}
        <section
          className="rounded-sm border border-border bg-card p-6 space-y-4"
          data-validation-error={validationErrors.cover ? true : undefined}
        >
          <div>
            <h3 className={`text-[10px] font-bold tracking-[0.15em] uppercase flex items-center gap-2 ${validationErrors.cover ? "text-red-400" : "text-muted-foreground"}`}>
              <ImageIcon className="h-3.5 w-3.5" /> Cover Image
              <span className="text-[9px] font-normal normal-case tracking-normal text-muted-foreground">(required to publish)</span>
            </h3>
            <p className="text-sm text-muted-foreground mt-1">Featured image displayed at the top of the article.</p>
          </div>

          {coverPreview ? (
            <CoverImageEditor
              src={coverPreview}
              focal={focal}
              onFocalChange={(f) => { setFocal(f); setIsDirty(true); }}
              onUpload={handleCoverChange}
              onRemove={() => { setCoverPreview(""); setCoverFile(null); setCoverError(null); setFocal({ x: 50, y: 50 }); }}
              coverError={coverError}
              validationError={validationErrors.cover}
              photographerCredit={photographerCredit}
              onPhotographerCreditChange={(v) => { setPhotographerCredit(v); setIsDirty(true); }}
            />
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">No cover image set.</p>
              <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-sm border border-border px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:border-vcl-gold/40 hover:text-vcl-gold transition-colors">
                Upload Cover Photo
                <input type="file" name="coverImageFile" accept="image/*" className="hidden" onChange={handleCoverChange} />
              </label>
              {validationErrors.cover && <p className="text-sm text-red-400">{validationErrors.cover}</p>}
            </div>
          )}
        </section>

        {submitError && (
          <div className="rounded-sm border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {submitError}
          </div>
        )}

        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between pt-2">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleBack}
              className="inline-flex items-center gap-1.5 rounded-sm border border-border px-4 h-10 text-sm font-semibold text-muted-foreground hover:border-vcl-gold/40 hover:text-vcl-gold transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to Articles
            </button>
            {deleteSlot}
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setShowResetModal(true)}
              className="inline-flex items-center gap-1.5 rounded-sm border border-border px-4 h-10 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
            >
              Reset
            </button>
            <button
              type="button"
              disabled={isPending}
              onClick={doSubmit}
              className="inline-flex items-center gap-1.5 rounded-sm bg-vcl-gold px-5 h-10 text-sm font-bold text-vcl-gold-foreground hover:bg-vcl-gold/90 transition-colors disabled:opacity-60"
            >
              {isPending ? "Saving..." : submitLabel}
            </button>
          </div>
        </div>
      </form>

      {/* Publish confirmation */}
      <ConfirmModal
        open={showPublishModal}
        onOpenChange={setShowPublishModal}
        title={isScheduledForFuture ? "Schedule this article?" : "Publish this article?"}
        description={
          isScheduledForFuture
            ? `This article will be published on ${new Date(publishDate).toLocaleString()}. You can unpublish it at any time.`
            : "This will make the article live and visible to all visitors. You can unpublish it at any time."
        }
        confirmLabel={isScheduledForFuture ? "Schedule Publish" : "Publish Article"}
        onConfirm={() => handleSubmit(new FormData())}
      />

      {/* Reset confirmation */}
      <ConfirmModal
        open={showResetModal}
        onOpenChange={setShowResetModal}
        title="Reset all changes?"
        description="This will discard every unsaved edit and restore the form to its last saved state."
        confirmLabel="Reset"
        variant="destructive"
        onConfirm={() => {
          const originalContent = article?.content ?? "";
          setTitle(article?.title ?? "");
          setSlug(article?.slug ?? "");
          setExcerpt(article?.excerpt ?? "");
          setContent(originalContent);
          // Imperatively reset the Tiptap editor's internal state
          editorRef.current?.setContent(originalContent);
          setCoverPreview(article?.coverImage ?? "");
          setFocal({ x: article?.coverFocalX ?? 50, y: article?.coverFocalY ?? 50 });
          setPhotographerCredit(article?.photographerCredit ?? "");
          setCoverFile(null);
          setCoverError(null);
          setSubmitError(null);
          setValidationErrors({});
          setSelectedStatus(article?.status ?? "");
          setPublishDate(
            article?.publishedAt && article.status !== "PUBLISHED"
              ? toLocalDatetimeString(new Date(article.publishedAt))
              : ""
          );
          setFeatured(article?.featured ?? false);
          setAuthor(article?.author ?? "");
          setLeague(article?.league ?? "");
          setIsDirty(false);
        }}
      />

    </div>
  );
}
