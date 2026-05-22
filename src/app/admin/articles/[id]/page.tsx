import prisma from "@/lib/db";
import { notFound } from "next/navigation";
import { ArticleEditor } from "../article-editor";
import { updateArticle } from "../actions";
import { DeleteArticleButton } from "../delete-article-button";
import { getActiveLeagues } from "@/lib/league-config";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditArticlePage({ params }: PageProps) {
  const { id } = await params;
  const [article, uploadedImages, leagues] = await Promise.all([
    prisma.article.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        content: true,
        coverImage: true,
        status: true,
        featured: true,
        author: true,
        league: true,
        publishedAt: true,
      },
    }),
    prisma.uploadedImage.findMany({
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
    getActiveLeagues(),
  ]);

  if (!article) return notFound();

  return (
    <ArticleEditor
      mode="edit"
      article={article}
      initialImages={uploadedImages.map((img) => img.url)}
      leagues={leagues}
      formAction={updateArticle}
      deleteSlot={<DeleteArticleButton id={id} />}
    />
  );
}
