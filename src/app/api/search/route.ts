import { NextRequest, NextResponse } from "next/server";
import { ArticleService } from "@/lib/services";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim() ?? "";

  if (q.length < 2) {
    return NextResponse.json({ results: [] });
  }

  const articles = await ArticleService.list({
    status: "PUBLISHED",
    search: q,
    limit: 5,
    offset: 0,
  }).catch(() => []);

  const results = articles.map((a) => ({
    title: a.title,
    slug: a.slug,
    league: a.league,
    publishedAt: a.publishedAt,
    excerpt: a.excerpt,
  }));

  return NextResponse.json({ results });
}
