"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  FileText,
  Users,
  BarChart3,
  ArrowLeftRight,
  Settings,
  Home,
  Menu,
  LogOut,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useState } from "react";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: Home },
  { href: "/admin/articles", label: "Articles", icon: FileText },
  { href: "/admin/polls", label: "Media Polls", icon: BarChart3 },
  { href: "/admin/transfers", label: "Transfers", icon: ArrowLeftRight },
  { href: "/admin/teams", label: "Teams", icon: Users },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

function Sidebar({ className }: { className?: string }) {
  const pathname = usePathname();

  return (
    <div className={cn("flex flex-col h-full", className)}>
      <div className="flex-1 space-y-4 py-4">
        <div className="px-3 py-2">
          <div className="flex items-center justify-between mb-6">
            <Link href="/admin" className="flex items-center gap-2">
              <span className="text-xl font-bold">VCL Admin</span>
            </Link>
          </div>
          <div className="space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all hover:bg-accent",
                  pathname === item.href
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
      <div className="border-t border-border/40 p-4 space-y-3">
        <Link
          href="/"
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-vcl-gold transition-colors"
        >
          <ExternalLink className="h-4 w-4" />
          Back to Site
        </Link>
        <button
          onClick={() => {
            document.cookie = "vcl_admin_session=; path=/; max-age=0";
            window.location.href = "/admin/login";
          }}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-red-500 transition-colors w-full"
        >
          <LogOut className="h-4 w-4" />
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

  return (
    <div className="flex min-h-screen">
      {/* Mobile sidebar */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            className="md:hidden fixed top-4 left-4 z-40"
            size="icon"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <Sidebar />
        </SheetContent>
      </Sheet>

      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-64 flex-col border-r bg-background">
        <Sidebar />
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-4 md:p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
