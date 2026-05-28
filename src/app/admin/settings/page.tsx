import prisma from "@/lib/db";
import { FEATURES } from "@/lib/feature-flags";
import {
  Database,
  Flag,
  Globe,
  Image,
  FileText,
  Tag,
  Shield,
  Trophy,
  CheckCircle2,
  XCircle,
  Server,
} from "lucide-react";

export const dynamic = "force-dynamic";
export const revalidate = 0;

async function getStats() {
  const [
    articleCount,
    publishedCount,
    draftCount,
    tagCount,
    imageCount,
    leagueCount,
    teamCount,
  ] = await Promise.all([
    prisma.article.count(),
    prisma.article.count({ where: { status: "PUBLISHED" } }),
    prisma.article.count({ where: { status: "DRAFT" } }),
    prisma.tag.count(),
    prisma.uploadedImage.count(),
    prisma.leagueConfig.count({ where: { active: true } }),
    prisma.team.count({ where: { active: true } }),
  ]);
  return { articleCount, publishedCount, draftCount, tagCount, imageCount, leagueCount, teamCount };
}

async function getLeagues() {
  return prisma.leagueConfig.findMany({
    orderBy: { name: "asc" },
    select: { id: true, code: true, name: true, active: true },
  });
}

function SectionHeader({ icon: Icon, title, description }: { icon: React.ElementType; title: string; description: string }) {
  return (
    <div className="px-5 py-4 border-b border-border bg-secondary flex items-center gap-3">
      <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
      <div>
        <p className="text-[11px] font-bold tracking-[0.15em] text-foreground uppercase">{title}</p>
        <p className="text-[11px] text-muted-foreground mt-0.5">{description}</p>
      </div>
    </div>
  );
}

function Row({ label, value, mono = false }: { label: string; value: React.ReactNode; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-6 px-5 py-3 border-b border-border last:border-0">
      <span className="text-xs text-muted-foreground shrink-0">{label}</span>
      <span className={`text-xs text-foreground text-right ${mono ? "font-mono" : ""}`}>{value}</span>
    </div>
  );
}

function Badge({ children, variant = "default" }: { children: React.ReactNode; variant?: "default" | "success" | "muted" | "warning" }) {
  const styles = {
    default: "bg-vcl-gold/10 border-vcl-gold/30 text-vcl-gold",
    success: "bg-emerald-500/10 border-emerald-500/30 text-emerald-400",
    muted: "bg-secondary border-border text-muted-foreground",
    warning: "bg-amber-500/10 border-amber-500/30 text-amber-400",
  };
  return (
    <span className={`inline-flex items-center rounded-sm border px-2 py-0.5 text-[10px] font-bold tracking-widest uppercase ${styles[variant]}`}>
      {children}
    </span>
  );
}

export default async function SettingsPage() {
  const [stats, leagues] = await Promise.all([getStats(), getLeagues()]);

  const env = process.env.NODE_ENV ?? "unknown";
  const nodeVersion = process.version;
  const nextVersion = "16.x";

  const featureList: { key: keyof typeof FEATURES; label: string; description: string }[] = [
    { key: "MEDIA_POLLS", label: "Media Polls", description: "Public rankings & admin poll management" },
    { key: "TRANSFERS", label: "Transfer Tracker", description: "Player transfer portal pages & admin" },
    { key: "ADS_ADMIN", label: "Ad Management", description: "Admin UI to create and edit ad units" },
    { key: "ADS_PUBLIC", label: "Public Ads", description: "Render ad slots on public-facing pages" },
    { key: "CONTENT_ADMIN", label: "Content Pages", description: "Static page editor (about, privacy, terms)" },
  ];

  return (
    <div className="space-y-8 max-w-[900px]">

      {/* Header */}
      <div className="border-b border-border pb-6">
        <h1 className="font-heading text-4xl tracking-wide text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">Site configuration, feature flags, and system status.</p>
      </div>

      <div className="grid grid-cols-1 gap-5">

        {/* ── Site Information ── */}
        <div className="rounded-sm border border-border bg-card overflow-hidden">
          <SectionHeader icon={Globe} title="Site Information" description="Core identity and build information" />
          <Row label="Site Name" value="Varsity Club Lacrosse" />
          <Row label="Tagline" value="Strictly Club. Strictly Business." />
          <Row label="Version" value={<Badge>v0.1.0</Badge>} />
          <Row label="Environment" value={<Badge variant={env === "production" ? "success" : "warning"}>{env}</Badge>} />
          <Row label="Node.js" value={nodeVersion} mono />
          <Row label="Next.js" value={nextVersion} mono />
          <Row label="Prisma ORM" value="v7.x" mono />
        </div>

        {/* ── Database ── */}
        <div className="rounded-sm border border-border bg-card overflow-hidden">
          <SectionHeader icon={Database} title="Database" description="PostgreSQL via Prisma — live record counts" />
          <div className="px-5 py-4 flex items-center justify-between border-b border-border">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
              <div>
                <p className="text-xs font-semibold text-foreground">PostgreSQL</p>
                <p className="text-[11px] text-muted-foreground">Managed by Prisma ORM</p>
              </div>
            </div>
            <Badge variant="success">Connected</Badge>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-y divide-border border-b border-border">
            {[
              { icon: FileText, label: "Articles", value: stats.articleCount },
              { icon: FileText, label: "Published", value: stats.publishedCount },
              { icon: Tag, label: "Tags", value: stats.tagCount },
              { icon: Image, label: "Images", value: stats.imageCount },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex flex-col items-center justify-center gap-1 py-5">
                <Icon className="h-4 w-4 text-muted-foreground/50" />
                <span className="font-heading text-2xl text-foreground">{value}</span>
                <span className="text-[10px] font-bold tracking-[0.12em] text-muted-foreground uppercase">{label}</span>
              </div>
            ))}
          </div>
          <Row label="Drafts" value={stats.draftCount} />
          <Row label="Active Leagues" value={stats.leagueCount} />
          <Row label="Active Teams" value={stats.teamCount} />
        </div>

        {/* ── Feature Flags ── */}
        <div className="rounded-sm border border-border bg-card overflow-hidden">
          <SectionHeader icon={Flag} title="Feature Flags" description="Toggle features in src/lib/feature-flags.ts" />
          <div className="divide-y divide-border">
            {featureList.map(({ key, label, description }) => {
              const enabled = FEATURES[key];
              return (
                <div key={key} className="flex items-center justify-between gap-4 px-5 py-3.5">
                  <div className="flex items-center gap-3 min-w-0">
                    {enabled
                      ? <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                      : <XCircle className="h-4 w-4 text-muted-foreground/40 shrink-0" />
                    }
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-foreground">{label}</p>
                      <p className="text-[11px] text-muted-foreground truncate">{description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <code className="text-[10px] font-mono text-muted-foreground/60">{key}</code>
                    <Badge variant={enabled ? "success" : "muted"}>{enabled ? "On" : "Off"}</Badge>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="px-5 py-3 bg-secondary/50">
            <p className="text-[11px] text-muted-foreground/60">To toggle a flag, edit <code className="font-mono text-muted-foreground">src/lib/feature-flags.ts</code> and redeploy.</p>
          </div>
        </div>

        {/* ── Leagues ── */}
        <div className="rounded-sm border border-border bg-card overflow-hidden">
          <SectionHeader icon={Trophy} title="Configured Leagues" description="Leagues available in the article editor and rankings" />
          <div className="divide-y divide-border">
            {leagues.length === 0 ? (
              <div className="px-5 py-6 text-center text-xs text-muted-foreground">No leagues configured. Add them via Admin → Leagues.</div>
            ) : (
              leagues.map((l) => (
                <div key={l.id} className="flex items-center justify-between gap-4 px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    <code className="rounded-sm bg-secondary border border-border px-2 py-0.5 text-[11px] font-bold font-mono text-vcl-gold">{l.code}</code>
                    <span className="text-xs text-foreground">{l.name}</span>
                  </div>
                  <Badge variant={l.active ? "success" : "muted"}>{l.active ? "Active" : "Inactive"}</Badge>
                </div>
              ))
            )}
          </div>
          <div className="px-5 py-3 bg-secondary/50">
            <p className="text-[11px] text-muted-foreground/60">Manage leagues in <a href="/admin/leagues" className="text-vcl-gold hover:underline">Admin → Leagues</a>.</p>
          </div>
        </div>

        {/* ── Security ── */}
        <div className="rounded-sm border border-border bg-card overflow-hidden">
          <SectionHeader icon={Shield} title="Security & Auth" description="Authentication and session configuration" />
          <Row label="Auth Method" value="Cookie-based session (vcl_admin_session)" />
          <Row label="Protected Routes" value="/admin/**" mono />
          <Row label="Session Storage" value="HTTP-only cookie" />
          <Row
            label="NEXTAUTH_SECRET"
            value={
              process.env.NEXTAUTH_SECRET
                ? <Badge variant="success">Configured</Badge>
                : <Badge variant="warning">Not set</Badge>
            }
          />
        </div>

        {/* ── System ── */}
        <div className="rounded-sm border border-border bg-card overflow-hidden">
          <SectionHeader icon={Server} title="System" description="Runtime environment details" />
          <Row
            label="DATABASE_URL"
            value={
              process.env.DATABASE_URL
                ? <Badge variant="success">Configured</Badge>
                : <Badge variant="warning">Not set</Badge>
            }
          />
          <Row
            label="BLOB Storage"
            value={
              process.env.BLOB_READ_WRITE_TOKEN
                ? <Badge variant="success">Configured</Badge>
                : <Badge variant="muted">Not configured</Badge>
            }
          />
          <Row
            label="Upload Path"
            value={process.env.NEXT_PUBLIC_BASE_URL ?? "localhost"}
            mono
          />
        </div>

      </div>
    </div>
  );
}
