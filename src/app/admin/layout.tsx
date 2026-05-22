"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  FileText,
  Users,
  BarChart3,
  Settings,
  Home,
  Menu,
  LogOut,
  ExternalLink,
  FileEdit,
  Trophy,
  ArrowLeftRight,
  Megaphone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useEffect, useState } from "react";
import { FEATURES } from "@/lib/feature-flags";
import { VclLogo } from "@/components/layout/vcl-logo";

const allNavItems = [
  { href: "/admin", label: "Dashboard", icon: Home, feature: null },
  { href: "/admin/articles", label: "Articles", icon: FileText, feature: null },
  { href: "/admin/teams", label: "Teams", icon: Users, feature: null },
  { href: "/admin/polls", label: "Media Polls", icon: BarChart3, feature: "MEDIA_POLLS" as const },
  { href: "/admin/transfers", label: "Transfers", icon: ArrowLeftRight, feature: "TRANSFERS" as const },
  { href: "/admin/leagues", label: "Leagues", icon: Trophy, feature: null },
  { href: "/admin/content", label: "Content", icon: FileEdit, feature: null },
  { href: "/admin/ads", label: "Ads", icon: Megaphone, feature: "ADS_ADMIN" as const },
  { href: "/admin/settings", label: "Settings", icon: Settings, feature: null },
];

const navItems = allNavItems.filter(
  (item) => item.feature === null || FEATURES[item.feature]
);

function Sidebar({ className, onClose }: { className?: string; onClose?: () => void }) {
  const pathname = usePathname();

  return (
    <div className={cn("flex flex-col h-full bg-secondary border-r border-border", className)}>
      {/* Brand */}
      <div className="flex items-center gap-2.5 h-16 px-5 border-b border-border shrink-0">
        <VclLogo size="sm" />
        <div className="flex flex-col">
          <span className="font-heading text-base text-foreground leading-none">VCL Admin</span>
          <span className="text-[9px] tracking-widest text-muted-foreground uppercase">Dashboard</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 flex flex-col gap-0.5">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={cn(
                "flex items-center gap-3 rounded-sm px-3 py-2.5 text-[13px] font-medium transition-colors",
                isActive
                  ? "bg-vcl-gold text-vcl-gold-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-border p-3 flex flex-col gap-0.5 shrink-0">
        <Link
          href="/"
          className="flex items-center gap-3 rounded-sm px-3 py-2.5 text-[13px] text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
        >
          <ExternalLink className="h-4 w-4 shrink-0" />
          Back to Site
        </Link>
        <button
          onClick={() => {
            document.cookie = "vcl_admin_session=; path=/; max-age=0";
            window.location.href = "/admin/login";
          }}
          className="flex items-center gap-3 rounded-sm px-3 py-2.5 text-[13px] text-muted-foreground hover:bg-accent hover:text-red-400 transition-colors w-full text-left"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          Sign Out
        </button>
      </div>
    </div>
  );
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const isAuthPage = pathname === "/admin/login";

  useEffect(() => {
    setMounted(true);
  }, []);

  if (isAuthPage) {
    return (
      <main className="min-h-screen bg-background">
        <div className="p-4 md:p-6 lg:p-8">{children}</div>
      </main>
    );
  }

  if (!mounted) {
    return (
      <div className="flex min-h-screen bg-background">
        <aside className="hidden md:block w-64 border-r border-border bg-secondary" />
        <main className="flex-1" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Mobile sidebar */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <button className="md:hidden fixed top-4 left-4 z-40 flex h-9 w-9 items-center justify-center rounded-sm border border-border bg-secondary">
            <Menu className="h-4 w-4" />
          </button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0 border-border">
          <Sidebar onClose={() => setOpen(false)} />
        </SheetContent>
      </Sheet>

      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-64 flex-col shrink-0">
        <div className="sticky top-0 h-screen">
          <Sidebar />
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 min-w-0 overflow-y-auto">
        <div className="p-6 md:p-8">{children}</div>
      </main>
    </div>
  );
}
