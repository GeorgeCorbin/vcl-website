"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";
import { BottomBannerAd } from "./ad-unit";

/**
 * Fixed bottom ad banner.
 *
 * - Desktop: 728×90 responsive leaderboard in a dismissible card.
 * - Mobile: compact 320×50-style anchor — less intrusive, persists per session.
 *
 * Dismissed state is kept in React state (resets on hard refresh).
 * Hidden entirely on admin routes.
 */
export function BottomAdBanner() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith("/admin");

  useEffect(() => {
    if (isAdminRoute) {
      setIsOpen(false);
      return;
    }
    setIsOpen(true);
  }, [pathname, isAdminRoute]);

  if (!isOpen || isAdminRoute) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex justify-center px-2 pb-3 md:pb-4">
      <div className="pointer-events-auto relative w-full max-w-5xl rounded-sm border border-border/50 bg-background/98 shadow-2xl shadow-black/15 backdrop-blur">
        {/* Header row */}
        <div className="flex items-center justify-between border-b border-border/40 px-3 py-1.5">
          <span className="text-[9px] tracking-[0.3em] text-muted-foreground/50 uppercase font-medium select-none">
            Advertisement
          </span>
          <button
            onClick={() => setIsOpen(false)}
            aria-label="Close advertisement"
            className="rounded-sm p-1 text-muted-foreground/50 hover:text-muted-foreground hover:bg-muted/40 transition-colors"
          >
            <X className="h-3 w-3" />
          </button>
        </div>

        {/* Ad content */}
        <div className="px-3 py-3 md:px-4 md:py-4">
          <BottomBannerAd className="mx-auto w-full max-w-[728px]" />
        </div>
      </div>
    </div>
  );
}
