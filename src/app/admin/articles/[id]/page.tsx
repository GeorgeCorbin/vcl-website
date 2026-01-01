import prisma from "@/lib/db";
import { notFound } from "next/navigation";
import { ArticleEditor } from "../article-editor";
import { updateArticle, deleteArticle } from "../actions";
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

  const deleteSlot = (
    <form action={deleteArticle} className="flex-shrink-0">
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-100"
        onClick={(e) => {
          if (!confirm("Are you sure you want to delete this article?")) {
            e.preventDefault();
          }
        }}
      >
        Delete Article
      </button>
    </form>
  );

  return (
    <ArticleEditor
      mode="edit"
      article={article}
      initialImages={uploadedImages.map((img) => img.url)}
      leagues={leagues}
      formAction={updateArticle}
      deleteSlot={deleteSlot}
    />
  );
}
