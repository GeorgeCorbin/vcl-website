import Link from "next/link";
import Image from "next/image";
import { Instagram, Twitter, Youtube } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border/40 bg-muted/30">
      <div className="container mx-auto px-4 py-12 md:px-6 md:py-16">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div className="sm:col-span-2 lg:col-span-1">
            <Link href="/" className="flex items-center gap-3">
              <Image
                src="/vcl_logo3.png"
                alt="Varsity Club Lacrosse"
                width={48}
                height={48}
                className="h-12 w-auto"
              />
              <div>
                <span className="text-lg font-bold">Varsity Club Lacrosse</span>
                <p className="text-xs text-vcl-gold font-medium">Strictly Club. Strictly Business.</p>
              </div>
            </Link>
            <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
              Your source for club lacrosse coverage. Primarily MCLA, plus SMLL, NCLL, WCLL and more.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-sm uppercase tracking-wider text-foreground">Content</h3>
            <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
              <li>
                <Link href="/articles" className="hover:text-foreground">
                  Articles
                </Link>
              </li>
              <li>
                <Link href="/polls" className="hover:text-foreground">
                  Media Poll
                </Link>
              </li>
              <li>
                <Link href="/transfers" className="hover:text-foreground">
                  Transfers
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-sm uppercase tracking-wider text-foreground">About</h3>
            <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
              <li>
                <Link href="/about" className="hover:text-foreground">
                  About VCL
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-foreground">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-sm uppercase tracking-wider text-foreground">Follow Us</h3>
            <div className="mt-4 flex gap-3">
              <a
                href="https://www.instagram.com/varsityclublacrosse/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center h-10 w-10 rounded-full bg-background border border-border hover:bg-vcl-gold hover:border-vcl-gold hover:text-vcl-gold-foreground transition-colors"
                aria-label="Follow on Instagram"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href="https://x.com/VarsityLacrosse"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center h-10 w-10 rounded-full bg-background border border-border hover:bg-vcl-gold hover:border-vcl-gold hover:text-vcl-gold-foreground transition-colors"
                aria-label="Follow on X"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a
                href="https://www.youtube.com/channel/UCCaeRbVrXas2w-Fiu4ZnwTA"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center h-10 w-10 rounded-full bg-background border border-border hover:bg-vcl-gold hover:border-vcl-gold hover:text-vcl-gold-foreground transition-colors"
                aria-label="Subscribe on YouTube"
              >
                <Youtube className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-border/40 pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Varsity Club Lacrosse. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
