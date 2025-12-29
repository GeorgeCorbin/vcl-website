"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { AdUnit } from "./ad-unit";

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

  const dismiss = () => {
    setIsOpen(false);
  };

  if (!isOpen || isAdminRoute) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex justify-center px-2 pb-4">
      <div className="pointer-events-auto relative w-full max-w-5xl rounded-2xl border border-border/50 bg-background/98 shadow-2xl shadow-black/15 backdrop-blur">
        <div className="flex items-center justify-between border-b border-border/40 px-4 py-2 text-xs uppercase tracking-[0.35em] text-muted-foreground">
          {/* <span>Advertisement</span> */}
          <button onClick={dismiss} className="rounded-full border border-border/80 px-2 py-1 text-[11px] font-semibold transition hover:bg-muted/40">
            Close
          </button>
        </div>
        <div className="px-4 py-4">
          <AdUnit size="leaderboard" slot="bottom-banner" className="mx-auto w-full max-w-[728px]" />
        </div>
      </div>
    </div>
  );
}
