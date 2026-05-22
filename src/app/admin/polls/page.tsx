import { redirect } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { Plus, Pencil, Trash2, Eye } from "lucide-react";
import prisma from "@/lib/db";
import { League, PollStatus } from "@prisma/client";
import { deletePollWeek } from "./actions";
import { getActiveLeagues } from "@/lib/league-config";
import { FEATURES } from "@/lib/feature-flags";

type PageProps = {
  searchParams: Promise<{ league?: string; status?: string; division?: string }>;
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function PollsPage({ searchParams }: PageProps) {
  if (!FEATURES.MEDIA_POLLS) redirect("/admin");

  const { league, status, division } = await searchParams;
  const normalizedLeague = league?.toUpperCase() as League | undefined;
  const normalizedStatus = status?.toUpperCase() as PollStatus | undefined;
  const normalizedDivision = division;

  const [polls, leagues] = await Promise.all([
    prisma.pollWeek.findMany({
      where: {
        ...(normalizedLeague && { league: normalizedLeague }),
        ...(normalizedStatus && { status: normalizedStatus }),
        ...(normalizedDivision && { division: normalizedDivision }),
      },
      include: {
        entries: { select: { id: true } },
      },
      orderBy: [{ season: "desc" }, { weekNumber: "desc" }],
    }),
    getActiveLeagues(),
  ]);

  const statuses = [
    { label: "All Status", value: "" },
    { label: "Draft", value: "DRAFT" },
    { label: "Published", value: "PUBLISHED" },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-border pb-6">
        <div>
          <h1 className="font-heading text-4xl tracking-wide text-foreground">Media Polls</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage weekly media poll rankings across all leagues.</p>
        </div>
        <Link
          href="/admin/polls/new"
          className="inline-flex items-center gap-2 rounded-sm bg-vcl-gold px-5 h-10 text-sm font-bold text-vcl-gold-foreground hover:bg-vcl-gold/90 transition-colors shrink-0"
        >
          <Plus className="h-4 w-4" />
          New Poll Week
        </Link>
      </div>

      {/* Stat cards */}
      <div className="grid gap-4 grid-cols-3">
        {[
          { label: "Published Polls", value: polls.filter(p => p.status === "PUBLISHED").length },
          { label: "Draft Polls", value: polls.filter(p => p.status === "DRAFT").length, gold: true },
          { label: "Current Week", value: polls[0]?.weekNumber ?? "—" },
        ].map((s) => (
          <div key={s.label} className="rounded-sm border border-border bg-card p-5">
            <p className="text-xs text-muted-foreground mb-2">{s.label}</p>
            <p className={`font-heading text-4xl ${s.gold ? "text-vcl-gold" : "text-foreground"}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-1.5 flex-wrap">
          <Link
            href={`/admin/polls${normalizedStatus ? `?status=${normalizedStatus}` : ""}`}
            className={`rounded-sm px-3 h-8 flex items-center text-xs font-semibold transition-colors ${!normalizedLeague ? "bg-vcl-gold text-vcl-gold-foreground" : "border border-border text-muted-foreground hover:text-foreground"}`}
          >All Leagues</Link>
          {leagues.map((lg) => (
            <Link
              key={lg.id}
              href={`/admin/polls?league=${lg.code}${normalizedStatus ? `&status=${normalizedStatus}` : ""}`}
              className={`rounded-sm px-3 h-8 flex items-center text-xs font-semibold transition-colors ${normalizedLeague === lg.code ? "bg-vcl-gold text-vcl-gold-foreground" : "border border-border text-muted-foreground hover:text-foreground"}`}
            >{lg.code}</Link>
          ))}
        </div>
        <form className="flex items-center gap-2">
          {normalizedLeague && <input type="hidden" name="league" value={normalizedLeague} />}
          <select name="status" defaultValue={normalizedStatus ?? ""} className="rounded-sm border border-border bg-card px-3 h-8 text-xs text-foreground">
            {statuses.map((s) => <option key={s.label} value={s.value}>{s.label}</option>)}
          </select>
          <select name="division" defaultValue={normalizedDivision ?? ""} className="rounded-sm border border-border bg-card px-3 h-8 text-xs text-foreground">
            <option value="">All Divisions</option>
            <option value="Division 1">Division 1</option>
            <option value="Division 2">Division 2</option>
            <option value="Division 3">Division 3</option>
          </select>
          <button type="submit" className="rounded-sm border border-border px-3 h-8 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors">Filter</button>
          {(normalizedLeague || normalizedStatus || normalizedDivision) && (
            <Link href="/admin/polls" className="text-xs text-muted-foreground hover:text-foreground">Reset</Link>
          )}
        </form>
      </div>

      {/* Table */}
      <div className="rounded-sm border border-border bg-card overflow-hidden">
        <div className="hidden lg:grid grid-cols-[80px_100px_120px_140px_120px_140px_1fr] items-center h-11 px-5 bg-secondary border-b border-border">
          {["Week","Season","League","Teams Ranked","Status","Created","Actions"].map((h) => (
            <span key={h} className="text-[10px] font-bold tracking-[0.15em] text-muted-foreground uppercase">{h}</span>
          ))}
        </div>
        {polls.length === 0 ? (
          <div className="py-16 text-center text-sm text-muted-foreground">No polls found. Try another filter or create your first poll.</div>
        ) : (
          <div className="divide-y divide-border">
            {polls.map((poll) => (
              <div key={poll.id} className="grid grid-cols-1 lg:grid-cols-[80px_100px_120px_140px_120px_140px_1fr] items-center min-h-[52px] px-5 py-3 lg:py-0 hover:bg-accent transition-colors">
                <span className="text-sm font-semibold text-foreground">Wk {poll.weekNumber}</span>
                <span className="text-sm text-muted-foreground">{poll.season}</span>
                <span className="hidden lg:block">
                  <span className="rounded-sm bg-vcl-gold px-2 py-0.5 text-[10px] font-bold tracking-widest text-vcl-gold-foreground uppercase">{poll.league}</span>
                </span>
                <span className="hidden lg:block text-sm text-muted-foreground">{poll.entries.length}</span>
                <span className="hidden lg:block">
                  <span className={`rounded-sm px-2 py-0.5 text-[10px] font-bold tracking-widest uppercase ${poll.status === "PUBLISHED" ? "bg-vcl-gold text-vcl-gold-foreground" : "border border-border text-muted-foreground"}`}>
                    {poll.status}
                  </span>
                </span>
                <span className="hidden lg:block text-xs text-muted-foreground">
                  {poll.publishedAt ? format(poll.publishedAt, "MMM d, yyyy") : "—"}
                </span>
                <div className="flex items-center gap-2 mt-2 lg:mt-0">
                  <Link href={`/polls/${poll.league.toLowerCase()}/${poll.season}/${poll.weekNumber}`} className="inline-flex items-center gap-1.5 rounded-sm border border-border px-2.5 py-1.5 text-xs font-semibold text-muted-foreground hover:border-vcl-gold/40 hover:text-vcl-gold transition-colors">
                    <Eye className="h-3 w-3" /> View
                  </Link>
                  <Link href={`/admin/polls/${poll.id}`} className="inline-flex items-center gap-1.5 rounded-sm border border-border px-2.5 py-1.5 text-xs font-semibold text-muted-foreground hover:border-vcl-gold/40 hover:text-vcl-gold transition-colors">
                    <Pencil className="h-3 w-3" /> Edit
                  </Link>
                  <form action={deletePollWeek}>
                    <input type="hidden" name="id" value={poll.id} />
                    <button type="submit" className="inline-flex items-center gap-1.5 rounded-sm border border-border px-2.5 py-1.5 text-xs font-semibold text-muted-foreground hover:border-red-500/40 hover:text-red-400 transition-colors">
                      <Trash2 className="h-3 w-3" /> Delete
                    </button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
