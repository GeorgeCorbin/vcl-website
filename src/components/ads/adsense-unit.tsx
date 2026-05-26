"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { FEATURES } from "@/lib/feature-flags";
import { ADSENSE_LOADED_EVENT } from "./adsense-script";

const CLIENT_ID = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID;

/**
 * Set NEXT_PUBLIC_ADSENSE_TEST_MODE="true" in your env to enable AdSense
 * test mode. Test ads look real but generate zero invalid clicks/impressions,
 * so you can verify layouts without risking your account.
 * Remove or set to "false" before going to production.
 */
const TEST_MODE = process.env.NEXT_PUBLIC_ADSENSE_TEST_MODE === "true";

interface AdSenseUnitProps {
  /** AdSense ad unit slot ID (e.g. "1234567890") */
  slot: string | undefined;
  format?: "auto" | "rectangle" | "vertical" | "horizontal" | "fluid";
  /** e.g. "in-article" for native in-article units (requires format "fluid") */
  layout?: "in-article";
  responsive?: boolean;
  style?: React.CSSProperties;
  className?: string;
  /** Human-readable label shown in the placeholder when not configured */
  placeholderLabel?: string;
}

/**
 * Renders a Google AdSense ad unit.
 *
 * - Respects the FEATURES.ADS_PUBLIC feature flag — when false, every ad
 *   slot on the site returns null, including the bottom banner.
 * - Shows a styled placeholder when the env vars are not configured so the
 *   layout is preserved in development / staging.
 * - Supports test mode via NEXT_PUBLIC_ADSENSE_TEST_MODE="true".
 *
 * To swap ad networks later, replace this file's implementation while
 * keeping the same props interface consumed by placement components.
 */
export function AdSenseUnit({
  slot,
  format = "auto",
  layout,
  responsive = true,
  style,
  className,
  placeholderLabel,
}: AdSenseUnitProps) {
  const insRef = useRef<HTMLModElement>(null);
  const pushed = useRef(false);

  useEffect(() => {
    if (!CLIENT_ID || !slot || pushed.current) return;

    const requestAd = () => {
      if (pushed.current || !insRef.current) return;
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
        pushed.current = true;
      } catch {
        // Script not ready yet — event listener or interval will retry
      }
    };

    // Script already on the page (e.g. navigated client-side)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((window as any).adsbygoogle?.loaded) {
      requestAd();
      return;
    }

    window.addEventListener(ADSENSE_LOADED_EVENT, requestAd);
    const interval = window.setInterval(requestAd, 300);
    const timeout = window.setTimeout(() => window.clearInterval(interval), 15_000);

    return () => {
      window.removeEventListener(ADSENSE_LOADED_EVENT, requestAd);
      window.clearInterval(interval);
      window.clearTimeout(timeout);
    };
  }, [slot]);

  // Single kill-switch for all public ad rendering
  if (!FEATURES.ADS_PUBLIC) return null;

  if (!CLIENT_ID || !slot) {
    return (
      <div
        className={cn(
          "bg-muted/30 border border-dashed border-border/40 rounded-sm flex flex-col items-center justify-center gap-1 text-muted-foreground/40",
          className
        )}
        style={style}
      >
        {placeholderLabel && (
          <span className="text-[10px] tracking-[0.15em] uppercase font-medium">
            {placeholderLabel}
          </span>
        )}
        <span className="text-[9px]">Advertisement</span>
      </div>
    );
  }

  return (
    <ins
      ref={insRef}
      className={cn("adsbygoogle", className)}
      style={{ display: "block", textAlign: layout === "in-article" ? "center" : undefined, ...style }}
      data-ad-client={CLIENT_ID}
      data-ad-slot={slot}
      data-ad-format={format}
      data-ad-layout={layout}
      data-full-width-responsive={layout ? undefined : responsive ? "true" : undefined}
      data-adtest={TEST_MODE ? "on" : undefined}
    />
  );
}
