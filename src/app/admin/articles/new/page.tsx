import { ArticleEditor } from "../article-editor";
import { createArticle } from "../actions";
import { getActiveLeagues } from "@/lib/league-config";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function NewArticlePage() {
  const leagues = await getActiveLeagues();

  return (
    <ArticleEditor
      mode="create"
      leagues={leagues}
      formAction={createArticle}
    />
  );
}
