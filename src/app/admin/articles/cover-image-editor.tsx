"use client";

import { useRef, useCallback, useState } from "react";
import { Undo2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export type FocalPoint = { x: number; y: number };

// Each context mirrors the exact dimensions / overlays from the public pages.
// nav bar = h-16 (64 px):
//   Carousel  → 64 / 680  ≈ 9.4 % of preview height
//   Hero      → 64 / 480  ≈ 13.3% of preview height
// Feed card at typical ~1280 px viewport: (1280-48-40)/3 ≈ 397 px wide, h-48 = 192 px → ~2:1
// Spotlight: image col (1440-520) = 920 px wide × 460 px section → 2:1
const PREVIEW_CONTEXTS: Array<{
  label: string;
  style: { aspectRatio: string };
  note: string;
  gradient: string | null;
  navBarHeightPct: number | null;
}> = [
  {
    label: "Homepage Carousel",
    style: { aspectRatio: "16 / 7" },
    note: "Rotating hero banner · home page",
    gradient:
      "linear-gradient(180deg, rgba(0,0,0,0.13) 0%, rgba(10,10,10,0.8) 55%, rgba(10,10,10,1) 95%)",
    navBarHeightPct: 9.4,
  },
  {
    label: "Article Hero",
    style: { aspectRatio: "3 / 1" },
    note: "480 px banner · article page",
    // Transparent at top, solid dark by ~83% — the bottom ~17% is text/tags overlay
    gradient:
      "linear-gradient(180deg, transparent 0%, rgba(10,10,10,0.75) 50%, rgba(10,10,10,1) 83%)",
    navBarHeightPct: 13.3,
  },
  {
    label: "Feed Card",
    style: { aspectRatio: "2 / 1" },
    note: "Article cards · home & list pages",
    gradient: null,
    navBarHeightPct: null,
  },
  {
    label: "Featured Spotlight",
    style: { aspectRatio: "2 / 1" },
    note: "Spotlight image column · home page",
    gradient: null,
    navBarHeightPct: null,
  },
];

// ─── Focal point drag picker ────────────────────────────────────────────────

function FocalPointPicker({
  src,
  focal,
  onChange,
  onDragStart,
}: {
  src: string;
  focal: FocalPoint;
  onChange: (f: FocalPoint) => void;
  onDragStart?: () => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef(false);

  const calc = useCallback(
    (clientX: number, clientY: number) => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      const x = Math.max(
        0,
        Math.min(100, Math.round(((clientX - rect.left) / rect.width) * 100))
      );
      const y = Math.max(
        0,
        Math.min(100, Math.round(((clientY - rect.top) / rect.height) * 100))
      );
      onChange({ x, y });
    },
    [onChange]
  );

  return (
    <div
      ref={containerRef}
      className="relative select-none cursor-crosshair rounded-sm overflow-hidden"
      onMouseDown={(e) => {
        e.preventDefault();
        if (!draggingRef.current) {
          draggingRef.current = true;
          onDragStart?.();
        }
        calc(e.clientX, e.clientY);
      }}
      onMouseMove={(e) => {
        if (draggingRef.current) calc(e.clientX, e.clientY);
      }}
      onMouseUp={() => {
        draggingRef.current = false;
      }}
      onMouseLeave={() => {
        draggingRef.current = false;
      }}
      onTouchStart={(e) => {
        if (!draggingRef.current) {
          draggingRef.current = true;
          onDragStart?.();
        }
        calc(e.touches[0].clientX, e.touches[0].clientY);
      }}
      onTouchMove={(e) => {
        e.preventDefault();
        if (draggingRef.current)
          calc(e.touches[0].clientX, e.touches[0].clientY);
      }}
      onTouchEnd={() => {
        draggingRef.current = false;
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt="Cover" className="w-full block" draggable={false} />

      {/* Subtle dark overlay so the crosshair is visible on any image */}
      <div className="absolute inset-0 bg-black/25 pointer-events-none" />

      {/* Crosshair — positioned at focal point % */}
      <div
        className="absolute pointer-events-none"
        style={{
          left: `${focal.x}%`,
          top: `${focal.y}%`,
          transform: "translate(-50%, -50%)",
        }}
      >
        {/* Horizontal rule */}
        <div
          className="absolute top-1/2 -translate-y-px bg-white/50"
          style={{ left: -9999, right: -9999, height: 1 }}
        />
        {/* Vertical rule */}
        <div
          className="absolute left-1/2 -translate-x-px bg-white/50"
          style={{ top: -9999, bottom: -9999, width: 1 }}
        />
        {/* Circle */}
        <div className="relative z-10 h-5 w-5 rounded-full border-2 border-white bg-white/20 shadow-[0_0_0_1.5px_rgba(0,0,0,0.55),0_2px_10px_rgba(0,0,0,0.5)]" />
      </div>
    </div>
  );
}

// ─── Main exported component ─────────────────────────────────────────────────

type CoverImageEditorProps = {
  src: string;
  focal: FocalPoint;
  onFocalChange: (focal: FocalPoint) => void;
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemove: () => void;
  coverError: string | null;
  validationError?: string | null;
  photographerCredit: string;
  onPhotographerCreditChange: (val: string) => void;
};

export function CoverImageEditor({
  src,
  focal,
  onFocalChange,
  onUpload,
  onRemove,
  coverError,
  validationError,
  photographerCredit,
  onPhotographerCreditChange,
}: CoverImageEditorProps) {
  // One undo entry is pushed per drag/click gesture, not per pixel
  const [history, setHistory] = useState<FocalPoint[]>([]);

  const handleDragStart = () => {
    setHistory((prev) => [...prev, focal]);
  };

  const handleUndo = () => {
    if (history.length === 0) return;
    const prev = history[history.length - 1];
    setHistory((h) => h.slice(0, -1));
    onFocalChange(prev);
  };

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setHistory([]); // new photo → clear undo history
    onUpload(e);
  };

  return (
    <div className="space-y-3">
      {/* Top row: header + undo */}
      <div className="flex items-center justify-between gap-3">
        <p className="text-[11px] text-muted-foreground">
          Click or drag the crosshair to set the focal point.
        </p>
        <button
          type="button"
          onClick={handleUndo}
          disabled={history.length === 0}
          title={`Undo (${history.length} step${history.length !== 1 ? "s" : ""})`}
          className="inline-flex shrink-0 items-center gap-1 rounded-sm border border-border px-2 py-0.5 text-[10px] font-semibold text-muted-foreground hover:text-foreground transition-colors disabled:opacity-35 disabled:cursor-not-allowed"
        >
          <Undo2 className="h-3 w-3" />
          Undo
          {history.length > 0 && (
            <span className="text-[9px] opacity-60">({history.length})</span>
          )}
        </button>
      </div>

      {/* Focal picker (fixed narrow width) + previews side by side */}
      <div className="flex gap-3 items-start">
        {/* Focal picker — capped at 260 px so the image stays compact */}
        <div className="w-[260px] shrink-0">
          <FocalPointPicker
            src={src}
            focal={focal}
            onChange={onFocalChange}
            onDragStart={handleDragStart}
          />
        </div>

        {/* 2×2 crop previews */}
        <div className="flex-1 min-w-0 space-y-1.5">
          <p className="text-[10px] font-bold tracking-[0.12em] text-muted-foreground uppercase">
            Previews
          </p>
          <div className="grid grid-cols-2 gap-1.5">
          {PREVIEW_CONTEXTS.map(({ label, style, note, gradient, navBarHeightPct }) => (
            <div key={label} className="flex flex-col gap-1.5">
              <div
                className="relative w-full overflow-hidden rounded-sm border border-border bg-accent"
                style={style}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={src}
                  alt={label}
                  className="absolute inset-0 w-full h-full"
                  style={{
                    objectFit: "cover",
                    objectPosition: `${focal.x}% ${focal.y}%`,
                  }}
                  draggable={false}
                />
                {/* Gradient overlay — matches the real page */}
                {gradient && (
                  <div
                    className="absolute inset-0 pointer-events-none"
                    style={{ background: gradient }}
                  />
                )}
                {/* Nav bar simulation — represents the h-16 sticky header */}
                {navBarHeightPct !== null && (
                  <div
                    className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-2 border-b border-white/10"
                    style={{
                      height: `${navBarHeightPct}%`,
                      background: "rgba(10,10,10,0.92)",
                    }}
                  >
                    {/* Logo hint */}
                    <div className="flex items-center gap-0.5">
                      <div className="h-2 w-2 rounded-sm bg-vcl-gold/50" />
                      <div className="text-[3.5px] font-bold tracking-widest text-white/40 uppercase leading-none">
                        VCL
                      </div>
                    </div>
                    {/* Nav links hint */}
                    <div className="flex items-center gap-1">
                      <div className="h-px w-3 rounded bg-white/20" />
                      <div className="h-px w-3 rounded bg-white/20" />
                      <div className="h-1.5 w-4 rounded-sm bg-vcl-gold/40" />
                    </div>
                  </div>
                )}
              </div>
              <span className="text-[11px] font-semibold text-foreground leading-tight">
                {label}
              </span>
              <span className="text-[10px] text-muted-foreground leading-tight">
                {note}
              </span>
            </div>
          ))}
          </div>
        </div>
      </div>

      {/* Photographer credit + actions */}
      <div className="flex items-end gap-3 flex-wrap">
        <div className="flex-1 min-w-[160px] space-y-1">
          <Label htmlFor="photographerCredit" className="text-[10px] text-muted-foreground font-medium">
            Photographer <span className="font-normal">(optional)</span>
          </Label>
          <Input
            id="photographerCredit"
            value={photographerCredit}
            onChange={(e) => onPhotographerCreditChange(e.target.value)}
            placeholder="e.g. Jane Smith"
            className="h-7 text-xs"
          />
        </div>
        <div className="flex items-center gap-2 pb-px">
          <label className="inline-flex cursor-pointer items-center gap-1 rounded-sm border border-border px-2.5 py-1 text-[11px] font-semibold text-muted-foreground hover:border-vcl-gold/40 hover:text-vcl-gold transition-colors">
            Change Photo
            <input
              type="file"
              name="coverImageFile"
              accept="image/*"
              className="hidden"
              onChange={handleUpload}
            />
          </label>
          <button
            type="button"
            onClick={onRemove}
            className="inline-flex items-center gap-1 rounded-sm border border-border px-2.5 py-1 text-[11px] font-semibold text-muted-foreground hover:border-red-500/40 hover:text-red-400 transition-colors"
          >
            Remove
          </button>
        </div>
      </div>

      {(coverError || validationError) && (
        <p className="text-sm text-red-400">{coverError ?? validationError}</p>
      )}
    </div>
  );
}
