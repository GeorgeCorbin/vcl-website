import { notFound } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { SidebarAds, InlineAd } from "@/components/ads";

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
    <div className="container mx-auto px-4 py-12 md:px-6 md:py-16">
      <div className="flex gap-8">
        {/* Main Content */}
        <div className="flex-1 min-w-0 max-w-3xl">
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

              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight">
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

            {/* Inline Ad after article content */}
            <InlineAd className="mt-8" />
          </article>
        </div>

        {/* Sidebar Ads */}
        <SidebarAds className="hidden lg:block w-[300px] flex-shrink-0 sticky top-20" />
      </div>
    </div>
  );
}
