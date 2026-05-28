"use client";

import { useRef, useState, useTransition } from "react";
import { useEffect } from "react";
import { useNavGuard } from "@/lib/nav-guard";
import { uploadImageAction } from "./actions";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { Eye, EyeOff, ImageIcon, Calendar, X, ArrowLeft, Lock } from "lucide-react";
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

function injectImageCreditsClient(html: string): string {
  return html.replace(
    /<img([^>]*?)>/gi,
    (fullMatch, attrs) => {
      const creditMatch = attrs.match(/data-credit="([^"]*)"/)
      if (!creditMatch || !creditMatch[1].trim()) return fullMatch;
      const credit = creditMatch[1].trim();
      const styleMatch = attrs.match(/style="([^"]*)"/)
      const styleValue = styleMatch?.[1] ?? "";
      const widthMatch = styleValue.match(/width:\s*(\d+%)/);
      const imageWidth = widthMatch?.[1];
      const figStyle = [imageWidth ? `width: ${imageWidth}` : "", "display: block", "margin: 0 auto"].filter(Boolean).join("; ");
      const cleanedStyle = styleValue.replace(/width:\s*[^;]+;?\s*/g,"").replace(/height:\s*auto;?\s*/g,"").replace(/display:\s*[^;]+;?\s*/g,"").replace(/margin[^:]*:\s*[^;]+;?\s*/g,"").replace(/;+$/,"").trim();
      const cleanedAttrs = styleMatch ? (cleanedStyle ? attrs.replace(/style="[^"]*"/,`style="${cleanedStyle}"`) : attrs.replace(/\s*style="[^"]*"/,"")) : attrs;
      return `<figure style="${figStyle}"><img${cleanedAttrs}><figcaption style="font-size:0.75rem;font-style:italic;color:#666;margin-top:0.25rem;text-align:center">Photo by ${credit}</figcaption></figure>`;
    }
  );
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
    <div className="space-y-0">
      {/* ── Top bar ── */}
      <div className="flex items-center justify-between gap-4 border-b border-border pb-5 mb-8">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={handleBack}
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-vcl-gold transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Articles
          </button>
          <span className="h-4 w-px bg-border" />
          <h1 className="font-heading text-2xl tracking-wide text-foreground">
            {mode === "create" ? "New Article" : (title || "Edit Article")}
          </h1>
          {isDirty && (
            <span className="rounded-sm bg-vcl-gold/10 border border-vcl-gold/30 px-2 py-0.5 text-[10px] font-bold tracking-widest text-vcl-gold uppercase">
              Unsaved
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {deleteSlot}
        </div>
      </div>

      {/* ── Preview Modal ── */}
      {showPreview && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center bg-black/80 backdrop-blur-sm overflow-y-auto py-8 px-4"
          onClick={(e) => { if (e.target === e.currentTarget) setShowPreview(false); }}
        >
          <div className="relative w-full max-w-[1100px] rounded-sm border border-border bg-[#0A0A0A] shadow-2xl flex flex-col overflow-hidden">

            {/* Modal top bar */}
            <div className="flex items-center justify-between gap-4 border-b border-border bg-[#141414] px-6 h-14 shrink-0">
              <div className="flex items-center gap-3">
                <span className="rounded-sm bg-vcl-gold/10 border border-vcl-gold/30 px-2 py-0.5 text-[10px] font-bold tracking-widest text-vcl-gold uppercase">Preview</span>
                <span className="text-sm text-muted-foreground truncate">{title || "Untitled Article"}</span>
              </div>
              <button
                type="button"
                onClick={() => setShowPreview(false)}
                className="inline-flex items-center gap-2 rounded-sm border border-border px-3 h-8 text-xs font-semibold text-muted-foreground hover:border-vcl-gold/40 hover:text-vcl-gold transition-colors shrink-0"
              >
                <EyeOff className="h-3.5 w-3.5" />
                Close
              </button>
            </div>

            {/* Hero */}
            <div className="relative h-[360px] overflow-hidden bg-[#0d0d0d] shrink-0">
              {coverPreview ? (
                <img
                  src={coverPreview}
                  alt={title}
                  className="absolute inset-0 h-full w-full object-cover"
                  style={{ objectPosition: `${focal.x}% ${focal.y}%` }}
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-[#111]">
                  <span className="text-xs text-muted-foreground/40">No cover image</span>
                </div>
              )}
              <div className="absolute inset-0" style={{background: "linear-gradient(180deg, #00000000 0%, #0A0A0Acc 55%, #0A0A0A 90%)"}}/>
              <div className="absolute bottom-0 left-0 right-0 px-8 pb-7">
                <div className="flex items-center gap-2 mb-3">
                  {league && league !== "__none__" && (
                    <span className="rounded-sm bg-vcl-gold px-2.5 py-1 text-[9px] font-bold tracking-[0.15em] text-[#0A0A0A] uppercase">{league}</span>
                  )}
                  {featured && (
                    <span className="rounded-sm border border-white/25 px-2.5 py-1 text-[9px] font-bold tracking-[0.15em] text-white uppercase">Featured</span>
                  )}
                </div>
                <h1 className="font-heading text-[38px] leading-none tracking-wide text-white max-w-[700px]">
                  {title || "Untitled Article"}
                </h1>
              </div>
            </div>

            {/* Body + Sidebar */}
            <div className="flex gap-10 px-8 py-10 items-start">

              {/* Main content */}
              <div className="flex-1 min-w-0">
                {/* Byline */}
                <div className="flex items-center gap-3 text-[13px] pb-7 mb-7 border-b border-border flex-wrap">
                  {author && <span className="font-semibold text-white">By {author}</span>}
                  {author && <span className="text-muted-foreground">·</span>}
                  <span className="text-muted-foreground">{new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</span>
                  <span className="text-muted-foreground">·</span>
                  <span className="text-muted-foreground">1 min read</span>
                </div>

                {/* Content */}
                <div
                  className="prose prose-invert prose-sm md:prose-base max-w-none
                    prose-headings:font-heading prose-headings:tracking-wide
                    prose-a:text-vcl-gold prose-a:no-underline hover:prose-a:underline
                    prose-strong:text-foreground
                    prose-blockquote:border-l-vcl-gold prose-blockquote:text-muted-foreground
                    prose-figcaption:text-xs prose-figcaption:italic prose-figcaption:text-muted-foreground/70 prose-figcaption:mt-1 prose-figcaption:text-center"
                  dangerouslySetInnerHTML={{ __html: injectImageCreditsClient(content) }}
                />

                {/* Inline ad filler */}
                <div className="my-8 flex items-center justify-center rounded-sm border border-dashed border-border bg-secondary/40 h-[90px]">
                  <span className="text-[10px] font-bold tracking-[0.15em] text-muted-foreground/40 uppercase">Advertisement</span>
                </div>

                {/* Tags */}
                {tags.length > 0 && (
                  <div className="flex flex-wrap items-center gap-2 pt-6 mt-6 border-t border-border">
                    <span className="text-[10px] font-bold tracking-[0.15em] text-muted-foreground uppercase">Tags:</span>
                    {tags.map((tag) => (
                      <span key={tag} className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground">{tag}</span>
                    ))}
                  </div>
                )}
              </div>

              {/* Sidebar */}
              <aside className="w-[240px] shrink-0 flex flex-col gap-5">
                {/* Ad filler — 300×250 */}
                <div className="flex items-center justify-center rounded-sm border border-dashed border-border bg-secondary/40" style={{height: 200}}>
                  <span className="text-[10px] font-bold tracking-[0.15em] text-muted-foreground/40 uppercase">Ad 300×250</span>
                </div>

                {/* Related articles filler */}
                <div className="rounded-sm border border-border bg-card p-4">
                  <h3 className="text-[10px] font-bold tracking-[0.2em] text-muted-foreground uppercase pb-4 border-b border-border">Related Articles</h3>
                  <div className="flex flex-col">
                    {[
                      { league: "MCLA", title: "MCLA Week 8 Power Rankings: The Top Teams Shake Up" },
                      { league: "MCLA", title: "Transfer Portal Roundup: Key Moves to Watch" },
                      { league: "SMLL", title: "Spring Season Preview: Who Makes a Run?" },
                    ].map((rel, i) => (
                      <div key={i} className="flex flex-col gap-1 py-3 border-b border-border last:border-0 opacity-60">
                        <span className="text-[10px] font-bold tracking-[0.15em] text-vcl-gold uppercase">{rel.league}</span>
                        <span className="text-[12px] font-semibold text-foreground leading-snug">{rel.title}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Ad filler — 300×600 */}
                <div className="flex items-center justify-center rounded-sm border border-dashed border-border bg-secondary/40" style={{height: 300}}>
                  <span className="text-[10px] font-bold tracking-[0.15em] text-muted-foreground/40 uppercase">Ad 300×600</span>
                </div>
              </aside>

            </div>
          </div>
        </div>
      )}

      {/* ── Two-column layout ── */}
      <form action={handleSubmit} onChange={() => setIsDirty(true)} className="flex gap-8 items-start">
        {article?.id && <input type="hidden" name="id" value={article.id} />}
        <input type="hidden" name="coverImageCurrent" value={article?.coverImage ?? ""} />

        {/* ── Left: content ── */}
        <div className="flex-1 min-w-0 space-y-5">

          {/* Title */}
          <div className="space-y-1.5">
            <Label htmlFor="title" className="text-[10px] font-bold tracking-[0.15em] text-muted-foreground uppercase">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="Article title"
              className="text-base font-semibold h-11"
              required
            />
          </div>

          {/* Slug */}
          <div className="space-y-1.5">
            <Label htmlFor="slug" className="text-[10px] font-bold tracking-[0.15em] text-muted-foreground uppercase">Slug</Label>
            <div className="flex items-center rounded-sm border border-border bg-background focus-within:border-vcl-gold/60 transition-colors overflow-hidden">
              <span className="pl-3 text-xs text-muted-foreground/60 select-none shrink-0">/articles/</span>
              <input
                id="slug"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                required
                className="flex-1 bg-transparent py-2 pr-3 text-sm focus:outline-none text-foreground"
              />
            </div>
          </div>

          {/* Excerpt */}
          <div className="space-y-1.5">
            <Label htmlFor="excerpt" className="text-[10px] font-bold tracking-[0.15em] text-muted-foreground uppercase">Excerpt</Label>
            <Textarea
              id="excerpt"
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              rows={3}
              placeholder="Short summary shown in article cards and search results…"
            />
          </div>

          {/* Cover Image */}
          <div
            className="rounded-sm border border-border bg-card overflow-hidden"
            data-validation-error={validationErrors.cover ? true : undefined}
          >
            <div className={`px-4 py-3 border-b border-border bg-secondary flex items-center justify-between`}>
              <p className={`text-[10px] font-bold tracking-[0.15em] uppercase ${validationErrors.cover ? "text-red-400" : "text-muted-foreground"}`}>
                Cover Image
              </p>
              {!coverPreview && (
                <label className="cursor-pointer text-[10px] font-semibold text-muted-foreground hover:text-vcl-gold transition-colors">
                  Upload
                  <input type="file" name="coverImageFile" accept="image/*" className="hidden" onChange={handleCoverChange} />
                </label>
              )}
            </div>
            <div className="p-3">
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
                <div className="aspect-video flex flex-col items-center justify-center gap-2 rounded-sm border border-dashed border-border bg-secondary/50">
                  <ImageIcon className="h-6 w-6 text-muted-foreground/40" />
                  <label className="cursor-pointer text-xs font-semibold text-muted-foreground hover:text-vcl-gold transition-colors">
                    Click to upload
                    <input type="file" name="coverImageFile" accept="image/*" className="hidden" onChange={handleCoverChange} />
                  </label>
                  {validationErrors.cover && <p className="text-xs text-red-400 text-center px-2">{validationErrors.cover}</p>}
                </div>
              )}
              {coverError && <p className="mt-2 text-xs text-red-400">{coverError}</p>}
            </div>
          </div>

          {/* Rich text editor */}
          <div className="space-y-1.5">
            <Label className="text-[10px] font-bold tracking-[0.15em] text-muted-foreground uppercase">Content</Label>
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
            {uploadError && <p className="text-xs text-red-400">{uploadError}</p>}
          </div>

          {/* Submit error */}
          {submitError && (
            <div className="rounded-sm border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              {submitError}
            </div>
          )}

          {/* Bottom action bar */}
          <div className="flex items-center justify-between pt-2 pb-4 border-t border-border">
            <button
              type="button"
              onClick={() => setShowResetModal(true)}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Reset changes
            </button>
            <button
              type="button"
              disabled={isPending}
              onClick={doSubmit}
              className="inline-flex items-center gap-2 rounded-sm bg-vcl-gold px-6 h-10 text-sm font-bold text-vcl-gold-foreground hover:bg-vcl-gold/90 transition-colors disabled:opacity-60"
            >
              {isPending ? "Saving..." : submitLabel}
            </button>
          </div>
        </div>

        {/* ── Right: sidebar ── */}
        <div className="w-[300px] shrink-0 sticky top-6 space-y-4">

          {/* Status */}
          <div className="rounded-sm border border-border bg-card overflow-hidden">
            <div className="px-4 py-3 border-b border-border bg-secondary">
              <p className="text-[10px] font-bold tracking-[0.15em] text-muted-foreground uppercase">Publish</p>
            </div>
            <div className="px-4 py-4 space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="status" className="text-xs text-muted-foreground">Status</Label>
                <Select value={selectedStatus} onValueChange={(value) => {
                  setSelectedStatus(value as ArticleStatus);
                  setIsDirty(true);
                  setValidationErrors((e) => { const n = {...e}; delete n.status; return n; });
                  if (value !== "PUBLISHED") setPublishDate("");
                }}>
                  <SelectTrigger id="status" className={validationErrors.status ? "border-red-500/60" : ""}>
                    <SelectValue placeholder="Select status…" />
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

              {/* Publish date */}
              <div className="space-y-1.5">
                <Label htmlFor="publishDate" className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <Calendar className="h-3 w-3" />
                  {publishDateLocked ? "Published on" : "Schedule (optional)"}
                </Label>
                {publishDateLocked ? (
                  <div className="flex items-center gap-2 h-9 rounded-sm border border-border bg-muted/30 px-3 text-xs text-muted-foreground select-none">
                    <Lock className="h-3 w-3 shrink-0 opacity-50" />
                    {new Date(article!.publishedAt!).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}
                  </div>
                ) : (
                  <Input
                    id="publishDate"
                    type="datetime-local"
                    value={publishDate}
                    min={nowLocalString()}
                    onChange={(e) => setPublishDate(e.target.value)}
                    className="text-xs"
                  />
                )}
                {publishDateLocked && (
                  <p className="text-[11px] text-muted-foreground/70">Switch to Draft to change.</p>
                )}
              </div>

              <button
                type="button"
                disabled={isPending}
                onClick={doSubmit}
                className="w-full inline-flex items-center justify-center gap-2 rounded-sm bg-vcl-gold h-9 text-sm font-bold text-vcl-gold-foreground hover:bg-vcl-gold/90 transition-colors disabled:opacity-60"
              >
                {isPending ? "Saving..." : submitLabel}
              </button>
            </div>
          </div>

          {/* League + Author */}
          <div className="rounded-sm border border-border bg-card overflow-hidden">
            <div className="px-4 py-3 border-b border-border bg-secondary">
              <p className="text-[10px] font-bold tracking-[0.15em] text-muted-foreground uppercase">Details</p>
            </div>
            <div className="px-4 py-4 space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="author" className="text-xs text-muted-foreground">Author</Label>
                <Input
                  id="author"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  placeholder="Author name"
                  className="text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="league" className="text-xs text-muted-foreground">League</Label>
                <Select value={league} onValueChange={(v) => { setLeague(v); setIsDirty(true); }}>
                  <SelectTrigger id="league" className={validationErrors.league ? "border-red-500/60" : ""}>
                    <SelectValue placeholder="Select league…" />
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
              {/* Featured toggle */}
              <label className="flex items-center gap-3 cursor-pointer group">
                <div
                  onClick={() => { setFeatured(!featured); setIsDirty(true); }}
                  className={`relative h-5 w-9 rounded-full border transition-colors shrink-0 ${featured ? "bg-vcl-gold border-vcl-gold" : "bg-secondary border-border"}`}
                >
                  <span className={`absolute inset-y-0 my-auto h-3.5 w-3.5 rounded-full bg-white shadow transition-transform ${featured ? "translate-x-[18px]" : "translate-x-[3px]"}`} />
                </div>
                <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors">
                  Featured article
                </span>
              </label>
            </div>
          </div>

          {/* Tags */}
          <div
            className="rounded-sm border border-border bg-card overflow-hidden"
            data-validation-error={validationErrors.tags ? true : undefined}
          >
            <div className="px-4 py-3 border-b border-border bg-secondary flex items-center justify-between">
              <p className="text-[10px] font-bold tracking-[0.15em] text-muted-foreground uppercase">Tags</p>
              <span className="text-[10px] text-muted-foreground/60">min. 2 to publish</span>
            </div>
            <div className="px-4 py-4 space-y-3">
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {tags.map((tag) => (
                    <span key={tag} className="inline-flex items-center gap-1 rounded-full border border-border bg-accent px-2.5 py-0.5 text-xs text-muted-foreground">
                      {tag}
                      <button
                        type="button"
                        onClick={() => { removeTag(tag); setIsDirty(true); }}
                        className="hover:text-foreground transition-colors"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
              <div className="flex gap-1.5">
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
                  placeholder="Add a tag…"
                  className="flex-1 text-xs h-8"
                />
                <button
                  type="button"
                  onClick={() => { addTag(tagInput); setIsDirty(true); setValidationErrors((err) => { const n = {...err}; delete n.tags; return n; }); }}
                  className="rounded-sm border border-border px-2.5 h-8 text-xs font-semibold text-muted-foreground hover:border-vcl-gold/40 hover:text-vcl-gold transition-colors shrink-0"
                >
                  Add
                </button>
              </div>
              {validationErrors.tags
                ? <p className="text-xs text-red-400">{validationErrors.tags}</p>
                : <p className="text-[11px] text-muted-foreground/60">Enter or comma to add. Auto-created if new.</p>}
            </div>
          </div>

          {/* Preview */}
          <button
            type="button"
            onClick={() => setShowPreview(true)}
            className="w-full inline-flex items-center justify-center gap-2 rounded-sm border border-border h-9 text-xs font-semibold text-muted-foreground hover:border-vcl-gold/40 hover:text-vcl-gold transition-colors"
          >
            <Eye className="h-3.5 w-3.5" />
            Preview Article
          </button>

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
