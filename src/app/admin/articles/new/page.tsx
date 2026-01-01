import prisma from "@/lib/db";
import { ArticleEditor } from "../article-editor";
import { createArticle } from "../actions";
import { getActiveLeagues } from "@/lib/league-config";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function NewArticlePage() {
  const [uploadedImages, leagues] = await Promise.all([
    prisma.uploadedImage.findMany({
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
    getActiveLeagues(),
  ]);

  return (
    <ArticleEditor
      mode="create"
      initialImages={uploadedImages.map((img) => img.url)}
      leagues={leagues}
      formAction={createArticle}
    />
  );
}
