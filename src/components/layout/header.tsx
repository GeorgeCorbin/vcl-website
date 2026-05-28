"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { VclLogo } from "@/components/layout/vcl-logo";
import { Menu, Search, Instagram, X, ArrowRight } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { FEATURES } from "@/lib/feature-flags";

const allNavItems = [
  { href: "/articles", label: "Articles", feature: null },
  { href: "/polls", label: "Rankings", feature: "MEDIA_POLLS" as const },
  { href: "/transfers", label: "Transfers", feature: "TRANSFERS" as const },
  { href: "/about", label: "About", feature: null },
  { href: "/contact", label: "Contact", feature: null },
];

const navItems = allNavItems.filter(
  (item) => item.feature === null || FEATURES[item.feature]
);

type SearchResult = {
  title: string;
  slug: string;
  league: string | null;
  publishedAt: string | null;
  excerpt: string | null;
};

function useArticleSearch(query: string) {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (query.trim().length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    timerRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query.trim())}`);
        const data = await res.json();
        setResults(data.results ?? []);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 250);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [query]);

  return { results, loading };
}

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const { results, loading } = useArticleSearch(searchQuery);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setSelectedIndex(-1);
  }, [results]);

  const closeSearch = useCallback(() => {
    setSearchOpen(false);
    setSearchQuery("");
    setSelectedIndex(-1);
  }, []);

  const navigateTo = useCallback((slug: string) => {
    closeSearch();
    router.push(`/articles/${slug}`);
  }, [closeSearch, router]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (!q) return;
    if (selectedIndex >= 0 && results[selectedIndex]) {
      navigateTo(results[selectedIndex].slug);
      return;
    }
    closeSearch();
    router.push(`/articles?q=${encodeURIComponent(q)}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!results.length) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((i) => Math.max(i - 1, -1));
    }
  };

  const showSuggestions = searchQuery.trim().length >= 2;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background">
      <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between px-6 md:px-12">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5">
          <VclLogo />
          <div className="hidden sm:flex flex-col">
            <span className="font-heading text-xl leading-none tracking-wide text-foreground">VCL</span>
            <span className="text-[9px] font-semibold tracking-[0.15em] text-muted-foreground uppercase">
              Varsity Club Lacrosse
            </span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "text-[13px] font-medium transition-colors hover:text-foreground",
                pathname === item.href ? "text-foreground" : "text-muted-foreground"
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Right side */}
        <div className="hidden md:flex items-center gap-3">
          <button
            onClick={() => setSearchOpen(true)}
            className="flex items-center gap-2 h-9 rounded-sm border border-border px-3 text-[13px] text-muted-foreground hover:text-foreground transition-colors"
          >
            <Search className="h-3.5 w-3.5" />
            <span>Search</span>
          </button>
          <a
            href="https://www.instagram.com/varsityclublacrosse/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 h-9 rounded-sm bg-vcl-gold px-4 text-[13px] font-semibold text-vcl-gold-foreground hover:bg-vcl-gold/90 transition-colors"
          >
            <Instagram className="h-3.5 w-3.5" />
            Follow Us
          </a>
        </div>

        {/* Search dialog */}
        <Dialog open={searchOpen} onOpenChange={(v) => { if (!v) closeSearch(); else setSearchOpen(true); }}>
          <DialogContent className="sm:max-w-lg p-0 gap-0 border-border bg-background" onOpenAutoFocus={(e) => { e.preventDefault(); searchInputRef.current?.focus(); }}>
            <DialogTitle className="sr-only">Search articles</DialogTitle>
            <DialogDescription className="sr-only">
              Search VCL articles by keyword. Press Enter to search or use arrow keys to navigate suggestions.
            </DialogDescription>
            <form onSubmit={handleSearchSubmit} className="flex items-center gap-3 px-4 h-14 border-b border-border">
              <Search className="h-4 w-4 text-muted-foreground shrink-0" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search articles..."
                autoComplete="off"
                className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
              />
              {searchQuery && (
                <button type="button" onClick={() => setSearchQuery("")} className="text-muted-foreground hover:text-foreground transition-colors">
                  <X className="h-4 w-4" />
                </button>
              )}
            </form>

            {/* Live suggestions */}
            {showSuggestions && (
              <div className="flex flex-col">
                {loading && (
                  <div className="px-4 py-3 text-xs text-muted-foreground">Searching...</div>
                )}
                {!loading && results.length === 0 && (
                  <div className="px-4 py-3 text-xs text-muted-foreground">No articles found for &ldquo;{searchQuery}&rdquo;</div>
                )}
                {!loading && results.length > 0 && (
                  <>
                    {results.map((r, i) => (
                      <button
                        key={r.slug}
                        type="button"
                        onClick={() => navigateTo(r.slug)}
                        className={cn(
                          "flex items-start gap-3 px-4 py-3 text-left transition-colors border-b border-border last:border-0",
                          i === selectedIndex ? "bg-accent" : "hover:bg-accent/50"
                        )}
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground leading-snug line-clamp-1">{r.title}</p>
                          {r.excerpt && (
                            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{r.excerpt}</p>
                          )}
                        </div>
                        {r.league && (
                          <span className="shrink-0 rounded-sm bg-vcl-gold px-1.5 py-0.5 text-[9px] font-bold tracking-widest text-vcl-gold-foreground uppercase mt-0.5">
                            {r.league}
                          </span>
                        )}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => { closeSearch(); router.push(`/articles?q=${encodeURIComponent(searchQuery.trim())}`); }}
                      className="flex items-center justify-between px-4 py-2.5 text-xs font-semibold text-vcl-gold hover:bg-accent/50 transition-colors"
                    >
                      <span>See all results for &ldquo;{searchQuery}&rdquo;</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </>
                )}
              </div>
            )}

            {!showSuggestions && (
              <div className="px-4 py-3 text-xs text-muted-foreground">
                Type at least 2 characters &middot; <kbd className="rounded border border-border px-1.5 py-0.5 font-mono text-[10px]">↑↓</kbd> navigate &middot; <kbd className="rounded border border-border px-1.5 py-0.5 font-mono text-[10px]">Enter</kbd> search
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Mobile hamburger */}
        {mounted ? (
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild className="md:hidden">
              <button className="flex h-9 w-9 items-center justify-center rounded-sm border border-border">
                <Menu className="h-4 w-4" />
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72 bg-background border-border p-0">
              <div className="flex items-center gap-2.5 border-b border-border p-5">
                <VclLogo size="sm" />
                <span className="font-heading text-lg text-foreground">VCL</span>
              </div>
              <nav className="flex flex-col p-4 gap-1">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "rounded-sm px-3 py-2.5 text-sm font-medium transition-colors hover:bg-accent",
                      pathname === item.href
                        ? "text-foreground bg-accent"
                        : "text-muted-foreground"
                    )}
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
              {/* Mobile search */}
              <div className="px-4 pb-3">
                <button
                  onClick={() => { setOpen(false); setSearchOpen(true); }}
                  className="flex items-center gap-2 w-full h-10 rounded-sm border border-border px-3 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Search className="h-4 w-4 shrink-0" />
                  <span>Search articles...</span>
                </button>
              </div>
              <div className="p-4 border-t border-border">
                <a
                  href="https://www.instagram.com/varsityclublacrosse/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 h-10 w-full rounded-sm bg-vcl-gold text-[13px] font-semibold text-vcl-gold-foreground"
                >
                  <Instagram className="h-4 w-4" />
                  Follow @varsityclublacrosse
                </a>
              </div>
            </SheetContent>
          </Sheet>
        ) : (
          <button className="md:hidden flex h-9 w-9 items-center justify-center rounded-sm border border-border" aria-hidden="true" tabIndex={-1}>
            <Menu className="h-4 w-4" />
          </button>
        )}
      </div>
    </header>
  );
}
