import { notFound } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface ArticlePageProps {
  params: Promise<{ slug: string }>;
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params;

  // TODO: Fetch article from API
  const article = null as {
    id: string;
    title: string;
    content: string;
    excerpt: string;
    author: { name: string; image: string | null };
    tags: Array<{ name: string; slug: string }>;
    publishedAt: string;
    featured: boolean;
  } | null;

  if (!article) {
    notFound();
  }

  return (
    <div className="container py-8 md:py-12">
      <div className="max-w-3xl mx-auto">
        <Link href="/articles">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Articles
          </Button>
        </Link>

        <article>
          <header className="mb-8">
            <div className="flex flex-wrap gap-2 mb-4">
              {article.featured && <Badge variant="default">Featured</Badge>}
              {article.tags.map((tag) => (
                <Badge key={tag.slug} variant="secondary">
                  {tag.name}
                </Badge>
              ))}
            </div>

            <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
              {article.title}
            </h1>

            <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
              <span>By {article.author.name}</span>
              <span>•</span>
              <time dateTime={article.publishedAt}>
                {new Date(article.publishedAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </time>
            </div>
          </header>

          <div className="prose prose-neutral dark:prose-invert max-w-none">
            {/* TODO: Render markdown content */}
            <p>{article.content}</p>
          </div>
        </article>
      </div>
    </div>
  );
}
