import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ArticleService } from "@/lib/services";
import type { ArticleWithRelations } from "@/lib/services/article-service";
import { getActiveLeagues } from "@/lib/league-config";
import { ArticlesFilterBar } from "./articles-filter-bar";
import { ArticlesPagination, PAGE_SIZE } from "./articles-pagination";
import { ArticlesIndexMediumAd, ArticlesIndexLargeAd } from "@/components/ads";

type SearchParams = Promise<{ league?: string; tag?: string; q?: string; page?: string }>;

export default async function ArticlesPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const filters = {
    status: "PUBLISHED" as const,
    ...(params.tag && { tagSlug: params.tag }),
    ...(params.league && { league: params.league }),
    ...(params.q && { search: params.q }),
  };

  const [totalCount, leagues] = await Promise.all([
    ArticleService.count(filters).catch(() => 0),
    getActiveLeagues(),
  ]);
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const requestedPage = Math.max(1, parseInt(params.page ?? "1", 10) || 1);
  const currentPage = Math.min(requestedPage, totalPages);
  const offset = (currentPage - 1) * PAGE_SIZE;

  const articles = await ArticleService.list({
    ...filters,
    limit: PAGE_SIZE,
    offset,
  }).catch(() => []);

  return (
    <div className="flex flex-col">
      {/* ── Page header ── */}
      <div className="border-b border-border bg-secondary">
        <div className="mx-auto max-w-[1440px] px-6 py-10 md:px-12 md:py-12">
          <nav className="flex items-center gap-2 text-xs text-muted-foreground mb-5">
            <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
            <span>/</span>
            <span className="text-foreground">Articles</span>
          </nav>
          <h1 className="font-heading text-6xl lg:text-7xl tracking-tight text-foreground">ARTICLES</h1>
          <p className="mt-3 text-sm text-muted-foreground max-w-xl">
            News, analysis, and coverage of club lacrosse across all major leagues.
          </p>
        </div>
      </div>

      {/* ── Filter bar ── */}
      <ArticlesFilterBar activeLeague={params.league} activeSearch={params.q} leagues={leagues} />

      {/* ── Main content ── */}
      <div className="mx-auto w-full max-w-[1440px] px-6 py-12 md:px-12 md:py-14">
        <div className="flex gap-10 items-start">
          {/* Article grid */}
          <div className="flex-1 min-w-0">
            {articles.length === 0 ? (
              <div className="rounded-sm border border-border bg-card p-16 text-center">
                <p className="text-sm text-muted-foreground">
                  {params.q || params.league
                    ? "No articles match your search. Try adjusting your filters."
                    : "No articles published yet. Check back soon!"}
                </p>
              </div>
            ) : (
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {articles.map((article: ArticleWithRelations) => (
                  <Link
                    key={article.id}
                    href={`/articles/${article.slug}`}
                    className="group rounded-sm border border-border bg-card overflow-hidden hover:border-vcl-gold/40 transition-colors"
                  >
                    <div className="h-44 bg-accent overflow-hidden">
                      {article.coverImage && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={article.coverImage}
                          alt={article.title}
                          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      )}
                    </div>
                    <div className="p-5 flex flex-col gap-2.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        {article.league && (
                          <span className="rounded-sm bg-vcl-gold px-2 py-0.5 text-[9px] font-bold tracking-widest text-vcl-gold-foreground uppercase">
                            {article.league}
                          </span>
                        )}
                        {article.featured && (
                          <span className="rounded-sm border border-vcl-gold/40 px-2 py-0.5 text-[9px] font-bold tracking-widest text-vcl-gold uppercase">
                            Featured
                          </span>
                        )}
                        <span className="text-xs text-muted-foreground">
                          {article.publishedAt
                            ? new Date(article.publishedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                            : ""}
                        </span>
                      </div>
                      <h3 className="text-sm font-semibold text-foreground leading-snug line-clamp-2">
                        {article.title}
                      </h3>
                      {article.excerpt && (
                        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">{article.excerpt}</p>
                      )}
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-xs text-muted-foreground">{article.author ?? "Staff"}</span>
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-vcl-gold">
                          Read More <ArrowRight className="h-3 w-3" />
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            <ArticlesPagination
              currentPage={currentPage}
              totalPages={totalPages}
              league={params.league}
              tag={params.tag}
              q={params.q}
            />
          </div>

          {/* Sidebar — sticky so ads follow the reader */}
          <aside className="hidden xl:flex flex-col gap-6 w-[280px] shrink-0 sticky top-6 self-start">
            <ArticlesIndexMediumAd />

            {/* Popular topics */}
            <div className="rounded-sm border border-border bg-card p-5">
              <h3 className="text-[10px] font-bold tracking-[0.15em] text-muted-foreground uppercase mb-4">
                Popular Topics
              </h3>
              <div className="flex flex-wrap gap-2">
                {["Championship", "Rankings", "Transfers", "MCLA", "SMLL", "NCLL", "Season Preview", "Analysis"].map((t) => (
                  <span key={t} className="rounded-sm border border-border px-2.5 py-1 text-xs text-muted-foreground hover:text-foreground hover:border-vcl-gold/40 transition-colors cursor-pointer">
                    {t}
                  </span>
                ))}
              </div>
            </div>

            <ArticlesIndexLargeAd />
          </aside>
        </div>
      </div>
    </div>
  );
}
