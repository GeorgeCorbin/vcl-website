"use client";

import { cn } from "@/lib/utils";

type AdSize = "banner" | "rectangle" | "leaderboard" | "skyscraper" | "sidebar";

interface AdUnitProps {
  size: AdSize;
  className?: string;
  slot?: string;
}

const adSizes: Record<AdSize, { width: string; height: string; label: string }> = {
  banner: { width: "w-full", height: "h-[90px]", label: "Banner Ad (728x90)" },
  rectangle: { width: "w-full max-w-[300px]", height: "h-[250px]", label: "Rectangle Ad (300x250)" },
  leaderboard: { width: "w-full", height: "h-[90px] md:h-[90px]", label: "Leaderboard Ad (728x90)" },
  skyscraper: { width: "w-[160px]", height: "h-[600px]", label: "Skyscraper Ad (160x600)" },
  sidebar: { width: "w-full", height: "h-[250px]", label: "Sidebar Ad (300x250)" },
};

export function AdUnit({ size, className, slot }: AdUnitProps) {
  const { width, height, label } = adSizes[size];

  return (
    <div
      className={cn(
        "bg-muted/50 border border-dashed border-border/50 rounded-lg flex items-center justify-center",
        width,
        height,
        className
      )}
      data-ad-slot={slot}
    >
      <div className="text-center p-4">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-[10px] text-muted-foreground/60 mt-1">Ad Placeholder</p>
      </div>
    </div>
  );
}

export function SidebarAds({ className }: { className?: string }) {
  return (
    <aside className={cn("space-y-6", className)}>
      <AdUnit size="sidebar" slot="sidebar-top" />
      <AdUnit size="sidebar" slot="sidebar-bottom" />
    </aside>
  );
}

export function InlineAd({ className }: { className?: string }) {
  return (
    <div className={cn("my-8", className)}>
      <AdUnit size="rectangle" slot="inline-content" className="mx-auto" />
    </div>
  );
}

export function LeaderboardAd({ className }: { className?: string }) {
  return (
    <div className={cn("my-6 flex justify-center", className)}>
      <AdUnit size="leaderboard" slot="leaderboard" className="max-w-[728px]" />
    </div>
  );
}
