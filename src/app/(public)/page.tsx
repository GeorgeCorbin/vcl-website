import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, FileText, BarChart3, ArrowLeftRight, Instagram, Twitter, Youtube } from "lucide-react";

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative py-16 md:py-24 lg:py-32 bg-gradient-to-b from-background to-muted/20">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-3xl mx-auto text-center">
            <Image
              src="/vcl_logo3.png"
              alt="Varsity Club Lacrosse"
              width={120}
              height={120}
              className="mx-auto mb-6 h-24 w-auto md:h-32"
            />
            <Badge className="mb-4 bg-vcl-gold text-vcl-gold-foreground hover:bg-vcl-gold/90">
              Strictly Club. Strictly Business.
            </Badge>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl lg:text-6xl">
              Your Source for{" "}
              <span className="text-vcl-gold">Club Lacrosse</span>
            </h1>
            <p className="mt-6 text-base md:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Comprehensive coverage of MCLA, SMLL, NCLL, WCLL and more. News, analysis, 
              weekly media polls, and transfer tracking.
            </p>
            <div className="mt-8 md:mt-10 flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/articles">
                <Button size="lg" className="w-full sm:w-auto">
                  Read Articles
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/polls">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  View Media Poll
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 md:py-16 lg:py-20">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid gap-6 md:grid-cols-3">
            <Card className="border-border/50 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="pb-4">
                <FileText className="h-8 w-8 md:h-10 md:w-10 text-vcl-gold mb-3" />
                <CardTitle className="text-lg md:text-xl">Articles & Analysis</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                  In-depth articles covering game recaps, team previews, player
                  spotlights, and league analysis.
                </p>
                <Link
                  href="/articles"
                  className="inline-flex items-center mt-4 text-sm font-medium text-vcl-gold hover:underline"
                >
                  Read Articles
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </CardContent>
            </Card>

            <Card className="border-border/50 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="pb-4">
                <BarChart3 className="h-8 w-8 md:h-10 md:w-10 text-vcl-gold mb-3" />
                <CardTitle className="text-lg md:text-xl">Weekly Media Poll</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                  Track the top 25 teams each week with our comprehensive media
                  poll rankings and analysis.
                </p>
                <Link
                  href="/polls"
                  className="inline-flex items-center mt-4 text-sm font-medium text-vcl-gold hover:underline"
                >
                  View Rankings
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </CardContent>
            </Card>

            <Card className="border-border/50 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="pb-4">
                <ArrowLeftRight className="h-8 w-8 md:h-10 md:w-10 text-vcl-gold mb-3" />
                <CardTitle className="text-lg md:text-xl">Transfer Tracker</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                  Stay updated on player movements between programs with our
                  comprehensive transfer database.
                </p>
                <Link
                  href="/transfers"
                  className="inline-flex items-center mt-4 text-sm font-medium text-vcl-gold hover:underline"
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
      <section className="py-12 md:py-16 lg:py-20 bg-muted/30">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex items-center justify-between mb-6 md:mb-8">
            <h2 className="text-xl md:text-2xl font-bold tracking-tight">Latest Articles</h2>
            <Link href="/articles">
              <Button variant="ghost" size="sm" className="gap-2">
                View All
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          <div className="grid gap-4 md:gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card className="border-border/50">
              <CardContent className="py-8 text-center">
                <p className="text-sm text-muted-foreground">
                  No articles yet. Check back soon!
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Sponsors Section */}
      <section className="py-12 md:py-16 lg:py-20">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-8">
            <h2 className="text-xl md:text-2xl font-bold tracking-tight">Our Sponsors</h2>
            <p className="mt-2 text-sm md:text-base text-muted-foreground">
              Thank you to our partners who support club lacrosse coverage
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 items-center justify-items-center">
            {/* Placeholder sponsor slots */}
            <div className="w-full h-20 md:h-24 rounded-lg border-2 border-dashed border-border/50 flex items-center justify-center text-muted-foreground text-xs md:text-sm">
              Sponsor Logo
            </div>
            <div className="w-full h-20 md:h-24 rounded-lg border-2 border-dashed border-border/50 flex items-center justify-center text-muted-foreground text-xs md:text-sm">
              Sponsor Logo
            </div>
            <div className="w-full h-20 md:h-24 rounded-lg border-2 border-dashed border-border/50 flex items-center justify-center text-muted-foreground text-xs md:text-sm">
              Sponsor Logo
            </div>
            <div className="w-full h-20 md:h-24 rounded-lg border-2 border-dashed border-border/50 flex items-center justify-center text-muted-foreground text-xs md:text-sm">
              Sponsor Logo
            </div>
          </div>
          <p className="mt-6 text-center text-xs md:text-sm text-muted-foreground">
            Interested in sponsoring VCL?{" "}
            <a
              href="mailto:contact@varsityclublacrosse.com"
              className="text-vcl-gold hover:underline"
            >
              Contact us
            </a>
          </p>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 md:py-16 lg:py-20 bg-muted/30">
        <div className="container mx-auto px-4 md:px-6">
          <div className="rounded-xl bg-vcl-gold p-6 md:p-10 lg:p-12 text-center text-vcl-gold-foreground">
            <h2 className="text-xl md:text-2xl lg:text-3xl font-bold tracking-tight">
              Stay Updated
            </h2>
            <p className="mt-3 md:mt-4 text-sm md:text-base text-vcl-gold-foreground/80 max-w-2xl mx-auto leading-relaxed">
              Follow us on social media for the latest club lacrosse news, rankings updates,
              and transfer announcements.
            </p>
            <div className="mt-6 md:mt-8 flex flex-wrap gap-3 justify-center">
              <a
                href="https://www.instagram.com/varsityclublacrosse/"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button size="lg" className="gap-2 bg-vcl-gold-foreground text-vcl-gold hover:bg-vcl-gold-foreground/90">
                  <Instagram className="h-5 w-5" />
                  Instagram
                </Button>
              </a>
              <a
                href="https://x.com/VarsityLacrosse"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button size="lg" className="gap-2 bg-vcl-gold-foreground text-vcl-gold hover:bg-vcl-gold-foreground/90">
                  <Twitter className="h-5 w-5" />
                  X / Twitter
                </Button>
              </a>
              <a
                href="https://www.youtube.com/channel/UCCaeRbVrXas2w-Fiu4ZnwTA"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button size="lg" className="gap-2 bg-vcl-gold-foreground text-vcl-gold hover:bg-vcl-gold-foreground/90">
                  <Youtube className="h-5 w-5" />
                  YouTube
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
