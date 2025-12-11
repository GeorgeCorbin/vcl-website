import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, FileText, BarChart3, ArrowLeftRight } from "lucide-react";

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative py-20 md:py-32 bg-gradient-to-b from-background to-muted/20">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <Badge variant="secondary" className="mb-4">
              MCLA Coverage
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              Your Source for{" "}
              <span className="text-primary">Club Lacrosse</span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
              In-depth coverage of MCLA lacrosse including news, analysis, weekly
              media polls, and transfer tracking.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/articles">
                <Button size="lg">
                  Read Articles
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/polls">
                <Button variant="outline" size="lg">
                  View Media Poll
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="grid gap-8 md:grid-cols-3">
            <Card>
              <CardHeader>
                <FileText className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Articles & Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  In-depth articles covering game recaps, team previews, player
                  spotlights, and league analysis.
                </p>
                <Link
                  href="/articles"
                  className="inline-flex items-center mt-4 text-sm font-medium text-primary hover:underline"
                >
                  Read Articles
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <BarChart3 className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Weekly Media Poll</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Track the top 25 teams each week with our comprehensive media
                  poll rankings and analysis.
                </p>
                <Link
                  href="/polls"
                  className="inline-flex items-center mt-4 text-sm font-medium text-primary hover:underline"
                >
                  View Rankings
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <ArrowLeftRight className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Transfer Tracker</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Stay updated on player movements between programs with our
                  comprehensive transfer database.
                </p>
                <Link
                  href="/transfers"
                  className="inline-flex items-center mt-4 text-sm font-medium text-primary hover:underline"
                >
                  View Transfers
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Latest Content Section */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold tracking-tight">Latest Articles</h2>
            <Link href="/articles">
              <Button variant="ghost">
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Placeholder for articles - will be populated from API */}
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground">
                  No articles yet. Check back soon!
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="rounded-lg bg-primary p-8 md:p-12 text-center text-primary-foreground">
            <h2 className="text-2xl font-bold tracking-tight md:text-3xl">
              Stay Updated
            </h2>
            <p className="mt-4 text-primary-foreground/80 max-w-2xl mx-auto">
              Follow us on social media for the latest MCLA news, rankings updates,
              and transfer announcements.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="secondary" size="lg">
                Follow on Twitter
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground/10"
              >
                Follow on Instagram
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
