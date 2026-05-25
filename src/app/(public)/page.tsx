import Link from "next/link";
import { ArrowRight, Instagram, Youtube } from "lucide-react";
import { FEATURES } from "@/lib/feature-flags";
import { ArticleService } from "@/lib/services";
import type { ArticleWithRelations } from "@/lib/services/article-service";
import { HeroCarousel } from "@/components/hero-carousel";
import { HomeLeaderboardAd, HomeBillboardAd } from "@/components/ads";

export default async function HomePage() {
  const recentArticles = await ArticleService.list({ status: "PUBLISHED", limit: 3 }).catch(() => []);

  const heroArticles = await ArticleService.list({ status: "PUBLISHED", limit: 10 }).catch(() => []);
  const heroSlides = heroArticles
    .filter((a: ArticleWithRelations) => !!a.coverImage)
    .slice(0, 5)
    .map((a: ArticleWithRelations) => ({
      image: a.coverImage!,
      title: a.title,
      league: a.league ?? null,
      slug: a.slug,
    }));

  return (
    <div className="flex flex-col">
      {/* ── Hero ── */}
      <HeroCarousel slides={heroSlides}>
        <div className="mx-auto w-full max-w-[1440px] px-6 pb-16 md:px-12">
          <div className="inline-flex items-center gap-2 mb-5">
            <span className="rounded-sm bg-vcl-gold px-3 py-1 text-[10px] font-bold tracking-[0.15em] text-vcl-gold-foreground uppercase">
              Strictly Club. Strictly Business.
            </span>
          </div>
          <h1 className="font-heading text-6xl sm:text-7xl lg:text-[96px] leading-[0.95] tracking-tight text-foreground max-w-3xl">
            YOUR SOURCE
            <br />FOR CLUB
            <br />LACROSSE
          </h1>
          <p className="mt-6 text-base text-muted-foreground max-w-xl leading-relaxed">
            Comprehensive coverage of MCLA, SMLL, NCLL, WCLL and more — news, analysis,
            and weekly media poll rankings.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/articles"
              className="inline-flex items-center gap-2 rounded-sm bg-vcl-gold px-7 py-3 text-sm font-bold text-vcl-gold-foreground hover:bg-vcl-gold/90 transition-colors"
            >
              Read Articles
              <ArrowRight className="h-4 w-4" />
            </Link>
            {FEATURES.MEDIA_POLLS && (
              <Link
                href="/polls"
                className="inline-flex items-center gap-2 rounded-sm border border-border bg-white/5 px-7 py-3 text-sm font-semibold text-foreground hover:bg-white/10 transition-colors"
              >
                View Rankings
              </Link>
            )}
          </div>
        </div>
      </HeroCarousel>

      {/* ── Coverage strip + leaderboard ad ── */}
      <section className="border-b border-border bg-secondary">
        <div className="mx-auto max-w-[1440px] px-6 md:px-12 h-14 flex items-center justify-between">
          <span className="text-[11px] font-semibold tracking-[0.2em] text-muted-foreground uppercase">
            Covering MCLA · SMLL · NCLL · WCLL and More
          </span>
          <div className="hidden lg:flex items-center justify-center min-w-[300px] max-w-[728px] w-full">
            <HomeLeaderboardAd className="h-10" />
          </div>
        </div>
      </section>

      {/* ── Latest Articles ── */}
      <section className="mx-auto w-full max-w-[1440px] px-6 py-14 md:px-12 md:py-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="font-heading text-3xl tracking-wide text-foreground">LATEST ARTICLES</h2>
          <Link href="/articles" className="inline-flex items-center gap-1.5 text-sm font-semibold text-vcl-gold hover:text-vcl-gold/80 transition-colors">
            View All <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {recentArticles.length === 0 ? (
          <div className="grid gap-5 md:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-sm border border-border bg-card overflow-hidden">
                <div className="h-48 bg-accent" />
                <div className="p-5">
                  <div className="h-3 w-16 rounded bg-accent mb-3" />
                  <div className="h-5 w-full rounded bg-accent mb-2" />
                  <div className="h-4 w-3/4 rounded bg-accent mb-4" />
                  <div className="h-3 w-1/2 rounded bg-accent" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-3">
            {recentArticles.map((article: ArticleWithRelations) => (
              <Link key={article.id} href={`/articles/${article.slug}`} className="group rounded-sm border border-border bg-card overflow-hidden hover:border-vcl-gold/40 transition-colors">
                <div className="h-48 bg-accent overflow-hidden">
                  {article.coverImage && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={article.coverImage} alt={article.title} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  )}
                </div>
                <div className="p-5 flex flex-col gap-2.5">
                  <div className="flex items-center gap-2">
                    <span className="rounded-sm bg-vcl-gold px-2 py-0.5 text-[9px] font-bold tracking-widest text-vcl-gold-foreground uppercase">
                      {article.league}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(article.publishedAt!).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </span>
                  </div>
                  <h3 className="text-sm font-semibold text-foreground leading-snug line-clamp-2">
                    {article.title}
                  </h3>
                  {article.excerpt && (
                    <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">{article.excerpt}</p>
                  )}
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs text-muted-foreground">By {article.author ?? "Staff"}</span>
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-vcl-gold">
                      Read More <ArrowRight className="h-3 w-3" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* ── Featured Spotlight ── */}
      {recentArticles.length > 0 && (() => {
        const featured = recentArticles.find((a: ArticleWithRelations) => a.featured) ?? recentArticles[0];
        return (
          <section className="border-y border-border bg-secondary">
            <div className="mx-auto max-w-[1440px] flex flex-col md:flex-row h-auto md:h-[460px] overflow-hidden">
              {/* Text col */}
              <div className="flex flex-col justify-center gap-5 px-6 py-10 md:px-14 md:w-[520px] shrink-0">
                <div className="flex items-center gap-2">
                  <span className="rounded-sm bg-vcl-gold px-2 py-0.5 text-[9px] font-bold tracking-widest text-vcl-gold-foreground uppercase">Featured</span>
                  {featured.league && (
                    <span className="text-[10px] font-semibold tracking-widest text-muted-foreground uppercase">{featured.league}</span>
                  )}
                </div>
                <h2 className="font-heading text-3xl lg:text-4xl leading-[0.95] tracking-wide text-foreground">{featured.title}</h2>
                {featured.excerpt && (
                  <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">{featured.excerpt}</p>
                )}
                <Link
                  href={`/articles/${featured.slug}`}
                  className="self-start inline-flex items-center gap-2 rounded-sm bg-vcl-gold px-5 py-2.5 text-sm font-bold text-vcl-gold-foreground hover:bg-vcl-gold/90 transition-colors"
                >
                  Read Story <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
              {/* Image col */}
              <div className="flex-1 min-h-[240px] bg-accent overflow-hidden">
                {featured.coverImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={featured.coverImage} alt={featured.title} className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full bg-accent" />
                )}
              </div>
            </div>
          </section>
        );
      })()}

      {/* ── Mid-page billboard ad ── */}
      <div className="border-y border-border bg-secondary">
        <div className="mx-auto max-w-[1440px] px-6 py-5 md:px-12 flex items-center justify-center">
          <HomeBillboardAd className="h-[90px]" />
        </div>
      </div>

      {/* ── Rankings teaser (conditional) ── */}
      {FEATURES.MEDIA_POLLS && (
        <section className="mx-auto w-full max-w-[1440px] px-6 py-14 md:px-12 md:py-16">
          <div className="flex flex-col lg:flex-row gap-12 items-start">
            <div className="flex flex-col gap-5 lg:w-[420px] shrink-0">
              <h2 className="font-heading text-5xl leading-[0.95] tracking-wide text-foreground">
                MEDIA POLL
                <br />RANKINGS
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Weekly rankings from our panel of club lacrosse media members covering all major conferences.
              </p>
              <Link
                href="/polls"
                className="self-start inline-flex items-center gap-2 rounded-sm border border-vcl-gold px-5 py-2.5 text-sm font-semibold text-vcl-gold hover:bg-vcl-gold/10 transition-colors"
              >
                View Full Rankings
              </Link>
            </div>
            <div className="flex-1 rounded-sm border border-border bg-card overflow-hidden w-full">
              <div className="flex items-center px-4 h-10 bg-secondary border-b border-border">
                <span className="text-[10px] font-bold tracking-[0.15em] text-muted-foreground uppercase flex-1">Rank</span>
                <span className="text-[10px] font-bold tracking-[0.15em] text-muted-foreground uppercase flex-1">Team</span>
                <span className="text-[10px] font-bold tracking-[0.15em] text-muted-foreground uppercase w-24">Conf</span>
              </div>
              <div className="divide-y divide-border text-sm">
                <p className="py-8 text-center text-muted-foreground text-xs">
                  No rankings published yet.
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── Social CTA ── */}
      <section className="border-t border-border bg-background py-16 md:py-20">
        <div className="mx-auto max-w-[1440px] px-6 md:px-12 text-center flex flex-col items-center gap-6">
          <h2 className="font-heading text-5xl lg:text-6xl tracking-wide text-foreground">
            FOLLOW THE COVERAGE
          </h2>
          <p className="text-sm text-muted-foreground max-w-lg leading-relaxed">
            Stay updated with the latest club lacrosse news, rankings, and analysis across all platforms.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <a
              href="https://www.instagram.com/varsityclublacrosse/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-sm bg-[#C13584] px-6 py-3 text-sm font-semibold text-white hover:bg-[#C13584]/90 transition-colors"
            >
              <Instagram className="h-4 w-4" /> Instagram
            </a>
            <a
              href="https://x.com/VarsityLacrosse"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-sm bg-black px-6 py-3 text-sm font-semibold text-white hover:bg-neutral-900 transition-colors border border-white/20"
            >
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              X / Twitter
            </a>
            <a
              href="https://www.youtube.com/channel/UCCaeRbVrXas2w-Fiu4ZnwTA"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-sm bg-[#FF0000] px-6 py-3 text-sm font-semibold text-white hover:bg-[#FF0000]/90 transition-colors"
            >
              <Youtube className="h-4 w-4" /> YouTube
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
