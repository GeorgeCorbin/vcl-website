import { NextRequest, NextResponse } from "next/server";
import { ArticleService } from "@/lib/services";
import type { ArticleStatus } from "@prisma/client";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get("status") as ArticleStatus | null;
    const featured = searchParams.get("featured");
    const tagSlug = searchParams.get("tag");
    const limit = searchParams.get("limit");
    const offset = searchParams.get("offset");

    const articles = await ArticleService.list({
      status: status || undefined,
      featured: featured ? featured === "true" : undefined,
      tagSlug: tagSlug || undefined,
      limit: limit ? parseInt(limit) : undefined,
      offset: offset ? parseInt(offset) : undefined,
    });

    return NextResponse.json(articles);
  } catch (error) {
    console.error("Error fetching articles:", error);
    return NextResponse.json(
      { error: "Failed to fetch articles" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, slug, content, excerpt, coverImage, author, status, featured, tagIds, league, publishedAt } = body;

    if (!title || !slug || !content || !author) {
      return NextResponse.json(
        { error: "Missing required fields: title, slug, content, author" },
        { status: 400 }
      );
    }

    const article = await ArticleService.create({
      title,
      slug,
      content,
      excerpt,
      coverImage,
      author: author.trim(),
      status,
      featured,
      tagIds,
      league: league ?? null,
      publishedAt: publishedAt ? new Date(publishedAt) : null,
    });

    return NextResponse.json(article, { status: 201 });
  } catch (error) {
    console.error("Error creating article:", error);
    return NextResponse.json(
      { error: "Failed to create article" },
      { status: 500 }
    );
  }
}
