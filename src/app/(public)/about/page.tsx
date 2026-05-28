import Link from "next/link";
import { FEATURES } from "@/lib/feature-flags";

function missionFocusText() {
  const parts = ["news", "analysis"];
  if (FEATURES.MEDIA_POLLS) parts.push("rankings");
  if (FEATURES.TRANSFERS) parts.push("transfer information");
  if (parts.length === 1) return parts[0];
  if (parts.length === 2) return `${parts[0]} and ${parts[1]}`;
  return `${parts.slice(0, -1).join(", ")}, and ${parts[parts.length - 1]}`;
}

export default function AboutPage() {
  return (
    <div className="flex flex-col">
      {/* ── Page header ── */}
      <div className="border-b border-border bg-secondary">
        <div className="mx-auto max-w-[1440px] px-6 py-10 md:px-12 md:py-14">
          <nav className="flex items-center gap-2 text-xs text-muted-foreground mb-5">
            <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
            <span>/</span>
            <span className="text-foreground">About</span>
          </nav>
          <h1 className="font-heading text-6xl lg:text-7xl tracking-tight text-foreground">ABOUT VCL</h1>
          <p className="mt-3 text-vcl-gold text-sm font-semibold tracking-wide">Strictly Club. Strictly Business.</p>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="mx-auto w-full max-w-[1440px] px-6 py-12 md:px-12 md:py-16">
        <div className="max-w-3xl flex flex-col gap-14">

          {/* Mission */}
          <section>
            <h2 className="font-heading text-3xl tracking-wide text-foreground mb-5">OUR MISSION</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Varsity Club Lacrosse is dedicated to providing in-depth coverage of club lacrosse.
              We cover several leagues including the Men&apos;s Collegiate Lacrosse Association (MCLA),
              Southern Men&apos;s Lacrosse League (SMLL), National College Lacrosse League (NCLL), Women&apos;s Collegiate Lacrosse League (WCLL) and more. We aim to be the go-to
              destination for {missionFocusText()} for the club lacrosse community.
            </p>
          </section>

          {/* What we cover */}
          <section>
            <h2 className="font-heading text-3xl tracking-wide text-foreground mb-6">WHAT WE COVER</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-sm border border-border bg-card p-5">
                <h3 className="text-sm font-semibold text-foreground mb-2">Articles &amp; Analysis</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Game recaps, team previews, player spotlights, and in-depth analysis of the club lacrosse landscape.
                </p>
              </div>

              {FEATURES.MEDIA_POLLS && (
                <div className="rounded-sm border border-border bg-card p-5">
                  <h3 className="text-sm font-semibold text-foreground mb-2">Weekly Media Poll</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Comprehensive weekly rankings of the top teams across MCLA, SMLL, NCLL, and WCLL.
                  </p>
                </div>
              )}

              {FEATURES.TRANSFERS && (
                <div className="rounded-sm border border-border bg-card p-5">
                  <h3 className="text-sm font-semibold text-foreground mb-2">Transfer Tracker</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Stay updated on player movements between programs throughout the offseason and beyond.
                  </p>
                </div>
              )}

              <div className="rounded-sm border border-border bg-card p-5">
                <h3 className="text-sm font-semibold text-foreground mb-2">League Coverage</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Coverage of MCLA, SMLL, NCLL, WCLL and other club leagues across all conferences and divisions.
                </p>
              </div>
            </div>
          </section>

          {/* Contact */}
          <section>
            <h2 className="font-heading text-3xl tracking-wide text-foreground mb-5">CONTACT US</h2>
            <p className="text-sm text-muted-foreground leading-relaxed mb-6">
              Have a tip, story idea, or want to get involved? Visit our contact page to send a
              message or connect on social media.
            </p>
            <Link
              href="/contact"
              className="inline-flex h-10 items-center rounded-sm bg-vcl-gold px-5 text-sm font-semibold text-vcl-gold-foreground hover:bg-vcl-gold/90 transition-colors"
            >
              Get in touch
            </Link>
          </section>
        </div>
      </div>
    </div>
  );
}
