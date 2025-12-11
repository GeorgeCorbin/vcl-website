import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function ArticlesPage() {
  // TODO: Fetch articles from API
  const articles: Array<{
    id: string;
    title: string;
    slug: string;
    excerpt: string;
    author: { name: string };
    tags: Array<{ name: string; slug: string }>;
    publishedAt: string;
    featured: boolean;
  }> = [];

  return (
    <div className="container mx-auto px-4 py-12 md:px-6 md:py-16">
      <div className="mb-8 md:mb-10">
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight">Articles</h1>
        <p className="mt-2 text-sm md:text-base text-muted-foreground">
          News, analysis, and coverage of club lacrosse.
        </p>
      </div>

      {articles.length === 0 ? (
        <Card className="border-border/50">
          <CardContent className="py-16 text-center">
            <p className="text-muted-foreground">
              No articles published yet. Check back soon!
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {articles.map((article) => (
            <Link key={article.id} href={`/articles/${article.slug}`}>
              <Card className="h-full hover:bg-accent/50 transition-colors">
                <CardHeader>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {article.featured && (
                      <Badge variant="default">Featured</Badge>
                    )}
                    {article.tags.slice(0, 2).map((tag) => (
                      <Badge key={tag.slug} variant="secondary">
                        {tag.name}
                      </Badge>
                    ))}
                  </div>
                  <CardTitle className="line-clamp-2">{article.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {article.excerpt}
                  </p>
                  <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                    <span>{article.author.name}</span>
                    <span>
                      {new Date(article.publishedAt).toLocaleDateString()}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
