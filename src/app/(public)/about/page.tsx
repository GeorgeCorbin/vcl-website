import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AboutPage() {
  return (
    <div className="container py-8 md:py-12">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
          About VCL
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Your source for comprehensive MCLA lacrosse coverage.
        </p>

        <div className="mt-8 space-y-8">
          <section>
            <h2 className="text-2xl font-semibold mb-4">Our Mission</h2>
            <p className="text-muted-foreground">
              VCL is dedicated to providing in-depth coverage of Men&apos;s Collegiate
              Lacrosse Association (MCLA) lacrosse. We aim to be the go-to
              destination for news, analysis, rankings, and transfer information
              for the club lacrosse community.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">What We Cover</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Articles & Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Game recaps, team previews, player spotlights, and in-depth
                    analysis of the MCLA landscape.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Weekly Media Poll</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Comprehensive weekly rankings of the top 25 teams in MCLA
                    Division I and Division II.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Transfer Tracker</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Stay updated on player movements between programs throughout
                    the offseason and beyond.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Team Coverage</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Profiles and coverage of teams across all MCLA conferences
                    and divisions.
                  </p>
                </CardContent>
              </Card>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Contact Us</h2>
            <p className="text-muted-foreground">
              Have a tip, story idea, or want to get involved? Reach out to us on
              social media or send us an email.
            </p>
            <div className="mt-4 space-y-2 text-sm">
              <p>
                <strong>Twitter:</strong>{" "}
                <a
                  href="https://twitter.com"
                  className="text-primary hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  @VCLacrosse
                </a>
              </p>
              <p>
                <strong>Instagram:</strong>{" "}
                <a
                  href="https://instagram.com"
                  className="text-primary hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  @VCLacrosse
                </a>
              </p>
              <p>
                <strong>Email:</strong>{" "}
                <a
                  href="mailto:contact@vcl.com"
                  className="text-primary hover:underline"
                >
                  contact@vcl.com
                </a>
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
