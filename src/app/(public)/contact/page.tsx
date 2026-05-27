import type { Metadata } from "next";
import Link from "next/link";
import { ContactForm } from "./contact-form";

export const metadata: Metadata = {
  title: "Contact Us | Varsity Club Lacrosse",
  description:
    "Get in touch with Varsity Club Lacrosse for story tips, partnerships, contributor opportunities, and general inquiries.",
};

const CONTACT_EMAIL = "contact@varsityclublacrosse.com";

const socialLinks = [
  {
    label: "Instagram",
    href: "https://www.instagram.com/varsityclublacrosse/",
    handle: "@varsityclublacrosse",
  },
  {
    label: "X / Twitter",
    href: "https://x.com/VarsityLacrosse",
    handle: "@VarsityLacrosse",
  },
  {
    label: "YouTube",
    href: "https://www.youtube.com/channel/UCCaeRbVrXas2w-Fiu4ZnwTA",
    handle: "Varsity Club Lacrosse",
  },
];

export default function ContactPage() {
  return (
    <div className="flex flex-col">
      <div className="border-b border-border bg-secondary">
        <div className="mx-auto max-w-[1440px] px-6 py-10 md:px-12 md:py-14">
          <nav className="flex items-center gap-2 text-xs text-muted-foreground mb-5">
            <Link href="/" className="hover:text-foreground transition-colors">
              Home
            </Link>
            <span>/</span>
            <span className="text-foreground">Contact</span>
          </nav>
          <h1 className="font-heading text-6xl lg:text-7xl tracking-tight text-foreground">
            CONTACT US
          </h1>
          <p className="mt-3 max-w-2xl text-sm text-muted-foreground leading-relaxed">
            Have a story tip, partnership idea, or question about club lacrosse coverage?
            We&apos;d love to hear from you.
          </p>
        </div>
      </div>

      <div className="mx-auto w-full max-w-[1440px] px-6 py-12 md:px-12 md:py-16">
        <div className="grid gap-12 lg:grid-cols-[1fr_320px] lg:gap-16">
          <section>
            <h2 className="font-heading text-2xl tracking-wide text-foreground mb-2">
              SEND A MESSAGE
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed mb-6">
              Fill out the form below and we&apos;ll get back to you as soon as we can.
            </p>
            <ContactForm />
          </section>

          <aside className="flex flex-col gap-8">
            <div>
              <h2 className="font-heading text-2xl tracking-wide text-foreground mb-4">
                EMAIL
              </h2>
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="text-sm text-vcl-gold hover:underline break-all"
              >
                {CONTACT_EMAIL}
              </a>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                For privacy requests or data questions, include &quot;Privacy&quot; in your
                subject line.
              </p>
            </div>

            <div>
              <h2 className="font-heading text-2xl tracking-wide text-foreground mb-4">
                SOCIAL
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                Fastest way to reach us for tips and breaking news.
              </p>
              <div className="flex flex-col gap-3">
                {socialLinks.map((link) => (
                  <div
                    key={link.label}
                    className="rounded-sm border border-border bg-card p-4 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <span className="text-sm font-semibold text-foreground">
                      {link.label}
                    </span>
                    <a
                      href={link.href}
                      className="text-sm text-vcl-gold hover:underline"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {link.handle}
                    </a>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-sm border border-border bg-secondary/50 p-5">
              <h3 className="text-sm font-semibold text-foreground mb-2">
                What to include
              </h3>
              <ul className="text-sm text-muted-foreground leading-relaxed space-y-2 list-disc pl-4">
                <li>Story tips: teams, players, leagues, and relevant links</li>
                <li>Partnerships: audience reach and campaign goals</li>
                <li>Contributors: writing samples or areas of expertise</li>
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
