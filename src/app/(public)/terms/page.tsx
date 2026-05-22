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
    <div className="flex flex-col">
      {/* Page header */}
      <div className="border-b border-border bg-secondary">
        <div className="mx-auto max-w-[1440px] px-6 py-10 md:px-12 md:py-14">
          <nav className="flex items-center gap-2 text-xs text-muted-foreground mb-5">
            <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
            <span>/</span>
            <span className="text-foreground">Terms of Service</span>
          </nav>
          <p className="text-[10px] font-bold tracking-[0.2em] text-muted-foreground uppercase mb-2">Policies</p>
          <h1 className="font-heading text-6xl lg:text-7xl tracking-tight text-foreground">TERMS OF SERVICE</h1>
          <p className="mt-3 text-sm text-muted-foreground max-w-2xl leading-relaxed">
            Effective {new Date().getFullYear()}. These terms govern your use of Varsity Club Lacrosse, including the website, newsletters, contributor programs, and promotional campaigns.
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto w-full max-w-[1440px] px-6 py-12 md:px-12 md:py-16">
        <div className="max-w-3xl flex flex-col gap-5">
          {sections.map((section) => (
            <section key={section.title} className="rounded-sm border border-border bg-card px-6 py-6 md:px-8 md:py-8">
              <h2 className="text-base font-semibold tracking-tight text-foreground">{section.title}</h2>
              <div className="mt-4 space-y-3 text-sm text-muted-foreground">
                {section.body && <p className="leading-relaxed">{section.body}</p>}
                {section.items?.map((item) => (
                  <p key={item} className="leading-relaxed">{item}</p>
                ))}
              </div>
            </section>
          ))}

          <section className="rounded-sm border border-vcl-gold/40 bg-vcl-gold/5 px-6 py-6 md:px-8 md:py-8">
            <h2 className="text-base font-semibold tracking-tight text-foreground">Questions?</h2>
            <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
              For partnership agreements, media licensing, or clarification of these terms, email{" "}
              <a href="mailto:contact@varsityclublacrosse.com" className="text-vcl-gold hover:underline">contact@varsityclublacrosse.com</a>{" "}
              or drop us a note via{" "}
              <Link href="/about" className="text-vcl-gold hover:underline">the about page</Link>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
