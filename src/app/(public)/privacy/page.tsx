"use client";

import Link from "next/link";

const sections = [
  {
    title: "1. Information We Collect",
    items: [
      {
        heading: "Voluntary submissions",
        body: "Contact messages, newsletter sign-ups, or media tips that you share with Varsity Club Lacrosse.",
      },
      {
        heading: "Engagement data",
        body: "Analytics such as page views, referral sources, and device/browser details used to improve coverage and ad offerings.",
      },
      {
        heading: "Content contributions",
        body: "Articles, poll ballots, or transfer notes submitted by contributors are stored with attribution to the submitting user.",
      },
    ],
  },
  {
    title: "2. How We Use Your Information",
    items: [
      "Publish and promote club lacrosse stories, rankings, and transfers.",
      "Respond to inquiries, partnership requests, or contributor onboarding.",
      "Improve site performance, personalize advertising placements, and detect abuse.",
      "Comply with legal obligations and protect Varsity Club Lacrosse and its audience.",
    ],
  },
  {
    title: "3. How We Share Data",
    items: [
      "Service providers that host infrastructure, email newsletters, analytics, or advertising placements.",
      "Legal authorities when required by law or to defend the rights of Varsity Club Lacrosse, its staff, or partners.",
      "With your consent when collaborating on stories, podcasts, or sponsored content pieces.",
    ],
  },
  {
    title: "4. Your Choices",
    items: [
      "Unsubscribe from emails via the footer link or by emailing contact@varsityclublacrosse.com.",
      "Request deletion or updates to personal information at any time.",
      "Adjust cookie and tracking preferences inside your browser.",
    ],
  },
];

export default function PrivacyPage() {
  return (
    <main className="bg-background">
      <div className="container mx-auto max-w-4xl px-4 py-16 md:px-6 md:py-24">
        <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">Policies</p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight md:text-5xl">Privacy Policy</h1>
        <p className="mt-4 text-base text-muted-foreground md:text-lg">
          Effective date: {new Date().getFullYear()} &mdash; Varsity Club Lacrosse (&ldquo;VCL&rdquo;). We collect the minimum
          information needed to run a high-quality club lacrosse publication and protect our community.
        </p>

        <div className="mt-10 space-y-10">
          {sections.map((section) => (
            <section key={section.title} className="rounded-3xl border border-border/50 bg-card px-6 py-6 shadow-sm md:px-8 md:py-8">
              <h2 className="text-2xl font-semibold tracking-tight">{section.title}</h2>
              <div className="mt-4 space-y-4 text-muted-foreground">
                {"items" in section
                  ? section.items.map((item, idx) =>
                      typeof item === "string" ? (
                        <p key={idx} className="leading-relaxed">
                          {item}
                        </p>
                      ) : (
                        <div key={item.heading}>
                          <p className="font-medium text-foreground">{item.heading}</p>
                          <p className="text-sm md:text-base">{item.body}</p>
                        </div>
                      )
                    )
                  : null}
              </div>
            </section>
          ))}

          <section className="rounded-3xl border border-vcl-gold/40 bg-vcl-gold/10 px-6 py-6 md:px-8 md:py-8">
            <h2 className="text-2xl font-semibold tracking-tight">5. Contact</h2>
            <p className="mt-3 text-muted-foreground">
              Questions about privacy? Email{" "}
              <a href="mailto:contact@varsityclublacrosse.com" className="text-vcl-gold hover:underline">
                contact@varsityclublacrosse.com
              </a>{" "}
              or reach out via{" "}
              <Link href="/about" className="text-vcl-gold hover:underline">
                our about page
              </Link>
              . We earn the trust of the club lacrosse community by being transparent about data practices.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
