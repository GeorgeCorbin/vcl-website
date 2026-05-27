import Link from "next/link";
import { format } from "date-fns";
import { Plus, Pencil } from "lucide-react";
import prisma from "@/lib/db";
import { ArticleStatus } from "@prisma/client";
import { getActiveLeagues } from "@/lib/league-config";
import { DeleteArticleButton } from "./delete-article-button";

type PageProps = {
  searchParams: Promise<{ status?: string; league?: string }>;
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function ArticlesPage({ searchParams }: PageProps) {
  const { status, league } = await searchParams;
  const normalizedStatus = status?.toUpperCase() as ArticleStatus | undefined;
  const normalizedLeague = league?.trim() || undefined;

  const [articles, leagues] = await Promise.all([
    prisma.article.findMany({
      where: {
        ...(normalizedStatus && { status: normalizedStatus }),
        ...(normalizedLeague && { league: { equals: normalizedLeague, mode: "insensitive" } }),
      },
      orderBy: { createdAt: "desc" },
    }),
    getActiveLeagues(),
  ]);

  const statusFilters: { label: string; value?: ArticleStatus }[] = [
    { label: "All" },
    { label: "Draft", value: "DRAFT" },
    { label: "Published", value: "PUBLISHED" },
    { label: "Archived", value: "ARCHIVED" },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-border pb-6">
        <div>
          <h1 className="font-heading text-4xl tracking-wide text-foreground">Articles</h1>
          <p className="text-sm text-muted-foreground mt-1">Create, edit, and publish Varsity Club Lacrosse stories.</p>
        </div>
        <Link
          href="/admin/articles/new"
          className="inline-flex items-center gap-2 rounded-sm bg-vcl-gold px-5 h-10 text-sm font-bold text-vcl-gold-foreground hover:bg-vcl-gold/90 transition-colors shrink-0"
        >
          <Plus className="h-4 w-4" />
          New Article
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Status filter */}
        <div className="flex items-center gap-1.5">
          {statusFilters.map((filter) => {
            const isActive = (!normalizedStatus && !filter.value) || normalizedStatus === filter.value;
            return (
              <Link
                key={filter.label}
                href={
                  filter.value
                    ? `/admin/articles?${normalizedLeague ? `league=${normalizedLeague}&` : ""}status=${filter.value}`
                    : normalizedLeague ? `/admin/articles?league=${normalizedLeague}` : "/admin/articles"
                }
                className={`rounded-sm px-3 h-8 flex items-center text-xs font-semibold transition-colors ${
                  isActive
                    ? "bg-vcl-gold text-vcl-gold-foreground"
                    : "border border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                {filter.label}
              </Link>
            );
          })}
        </div>

        {/* League filter */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <Link
            href={normalizedStatus ? `/admin/articles?status=${normalizedStatus}` : "/admin/articles"}
            className={`rounded-sm px-3 h-8 flex items-center text-xs font-semibold transition-colors ${
              !normalizedLeague
                ? "bg-vcl-gold text-vcl-gold-foreground"
                : "border border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            All Leagues
          </Link>
          {leagues.map((lg) => (
            <Link
              key={lg.id}
              href={`/admin/articles?${normalizedStatus ? `status=${normalizedStatus}&` : ""}league=${lg.code}`}
              className={`rounded-sm px-3 h-8 flex items-center text-xs font-semibold transition-colors ${
                normalizedLeague === lg.code
                  ? "bg-vcl-gold text-vcl-gold-foreground"
                  : "border border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {lg.code}
            </Link>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-sm border border-border bg-card overflow-hidden">
        {/* Table head */}
        <div className="hidden md:grid md:grid-cols-[minmax(260px,1fr)_88px_110px_120px_200px] items-center gap-x-3 h-11 px-5 bg-secondary border-b border-border">
          <span className="text-[10px] font-bold tracking-[0.15em] text-muted-foreground uppercase">Title</span>
          <span className="text-[10px] font-bold tracking-[0.15em] text-muted-foreground uppercase">League</span>
          <span className="text-[10px] font-bold tracking-[0.15em] text-muted-foreground uppercase">Status</span>
          <span className="text-[10px] font-bold tracking-[0.15em] text-muted-foreground uppercase">Date</span>
          <span className="text-[10px] font-bold tracking-[0.15em] text-muted-foreground uppercase text-right">Actions</span>
        </div>

        {articles.length === 0 ? (
          <div className="py-16 text-center text-sm text-muted-foreground">
            No articles found. Try another filter or create your first piece.
          </div>
        ) : (
          <div className="divide-y divide-border">
            {articles.map((article) => (
              <div key={article.id} className="grid grid-cols-1 md:grid-cols-[minmax(260px,1fr)_88px_110px_120px_200px] items-center gap-x-3 min-h-[64px] px-5 py-4 hover:bg-accent transition-colors">
                {/* Title */}
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-medium text-foreground">{article.title}</span>
                  <span className="text-xs text-muted-foreground">/{article.slug}</span>
                </div>
                {/* League */}
                <div className="hidden md:block">
                  {article.league ? (
                    <span className="rounded-sm bg-vcl-gold px-2 py-0.5 text-[10px] font-bold tracking-widest text-vcl-gold-foreground uppercase">
                      {article.league}
                    </span>
                  ) : (
                    <span className="text-xs text-muted-foreground">—</span>
                  )}
                </div>
                {/* Status */}
                <div className="hidden md:flex flex-col items-start gap-1">
                  <span className={`rounded-sm px-2 py-0.5 text-[10px] font-bold tracking-widest uppercase ${
                    article.status === "PUBLISHED"
                      ? "bg-vcl-gold text-vcl-gold-foreground"
                      : "bg-accent text-muted-foreground border border-border"
                  }`}>
                    {article.status === "ARCHIVED" ? "Unlisted" : article.status}
                  </span>
                  {article.featured && (
                    <span className="rounded-sm border border-vcl-gold/40 px-1.5 py-0.5 text-[9px] font-bold tracking-widest text-vcl-gold uppercase">
                      Featured
                    </span>
                  )}
                </div>
                {/* Date */}
                <span className="hidden md:block text-xs text-muted-foreground">
                  {article.publishedAt
                    ? format(article.publishedAt, "MMM d, yyyy")
                    : format(article.updatedAt, "MMM d, yyyy")}
                </span>
                {/* Actions */}
                <div className="flex items-center justify-end gap-2">
                  <Link
                    href={`/admin/articles/${article.id}`}
                    className="inline-flex items-center gap-1.5 rounded-sm border border-border px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:border-vcl-gold/40 hover:text-vcl-gold transition-colors"
                  >
                    <Pencil className="h-3 w-3" />
                    Edit
                  </Link>
                  <DeleteArticleButton
                    id={article.id}
                    className="inline-flex items-center gap-1.5 rounded-sm border border-border px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:border-red-500/40 hover:text-red-400 transition-colors disabled:opacity-60"
                    label="Delete"
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
