"use client";

import Link from "next/link";

const sections = [
  {
    title: "1. Acceptance of Terms",
    body: "By accessing Varsity Club Lacrosse (VCL) you agree to these Terms of Service and any future updates we publish. If you participate in contributor programs, polls, or community features, these expectations apply equally.",
  },
  {
    title: "2. Editorial Content",
    items: [
      "VCL covers club lacrosse news, rankings, transfers, and opinion pieces. Content is provided for informational purposes only.",
      "We may update or remove articles without notice to maintain accuracy or comply with legal requests.",
      "Contributors retain rights to their original work but grant VCL a worldwide, royalty-free license to publish, promote, and archive the content.",
    ],
  },
  {
    title: "3. User Conduct",
    items: [
      "Do not submit defamatory, infringing, or abusive material.",
      "Respect athlete privacy when sharing transfer rumors or media tips.",
      "Do not attempt to scrape or commercially exploit the site without written permission.",
    ],
  },
  {
    title: "4. Accounts & Access",
    items: [
      "Admin and contributor credentials are confidential. Any suspected compromise must be reported immediately.",
      "We reserve the right to suspend accounts that violate these Terms, harm the community, or interfere with site operations.",
    ],
  },
  {
    title: "5. Disclaimers & Liability",
    items: [
      "Coverage is provided “as is.” We do not guarantee accuracy of scores, schedules, or transfer details, though we work diligently to verify information.",
      "VCL is not liable for indirect, incidental, or consequential damages arising from site use.",
      "Links to partners or advertisers are provided for convenience and do not imply endorsement.",
    ],
  },
  {
    title: "6. Advertising & Sponsorship",
    body: "Sponsored stories or banners are labeled clearly. Partners may provide creative assets, but VCL maintains editorial control and will reject promotions that conflict with our standards.",
  },
  {
    title: "7. Changes",
    body: "We may revise these Terms to reflect new features, partnerships, or regulations. Updated versions become effective upon posting, and continued site use signifies acceptance.",
  },
];

export default function TermsPage() {
  return (
    <main className="bg-background">
      <div className="container mx-auto max-w-4xl px-4 py-16 md:px-6 md:py-24">
        <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">Policies</p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight md:text-5xl">Terms of Service</h1>
        <p className="mt-4 text-base text-muted-foreground md:text-lg">
          Effective date: {new Date().getFullYear()}. These terms govern your use of Varsity Club Lacrosse, including the
          website, newsletters, contributor programs, and promotional campaigns.
        </p>

        <div className="mt-10 space-y-10">
          {sections.map((section) => (
            <section key={section.title} className="rounded-3xl border border-border/50 bg-card px-6 py-6 shadow-sm md:px-8 md:py-8">
              <h2 className="text-2xl font-semibold tracking-tight">{section.title}</h2>
              <div className="mt-4 space-y-4 text-muted-foreground">
                {section.body && <p className="leading-relaxed">{section.body}</p>}
                {section.items?.map((item) => (
                  <p key={item} className="leading-relaxed">
                    {item}
                  </p>
                ))}
              </div>
            </section>
          ))}

          <section className="rounded-3xl border border-vcl-gold/40 bg-vcl-gold/10 px-6 py-6 md:px-8 md:py-8">
            <h2 className="text-2xl font-semibold tracking-tight">Questions?</h2>
            <p className="mt-3 text-muted-foreground">
              For partnership agreements, media licensing, or clarification of these terms, email{" "}
              <a href="mailto:contact@varsityclublacrosse.com" className="text-vcl-gold hover:underline">
                contact@varsityclublacrosse.com
              </a>{" "}
              or drop us a note via{" "}
              <Link href="/about" className="text-vcl-gold hover:underline">
                the about page.
              </Link>
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
