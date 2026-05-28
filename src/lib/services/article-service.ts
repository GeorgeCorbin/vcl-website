import prisma from "@/lib/db";
import { ArticleStatus, Prisma } from "@prisma/client";

export type ArticleWithRelations = Prisma.ArticleGetPayload<{
  include: { tags: true };
}>;

type ArticleListFilterOptions = {
  status?: ArticleStatus;
  featured?: boolean;
  tagSlug?: string;
  league?: string | null;
  search?: string;
};

function buildArticleListWhere(options?: ArticleListFilterOptions): Prisma.ArticleWhereInput {
  const { status, featured, tagSlug, league } = options || {};

  return {
    ...(status && { status }),
    ...(featured !== undefined && { featured }),
    ...(tagSlug && { tags: { some: { slug: tagSlug } } }),
    ...(league && { league: { equals: league, mode: "insensitive" } }),
  };
}

function toTsQuery(raw: string): string {
  return raw
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w.replace(/[^a-zA-Z0-9]/g, "") + ":*")
    .filter((w) => w.length > 2)
    .join(" & ");
}

type RawArticleRow = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  coverImage: string | null;
  coverFocalX: number | null;
  coverFocalY: number | null;
  photographerCredit: string | null;
  status: ArticleStatus;
  featured: boolean;
  author: string | null;
  league: string | null;
  publishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

async function ftsSearch(
  query: string,
  options: Omit<ArticleListFilterOptions, "search"> & { limit?: number; offset?: number }
): Promise<ArticleWithRelations[]> {
  const tsQuery = toTsQuery(query);
  if (!tsQuery) return [];

  const { status, league, tagSlug, limit = 20, offset = 0 } = options;

  const statusFilter = status ? Prisma.sql`AND a.status = ${status}::"ArticleStatus"` : Prisma.sql``;
  const leagueFilter = league ? Prisma.sql`AND lower(a.league) = lower(${league})` : Prisma.sql``;
  const tagFilter = tagSlug
    ? Prisma.sql`AND EXISTS (
        SELECT 1 FROM "_ArticleToTag" jt
        JOIN "Tag" tg ON tg.id = jt."B"
        WHERE jt."A" = a.id AND tg.slug = ${tagSlug}
      )`
    : Prisma.sql``;

  const rows = await prisma.$queryRaw<RawArticleRow[]>`
    SELECT
      a.id, a.title, a.slug, a.excerpt, a.content,
      a."coverImage", a."coverFocalX", a."coverFocalY", a."photographerCredit",
      a.status, a.featured, a.author, a.league,
      a."publishedAt", a."createdAt", a."updatedAt"
    FROM "Article" a
    WHERE a.search_vector @@ to_tsquery('english', ${tsQuery})
      ${statusFilter}
      ${leagueFilter}
      ${tagFilter}
    ORDER BY ts_rank_cd(a.search_vector, to_tsquery('english', ${tsQuery})) DESC,
             a."publishedAt" DESC NULLS LAST
    LIMIT ${limit} OFFSET ${offset}
  `;

  if (rows.length === 0) return [];

  const ids = rows.map((r) => r.id);
  const tagMap = await prisma.tag.findMany({
    where: { articles: { some: { id: { in: ids } } } },
    include: { articles: { where: { id: { in: ids } }, select: { id: true } } },
  });

  return rows.map((row) => ({
    ...row,
    tags: tagMap.filter((t) => t.articles.some((a) => a.id === row.id)).map(({ articles: _, ...t }) => t),
  }));
}

async function ftsCount(
  query: string,
  options: Omit<ArticleListFilterOptions, "search">
): Promise<number> {
  const tsQuery = toTsQuery(query);
  if (!tsQuery) return 0;

  const { status, league, tagSlug } = options;

  const statusFilter = status ? Prisma.sql`AND a.status = ${status}::"ArticleStatus"` : Prisma.sql``;
  const leagueFilter = league ? Prisma.sql`AND lower(a.league) = lower(${league})` : Prisma.sql``;
  const tagFilter = tagSlug
    ? Prisma.sql`AND EXISTS (
        SELECT 1 FROM "_ArticleToTag" jt
        JOIN "Tag" tg ON tg.id = jt."B"
        WHERE jt."A" = a.id AND tg.slug = ${tagSlug}
      )`
    : Prisma.sql``;

  const result = await prisma.$queryRaw<[{ count: bigint }]>`
    SELECT count(*) AS count
    FROM "Article" a
    WHERE a.search_vector @@ to_tsquery('english', ${tsQuery})
      ${statusFilter}
      ${leagueFilter}
      ${tagFilter}
  `;

  return Number(result[0]?.count ?? 0);
}

export class ArticleService {
  static async list(options?: ArticleListFilterOptions & {
    limit?: number;
    offset?: number;
  }) {
    const { limit = 20, offset = 0, search, ...filters } = options || {};

    if (search?.trim()) {
      return ftsSearch(search, { ...filters, limit, offset });
    }

    return prisma.article.findMany({
      where: buildArticleListWhere(filters),
      include: { tags: true },
      orderBy: { publishedAt: "desc" },
      take: limit,
      skip: offset,
    });
  }

  static async count(options?: ArticleListFilterOptions) {
    const { search, ...filters } = options || {};

    if (search?.trim()) {
      return ftsCount(search, filters);
    }

    return prisma.article.count({
      where: buildArticleListWhere(filters),
    });
  }

  static async getBySlug(slug: string) {
    return prisma.article.findUnique({
      where: { slug },
      include: {
        tags: true,
      },
    });
  }

  static async getById(id: string) {
    return prisma.article.findUnique({
      where: { id },
      include: {
        tags: true,
      },
    });
  }

  static async create(data: {
    title: string;
    slug: string;
    content: string;
    excerpt?: string;
    coverImage?: string;
    author?: string | null;
    status?: ArticleStatus;
    featured?: boolean;
    tagIds?: string[];
    league?: string | null;
    publishedAt?: Date | null;
  }) {
    const { tagIds, league, ...articleData } = data;

    return prisma.article.create({
      data: {
        ...articleData,
        ...(league !== undefined && { league }),
        ...(tagIds && {
          tags: { connect: tagIds.map((id) => ({ id })) },
        }),
      },
      include: { tags: true },
    });
  }

  static async update(
    id: string,
    data: {
      title?: string;
      slug?: string;
      content?: string;
      excerpt?: string;
      coverImage?: string;
      author?: string | null;
      status?: ArticleStatus;
      featured?: boolean;
      tagIds?: string[];
      league?: string | null;
      publishedAt?: Date | null;
    }
  ) {
    const { tagIds, league, ...articleData } = data;

    return prisma.article.update({
      where: { id },
      data: {
        ...articleData,
        ...(league !== undefined && { league }),
        ...(tagIds && {
          tags: { set: tagIds.map((id) => ({ id })) },
        }),
      },
      include: { tags: true },
    });
  }

  static async delete(id: string) {
    return prisma.article.delete({ where: { id } });
  }

  static async publish(id: string) {
    return prisma.article.update({
      where: { id },
      data: {
        status: "PUBLISHED",
        publishedAt: new Date(),
      },
    });
  }

  static async unpublish(id: string) {
    return prisma.article.update({
      where: { id },
      data: {
        status: "DRAFT",
        publishedAt: null,
      },
    });
  }
}
