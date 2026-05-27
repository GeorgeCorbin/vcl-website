"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";
import { BottomBannerAd } from "./ad-unit";

const STORAGE_KEY = "vcl_banner_dismissed_until";

// How long a dismissal lasts — 24 hours
const DISMISS_TTL_MS = 24 * 60 * 60 * 1000;

// Delay before the banner slides in on first render (ms)
// Gives the reader time to start engaging with the page
const SHOW_DELAY_MS = 3000;

// Only show on these path prefixes — article pages are money pages,
// homepage and index are lighter touches
const SHOW_ON_PATHS = ["/articles/", "/"];

function isDismissed(): boolean {
  try {
    const val = localStorage.getItem(STORAGE_KEY);
    if (!val) return false;
    return Date.now() < parseInt(val, 10);
  } catch {
    return false;
  }
}

function recordDismiss() {
  try {
    localStorage.setItem(STORAGE_KEY, String(Date.now() + DISMISS_TTL_MS));
  } catch {
    // localStorage unavailable (private browsing, etc.) — fail silently
  }
}

/**
 * Fixed bottom ad banner with frequency capping.
 *
 * - Appears after a short delay so it doesn't interrupt initial page load.
 * - Dismissed state persists in localStorage for 24 hours — the banner
 *   will not re-appear across page navigations or browser restarts during
 *   that window.
 * - Only shown on article pages and the homepage (the site's money pages).
 * - Hidden on admin routes.
 */
export function BottomAdBanner() {
  const [visible, setVisible] = useState(false);
  const pathname = usePathname();

  const isAdminRoute = pathname?.startsWith("/admin");
  const isEligiblePath = SHOW_ON_PATHS.some(
    (p) => p === "/" ? pathname === "/" : pathname?.startsWith(p)
  );

  useEffect(() => {
    if (isAdminRoute || !isEligiblePath) return;
    if (isDismissed()) return;

    const timer = window.setTimeout(() => setVisible(true), SHOW_DELAY_MS);
    return () => window.clearTimeout(timer);
    // Re-evaluate on navigation (pathname change)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  function dismiss() {
    setVisible(false);
    recordDismiss();
  }

  if (!visible) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex justify-center px-2 pb-3 md:pb-4 animate-in slide-in-from-bottom-4 duration-300">
      <div className="pointer-events-auto relative w-full max-w-5xl rounded-sm border border-border/50 bg-background/98 shadow-2xl shadow-black/15 backdrop-blur">
        {/* Header row */}
        <div className="flex items-center justify-between border-b border-border/40 px-3 py-1.5">
          <span className="text-[9px] tracking-[0.3em] text-muted-foreground/50 uppercase font-medium select-none">
            Advertisement
          </span>
          <button
            onClick={dismiss}
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
