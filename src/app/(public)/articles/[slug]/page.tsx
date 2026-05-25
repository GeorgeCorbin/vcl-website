import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ArticleService } from "@/lib/services";
import {
  ArticleInlineAd,
  ArticleSidebarMediumAd,
  ArticleSidebarLargeAd,
} from "@/components/ads";

interface ArticlePageProps {
  params: Promise<{ slug: string }>;
}

function getReadTime(html: string): number {
  const text = html.replace(/<[^>]+>/g, " ");
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

/**
 * Splits HTML at the Nth closing </p> tag so we can inject an ad
 * above the fold break rather than at the very end of the article.
 */
function splitAtParagraph(html: string, afterParagraph: number): [string, string] {
  let count = 0;
  let idx = 0;
  while (count < afterParagraph) {
    const next = html.indexOf("</p>", idx);
    if (next === -1) return [html, ""];
    count++;
    idx = next + 4;
  }
  return [html.slice(0, idx), html.slice(idx)];
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params;
  const article = await ArticleService.getBySlug(slug);

  if (!article || article.status !== "PUBLISHED") {
    notFound();
  }

  const allRecent = await ArticleService.list({ status: "PUBLISHED", limit: 4 }).catch(() => []);
  const relatedArticles = allRecent.filter((a) => a.id !== article.id).slice(0, 3);
  const readTime = getReadTime(article.content);

  // Split content: first 2 paragraphs → inline ad → remainder
  const [contentBefore, contentAfter] = splitAtParagraph(article.content, 2);

  return (
    <div className="flex flex-col">
      {/* ── Hero ── */}
      <div className="relative h-[480px] overflow-hidden bg-[#0d0d0d]">
        {article.coverImage && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={article.coverImage}
            alt={article.title}
            className="absolute inset-0 h-full w-full object-cover"
          />
        )}
        <div className="absolute inset-0" style={{background: "linear-gradient(180deg, #00000000 0%, #0A0A0Acc 55%, #0A0A0A 90%)"}} />
        <div className="absolute bottom-0 left-0 right-0 mx-auto max-w-[1440px] px-6 pb-10 md:px-12" style={{maxWidth: "1440px", left: "50%", transform: "translateX(-50%)", width: "100%"}}>
          <div className="flex items-center gap-2 mb-4">
            {article.league && (
              <span className="rounded-sm bg-vcl-gold px-2.5 py-1 text-[9px] font-bold tracking-[0.15em] text-vcl-gold-foreground uppercase">
                {article.league}
              </span>
            )}
            {article.featured && (
              <span className="rounded-sm border border-white/25 px-2.5 py-1 text-[9px] font-bold tracking-[0.15em] text-foreground uppercase">
                Featured
              </span>
            )}
          </div>
          <h1 className="font-heading text-[52px] leading-none tracking-wide text-foreground max-w-[860px]">
            {article.title}
          </h1>
        </div>
      </div>

      {/* ── Body + Sidebar ── */}
      <div className="mx-auto w-full max-w-[1440px] px-6 py-12 md:px-12 md:py-14">
        <div className="flex gap-12 items-start">

          {/* Article body */}
          <div className="flex-1 min-w-0">
            {/* Metadata + share row */}
            <div className="flex flex-col gap-4 pb-8 mb-8 border-b border-border">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3 text-[13px] flex-wrap">
                  {article.author && (
                    <span className="font-semibold text-foreground">By {article.author}</span>
                  )}
                  {article.author && article.publishedAt && (
                    <span className="text-muted-foreground">·</span>
                  )}
                  {article.publishedAt && (
                    <span className="text-muted-foreground">
                      {new Date(article.publishedAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                    </span>
                  )}
                  <span className="text-muted-foreground">·</span>
                  <span className="text-muted-foreground">{readTime} min read</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Share:</span>
                  <span className="flex items-center justify-center w-[30px] h-[30px] rounded-sm border border-border text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                    <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                  </span>
                  <span className="flex items-center justify-center w-[30px] h-[30px] rounded-sm border border-border text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                    <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
                  </span>
                </div>
              </div>
            </div>

            {/* Content — first 2 paragraphs */}
            {contentBefore && (
              <div
                className="prose prose-invert prose-sm md:prose-base max-w-none
                  prose-headings:font-heading prose-headings:tracking-wide
                  prose-a:text-vcl-gold prose-a:no-underline hover:prose-a:underline
                  prose-strong:text-foreground
                  prose-blockquote:border-l-vcl-gold prose-blockquote:text-muted-foreground"
                dangerouslySetInnerHTML={{ __html: contentBefore }}
              />
            )}

            {/* ── In-article leaderboard (above the fold break, after ~2 paragraphs) ── */}
            <div className="my-8">
              <ArticleInlineAd />
            </div>

            {/* Content — remainder */}
            {contentAfter && (
              <div
                className="prose prose-invert prose-sm md:prose-base max-w-none
                  prose-headings:font-heading prose-headings:tracking-wide
                  prose-a:text-vcl-gold prose-a:no-underline hover:prose-a:underline
                  prose-strong:text-foreground
                  prose-blockquote:border-l-vcl-gold prose-blockquote:text-muted-foreground"
                dangerouslySetInnerHTML={{ __html: contentAfter }}
              />
            )}

            {/* Tags */}
            {article.tags.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 pt-6 mt-6 border-t border-border">
                <span className="text-[10px] font-bold tracking-[0.15em] text-muted-foreground uppercase">Tags:</span>
                {article.tags.map((tag) => (
                  <Link
                    key={tag.slug}
                    href={`/articles?tag=${tag.slug}`}
                    className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground hover:text-foreground hover:border-vcl-gold/40 transition-colors"
                  >
                    {tag.name}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* ── Sidebar — sticky so ads follow the reader ── */}
          <aside className="hidden lg:flex flex-col gap-6 w-[300px] shrink-0 sticky top-6 self-start">
            {/* 300×250 medium rectangle */}
            <ArticleSidebarMediumAd />

            {relatedArticles.length > 0 && (
              <div className="rounded-sm border border-border bg-card p-4">
                <h3 className="text-[10px] font-bold tracking-[0.2em] text-muted-foreground uppercase pb-4 border-b border-border">
                  Related Articles
                </h3>
                <div className="flex flex-col">
                  {relatedArticles.map((rel) => (
                    <Link key={rel.id} href={`/articles/${rel.slug}`} className="group flex flex-col gap-1.5 py-3 border-b border-border last:border-0 hover:opacity-80 transition-opacity">
                      {rel.league && (
                        <span className="text-[10px] font-bold tracking-[0.15em] text-vcl-gold uppercase">{rel.league}</span>
                      )}
                      <span className="text-[13px] font-semibold text-foreground leading-snug line-clamp-2">
                        {rel.title}
                      </span>
                      {rel.publishedAt && (
                        <span className="text-[11px] text-muted-foreground">
                          {new Date(rel.publishedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </span>
                      )}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* 300×600 half-page */}
            <ArticleSidebarLargeAd />
          </aside>
        </div>
      </div>

      {/* ── Bottom back bar ── */}
      <div className="border-t border-border bg-secondary">
        <div className="mx-auto max-w-[1440px] px-6 py-5 md:px-12">
          <Link
            href="/articles"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Articles
          </Link>
        </div>
      </div>
    </div>
  );
}
