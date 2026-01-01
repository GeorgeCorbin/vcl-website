import prisma from "@/lib/db";
import { ArticleStatus, League, Prisma } from "@prisma/client";

export type ArticleWithRelations = Prisma.ArticleGetPayload<{
  include: { tags: true };
}>;

const normalizeLeague = (value?: string | League | null): League | null | undefined => {
  if (value === undefined) return undefined;
  if (value === null || value === "") return null;
  const upperValue = value.toString().toUpperCase();
  if (upperValue in League) {
    return upperValue as League;
  }
  return undefined;
};

export class ArticleService {
  static async list(options?: {
    status?: ArticleStatus;
    featured?: boolean;
    tagSlug?: string;
    limit?: number;
    offset?: number;
  }) {
    const { status, featured, tagSlug, limit = 20, offset = 0 } = options || {};

    return prisma.article.findMany({
      where: {
        ...(status && { status }),
        ...(featured !== undefined && { featured }),
        ...(tagSlug && { tags: { some: { slug: tagSlug } } }),
      },
      include: {
        tags: true,
      },
      orderBy: { publishedAt: "desc" },
      take: limit,
      skip: offset,
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
    league?: string | League | null;
    publishedAt?: Date | null;
  }) {
    const { tagIds, league, ...articleData } = data;
    const normalizedLeague = normalizeLeague(league);

    return prisma.article.create({
      data: {
        ...articleData,
        ...(normalizedLeague !== undefined && { league: normalizedLeague }),
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
      league?: string | League | null;
      publishedAt?: Date | null;
    }
  ) {
    const { tagIds, league, ...articleData } = data;
    const normalizedLeague = normalizeLeague(league);

    return prisma.article.update({
      where: { id },
      data: {
        ...articleData,
        ...(normalizedLeague !== undefined && { league: normalizedLeague }),
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
