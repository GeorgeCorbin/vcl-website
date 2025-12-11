import prisma from "@/lib/db";
import { ArticleStatus, Prisma } from "@prisma/client";

export type ArticleWithAuthor = Prisma.ArticleGetPayload<{
  include: { author: true; tags: true };
}>;

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
        author: { select: { id: true, name: true, image: true } },
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
        author: { select: { id: true, name: true, image: true } },
        tags: true,
      },
    });
  }

  static async getById(id: string) {
    return prisma.article.findUnique({
      where: { id },
      include: {
        author: { select: { id: true, name: true, image: true } },
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
    authorId: string;
    status?: ArticleStatus;
    featured?: boolean;
    tagIds?: string[];
  }) {
    const { tagIds, ...articleData } = data;

    return prisma.article.create({
      data: {
        ...articleData,
        ...(tagIds && {
          tags: { connect: tagIds.map((id) => ({ id })) },
        }),
      },
      include: { author: true, tags: true },
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
      status?: ArticleStatus;
      featured?: boolean;
      tagIds?: string[];
      publishedAt?: Date | null;
    }
  ) {
    const { tagIds, ...articleData } = data;

    return prisma.article.update({
      where: { id },
      data: {
        ...articleData,
        ...(tagIds && {
          tags: { set: tagIds.map((id) => ({ id })) },
        }),
      },
      include: { author: true, tags: true },
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
