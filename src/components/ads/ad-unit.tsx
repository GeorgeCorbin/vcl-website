"use client";

import { cn } from "@/lib/utils";
import { AdSenseUnit } from "./adsense-unit";

// ---------------------------------------------------------------------------
// Named placement components — one per distinct ad slot on the site.
// Each maps to a specific NEXT_PUBLIC_ADSENSE_SLOT_* env var so you can
// track performance per placement in AdSense. When switching ad networks,
// update adsense-unit.tsx and keep these components unchanged.
// ---------------------------------------------------------------------------

/** 728×90 leaderboard injected after the 2nd paragraph of an article */
export function ArticleInlineAd({ className }: { className?: string }) {
  return (
    <AdSenseUnit
      slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_ARTICLE_INLINE}
      format="horizontal"
      placeholderLabel="Article · 728×90 Leaderboard"
      style={{ minHeight: 90 }}
      className={cn("w-full", className)}
    />
  );
}

/** 300×250 medium rectangle in the article sidebar */
export function ArticleSidebarMediumAd({ className }: { className?: string }) {
  return (
    <AdSenseUnit
      slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_ARTICLE_SIDEBAR_MEDIUM}
      format="rectangle"
      responsive={false}
      placeholderLabel="Sidebar · 300×250"
      style={{ width: 300, height: 250 }}
      className={cn("mx-auto", className)}
    />
  );
}

/** 300×600 half-page in the article sidebar */
export function ArticleSidebarLargeAd({ className }: { className?: string }) {
  return (
    <AdSenseUnit
      slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_ARTICLE_SIDEBAR_LARGE}
      format="vertical"
      responsive={false}
      placeholderLabel="Sidebar · 300×600 Half Page"
      style={{ width: 300, height: 600 }}
      className={cn("mx-auto", className)}
    />
  );
}

/** Compact leaderboard in the homepage coverage strip (desktop only) */
export function HomeLeaderboardAd({ className }: { className?: string }) {
  return (
    <AdSenseUnit
      slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_HOME_LEADERBOARD}
      format="horizontal"
      placeholderLabel="Home · Leaderboard"
      style={{ minHeight: 40 }}
      className={cn("w-full max-w-[728px]", className)}
    />
  );
}

/** 970×90 billboard between sections on the homepage */
export function HomeBillboardAd({ className }: { className?: string }) {
  return (
    <AdSenseUnit
      slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_HOME_BILLBOARD}
      format="horizontal"
      placeholderLabel="Home · 970×90 Billboard"
      style={{ minHeight: 90 }}
      className={cn("w-full max-w-[970px]", className)}
    />
  );
}

/** 300×250 in the articles index sidebar */
export function ArticlesIndexMediumAd({ className }: { className?: string }) {
  return (
    <AdSenseUnit
      slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_ARTICLES_SIDEBAR_MEDIUM}
      format="rectangle"
      responsive={false}
      placeholderLabel="Articles · 300×250"
      style={{ width: 280, height: 250 }}
      className={cn("mx-auto", className)}
    />
  );
}

/** 300×600 in the articles index sidebar */
export function ArticlesIndexLargeAd({ className }: { className?: string }) {
  return (
    <AdSenseUnit
      slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_ARTICLES_SIDEBAR_LARGE}
      format="vertical"
      responsive={false}
      placeholderLabel="Articles · 300×600"
      style={{ width: 280, height: 600 }}
      className={cn("mx-auto", className)}
    />
  );
}

/** Responsive leaderboard used in the fixed bottom banner */
export function BottomBannerAd({ className }: { className?: string }) {
  return (
    <AdSenseUnit
      slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_BOTTOM_BANNER}
      format="auto"
      placeholderLabel="Bottom Banner"
      style={{ minHeight: 50 }}
      className={cn("w-full", className)}
    />
  );
}

// ---------------------------------------------------------------------------
// Legacy export kept for backward-compat — not used by public pages.
// ---------------------------------------------------------------------------
type AdSize = "banner" | "rectangle" | "leaderboard" | "skyscraper" | "sidebar";

interface AdUnitProps {
  size: AdSize;
  className?: string;
  slot?: string;
}

const adSizes: Record<AdSize, { label: string; style: React.CSSProperties }> = {
  banner:      { label: "Banner Ad (728×90)",      style: { width: "100%", height: 90 } },
  rectangle:   { label: "Rectangle Ad (300×250)",  style: { width: 300, height: 250 } },
  leaderboard: { label: "Leaderboard Ad (728×90)", style: { width: "100%", height: 90 } },
  skyscraper:  { label: "Skyscraper Ad (160×600)", style: { width: 160, height: 600 } },
  sidebar:     { label: "Sidebar Ad (300×250)",    style: { width: "100%", height: 250 } },
};

export function AdUnit({ size, className, slot }: AdUnitProps) {
  const { label, style } = adSizes[size];
  return (
    <AdSenseUnit
      slot={slot}
      placeholderLabel={label}
      style={style}
      className={className}
    />
  );
}
