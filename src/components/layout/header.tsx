"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { useEffect, useState } from "react";
import { FEATURES } from "@/lib/feature-flags";

const allNavItems = [
  { href: "/", label: "Home", feature: null },
  { href: "/articles", label: "Articles", feature: null },
  { href: "/polls", label: "Media Poll", feature: "MEDIA_POLLS" as const },
  { href: "/transfers", label: "Transfers", feature: "TRANSFERS" as const },
  { href: "/about", label: "About", feature: null },
];

const navItems = allNavItems.filter(
  (item) => item.feature === null || FEATURES[item.feature]
);

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/vcl_logo3.png"
            alt="Varsity Club Lacrosse"
            width={40}
            height={40}
            className="h-10 w-auto"
          />
          <div className="hidden sm:block">
            <span className="text-lg font-bold tracking-tight">Varsity Club Lacrosse</span>
            <p className="text-xs text-vcl-gold font-medium">Strictly Club. Strictly Business.</p>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary",
                pathname === item.href
                  ? "text-foreground"
                  : "text-muted-foreground"
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Mobile Navigation */}
        {mounted ? (
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <div className="flex items-center gap-3 mb-8">
                <Image
                  src="/vcl_logo3.png"
                  alt="Varsity Club Lacrosse"
                  width={32}
                  height={32}
                  className="h-8 w-auto"
                />
                <div>
                  <span className="font-bold">VCL</span>
                  <p className="text-xs text-vcl-gold font-medium">Strictly Club. Strictly Business.</p>
                </div>
              </div>
              <nav className="flex flex-col gap-4">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "text-lg font-medium transition-colors hover:text-primary",
                      pathname === item.href
                        ? "text-foreground"
                        : "text-muted-foreground"
                    )}
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        ) : (
          <Button variant="ghost" size="icon" className="md:hidden" aria-hidden="true" tabIndex={-1}>
            <Menu className="h-5 w-5" />
          </Button>
        )}
      </div>
    </header>
  );
}
