import Link from "next/link";
import { format } from "date-fns";
import { Plus, Pencil, Trash2 } from "lucide-react";
import prisma from "@/lib/db";
import { ArticleStatus } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { deleteArticle } from "./actions";
import { getActiveLeagues } from "@/lib/league-config";

type PageProps = {
  searchParams: Promise<{ status?: string; league?: string }>;
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function ArticlesPage({ searchParams }: PageProps) {
  const { status, league } = await searchParams;
  const normalizedStatus = status?.toUpperCase() as ArticleStatus | undefined;
  const normalizedLeague = league?.toUpperCase();

  const [articles, leagues] = await Promise.all([
    prisma.article.findMany({
      where: {
        ...(normalizedStatus && { status: normalizedStatus }),
        ...(normalizedLeague && { league: normalizedLeague as any }),
      },
      orderBy: { createdAt: "desc" },
    }),
    getActiveLeagues(),
  ]);

  const filters: { label: string; value?: ArticleStatus }[] = [
    { label: "All Status" },
    { label: "Draft", value: "DRAFT" },
    { label: "Published", value: "PUBLISHED" },
    { label: "Archived", value: "ARCHIVED" },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">Editorial</p>
          <h1 className="text-3xl font-bold tracking-tight">Articles</h1>
          <p className="text-muted-foreground">Create, edit, and publish Varsity Club Lacrosse stories.</p>
        </div>
        <Link href="/admin/articles/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Article
          </Button>
        </Link>
      </div>

      <div className="space-y-4">
        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Filter by League
          </p>
          <div className="flex flex-wrap gap-2 rounded-2xl border border-border/50 bg-card p-2">
            <Link
              href={normalizedStatus ? `/admin/articles?status=${normalizedStatus}` : "/admin/articles"}
              className={`rounded-xl px-4 py-2 text-sm font-medium transition-colors ${
                !normalizedLeague
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted"
              }`}
            >
              All
            </Link>
            {leagues.map((league) => (
              <Link
                key={league.id}
                href={`/admin/articles?${normalizedStatus ? `status=${normalizedStatus}&` : ""}league=${league.code}`}
                className={`rounded-xl px-4 py-2 text-sm font-medium transition-colors ${
                  normalizedLeague === league.code
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted"
                }`}
              >
                {league.code}
              </Link>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Filter by Status
          </p>
          <div className="flex flex-wrap gap-2 rounded-2xl border border-border/50 bg-card p-2">
            {filters.map((filter) => (
              <Link
                key={filter.label}
                href={
                  filter.value
                    ? `/admin/articles?${normalizedLeague ? `league=${normalizedLeague}&` : ""}status=${filter.value}`
                    : normalizedLeague ? `/admin/articles?league=${normalizedLeague}` : "/admin/articles"
                }
                className={`rounded-xl px-4 py-2 text-sm font-medium transition-colors ${
                  (normalizedStatus === filter.value) || (!normalizedStatus && !filter.value)
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted"
                }`}
              >
                {filter.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-border/50 bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Author</TableHead>
              <TableHead>Updated</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {articles.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="py-10 text-center text-muted-foreground">
                  No articles found. Try another filter or create your first piece.
                </TableCell>
              </TableRow>
            ) : (
              articles.map((article) => (
                <TableRow key={article.id}>
                  <TableCell>
                    <div className="font-medium">{article.title}</div>
                    <div className="text-xs text-muted-foreground">/{article.slug}</div>
                  </TableCell>
                  <TableCell className="space-x-2">
                    <Badge
                      variant={
                        article.status === "PUBLISHED" ? "default" : article.status === "DRAFT" ? "secondary" : "outline"
                      }
                    >
                      {article.status.toLowerCase()}
                    </Badge>
                    {article.featured && (
                      <Badge variant="outline" className="uppercase">
                        Featured
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>{article.author || "—"}</TableCell>
                  <TableCell>
                    {article.publishedAt
                      ? format(article.publishedAt, "MMM d, yyyy")
                      : format(article.updatedAt, "MMM d, yyyy")}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Link href={`/admin/articles/${article.id}`}>
                        <Button variant="ghost" size="icon">
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </Link>
                      <form action={deleteArticle}>
                        <input type="hidden" name="id" value={article.id} />
                        <Button
                          type="submit"
                          variant="ghost"
                          size="icon"
                          className="text-red-500 hover:text-red-600"
                          aria-label={`Delete ${article.title}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </form>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
