import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-12 md:px-6 md:py-16">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Image
            src="/vcl_logo3.png"
            alt="Varsity Club Lacrosse"
            width={64}
            height={64}
            className="h-16 w-auto"
          />
          <div>
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight">
              About Varsity Club Lacrosse
            </h1>
            <p className="text-sm text-vcl-gold font-medium">Strictly Club. Strictly Business.</p>
          </div>
        </div>
        <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
          Your source for comprehensive club lacrosse coverage.
        </p>

        <div className="mt-10 space-y-10">
          <section>
            <h2 className="text-xl md:text-2xl font-semibold mb-4">Our Mission</h2>
            <p className="text-muted-foreground leading-relaxed">
              Varsity Club Lacrosse is dedicated to providing in-depth coverage of club lacrosse. 
              While our primary focus is on the Men&apos;s Collegiate Lacrosse Association (MCLA), 
              we also cover SMLL, NCLL, WCLL, and other club leagues. We aim to be the go-to
              destination for news, analysis, rankings, and transfer information
              for the club lacrosse community.
            </p>
          </section>

          <section>
            <h2 className="text-xl md:text-2xl font-semibold mb-4">What We Cover</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <Card className="border-border/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base md:text-lg">Articles & Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Game recaps, team previews, player spotlights, and in-depth
                    analysis of the club lacrosse landscape.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-border/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base md:text-lg">Weekly Media Poll</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Comprehensive weekly rankings of the top 25 teams in MCLA
                    Division I and Division II.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-border/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base md:text-lg">Transfer Tracker</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Stay updated on player movements between programs throughout
                    the offseason and beyond.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-border/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base md:text-lg">League Coverage</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Coverage of MCLA, SMLL, NCLL, WCLL and other club leagues
                    across all conferences and divisions.
                  </p>
                </CardContent>
              </Card>
            </div>
          </section>

          <section>
            <h2 className="text-xl md:text-2xl font-semibold mb-4">Contact Us</h2>
            <p className="text-muted-foreground leading-relaxed">
              Have a tip, story idea, or want to get involved? Reach out to us on
              social media.
            </p>
            <div className="mt-4 space-y-3 text-sm">
              <p>
                <strong>Instagram:</strong>{" "}
                <a
                  href="https://www.instagram.com/varsityclublacrosse/"
                  className="text-vcl-gold hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  @varsityclublacrosse
                </a>
              </p>
              <p>
                <strong>X / Twitter:</strong>{" "}
                <a
                  href="https://x.com/VarsityLacrosse"
                  className="text-vcl-gold hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  @VarsityLacrosse
                </a>
              </p>
              <p>
                <strong>YouTube:</strong>{" "}
                <a
                  href="https://www.youtube.com/channel/UCCaeRbVrXas2w-Fiu4ZnwTA"
                  className="text-vcl-gold hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Varsity Club Lacrosse
                </a>
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
