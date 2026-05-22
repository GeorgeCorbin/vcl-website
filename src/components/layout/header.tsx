"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { VclLogo } from "@/components/layout/vcl-logo";
import { Menu, Search, Instagram, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { FEATURES } from "@/lib/feature-flags";

const allNavItems = [
  { href: "/articles", label: "Articles", feature: null },
  { href: "/polls", label: "Rankings", feature: "MEDIA_POLLS" as const },
  { href: "/transfers", label: "Transfers", feature: "TRANSFERS" as const },
  { href: "/about", label: "About", feature: null },
];

const navItems = allNavItems.filter(
  (item) => item.feature === null || FEATURES[item.feature]
);

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchQuery.trim();
    setSearchOpen(false);
    setSearchQuery("");
    router.push(`/articles${q ? `?q=${encodeURIComponent(q)}` : ""}`);
  };

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
        <Dialog open={searchOpen} onOpenChange={(v) => { setSearchOpen(v); if (!v) setSearchQuery(""); }}>
          <DialogContent className="sm:max-w-lg p-0 gap-0 border-border bg-background" onOpenAutoFocus={(e) => { e.preventDefault(); searchInputRef.current?.focus(); }}>
            <DialogTitle className="sr-only">Search articles</DialogTitle>
            <DialogDescription className="sr-only">
              Search VCL articles by keyword. Press Enter to search or Escape to close.
            </DialogDescription>
            <form onSubmit={handleSearchSubmit} className="flex items-center gap-3 px-4 h-14 border-b border-border">
              <Search className="h-4 w-4 text-muted-foreground shrink-0" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search articles..."
                className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
              />
              {searchQuery && (
                <button type="button" onClick={() => setSearchQuery("")} className="text-muted-foreground hover:text-foreground transition-colors">
                  <X className="h-4 w-4" />
                </button>
              )}
            </form>
            <div className="px-4 py-3 text-xs text-muted-foreground">
              Press <kbd className="rounded border border-border px-1.5 py-0.5 font-mono text-[10px]">Enter</kbd> to search, <kbd className="rounded border border-border px-1.5 py-0.5 font-mono text-[10px]">Esc</kbd> to close
            </div>
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
