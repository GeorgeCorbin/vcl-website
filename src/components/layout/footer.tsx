 "use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FaInstagram, FaXTwitter, FaYoutube } from "react-icons/fa6";
import { FEATURES } from "@/lib/feature-flags";
import { VclLogo } from "@/components/layout/vcl-logo";

export function Footer() {
  const router = useRouter();

  const handleAdminClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    const hasAdminSession = document.cookie
      .split("; ")
      .some((cookie) => cookie === "vcl_admin_session=authenticated");

    router.push(hasAdminSession ? "/admin" : "/admin/login");
  };

  return (
    <footer className="border-t border-border bg-secondary">
      {/* Main footer grid */}
      <div className="mx-auto max-w-[1440px] px-6 py-12 md:px-12 md:py-16">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1 flex flex-col gap-4">
            <Link href="/" className="flex items-center gap-2.5">
              <VclLogo size="sm" />
              <span className="font-heading text-lg text-foreground">VCL</span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-[240px]">
              Strictly Club. Strictly Business.
            </p>
            <div className="flex gap-4">
              <a
                href="https://www.instagram.com/varsityclublacrosse/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <FaInstagram className="h-4 w-4" />
              </a>
              <a
                href="https://x.com/VarsityLacrosse"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="X / Twitter"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <FaXTwitter className="h-4 w-4" />
              </a>
              <a
                href="https://www.youtube.com/channel/UCCaeRbVrXas2w-Fiu4ZnwTA"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="YouTube"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <FaYoutube className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Coverage */}
          <div>
            <h3 className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground mb-4">
              Coverage
            </h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><Link href="/articles" className="hover:text-foreground transition-colors">Articles</Link></li>
              {FEATURES.MEDIA_POLLS && (
                <li><Link href="/polls" className="hover:text-foreground transition-colors">Media Poll Rankings</Link></li>
              )}
              {FEATURES.TRANSFERS && (
                <li><Link href="/transfers" className="hover:text-foreground transition-colors">Transfer Tracker</Link></li>
              )}
            </ul>
          </div>

          {/* Leagues */}
          <div>
            <h3 className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground mb-4">
              Leagues
            </h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><span>MCLA</span></li>
              <li><span>SMLL</span></li>
              <li><span>NCLL</span></li>
              <li><span>WCLL</span></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground mb-4">
              Company
            </h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><Link href="/about" className="hover:text-foreground transition-colors">About</Link></li>
              <li><Link href="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-foreground transition-colors">Terms of Service</Link></li>
              <li>
                <Link href="/admin/login" onClick={handleAdminClick} className="hover:text-foreground transition-colors">
                  Admin Login
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-border">
        <div className="mx-auto max-w-[1440px] px-6 py-4 md:px-12 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Varsity Club Lacrosse. All rights reserved.</p>
          <a
            href="https://www.instagram.com/varsityclublacrosse/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-vcl-gold/60 hover:text-vcl-gold transition-colors"
          >
            @varsityclublacrosse
          </a>
        </div>
      </div>
    </footer>
  );
}
