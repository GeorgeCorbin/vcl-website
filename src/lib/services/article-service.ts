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
  const { status, featured, tagSlug, league, search } = options || {};

  return {
    ...(status && { status }),
    ...(featured !== undefined && { featured }),
    ...(tagSlug && { tags: { some: { slug: tagSlug } } }),
    ...(league && { league: { equals: league, mode: "insensitive" } }),
    ...(search && {
      OR: [
        { title: { contains: search, mode: "insensitive" } },
        { excerpt: { contains: search, mode: "insensitive" } },
      ],
    }),
  };
}

export class ArticleService {
  static async list(options?: ArticleListFilterOptions & {
    limit?: number;
    offset?: number;
  }) {
    const { limit = 20, offset = 0, ...filters } = options || {};

    return prisma.article.findMany({
      where: buildArticleListWhere(filters),
      include: {
        tags: true,
      },
      orderBy: { publishedAt: "desc" },
      take: limit,
      skip: offset,
    });
  }

  static async count(options?: ArticleListFilterOptions) {
    return prisma.article.count({
      where: buildArticleListWhere(options),
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
