import Link from "next/link";
import prisma from "@/lib/db";
import { League } from "@prisma/client";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { deleteTeam } from "./actions";
import { getActiveLeagues } from "@/lib/league-config";

type PageProps = {
  searchParams: Promise<{ league?: string }>;
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function TeamsPage({ searchParams }: PageProps) {
  const { league } = await searchParams;
  const normalizedLeague = league?.toUpperCase() as League | undefined;

  const [teams, leagues] = await Promise.all([
    prisma.team.findMany({
      where: normalizedLeague ? { league: normalizedLeague } : {},
      orderBy: { name: "asc" },
    }),
    getActiveLeagues(),
  ]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-border pb-6">
        <div>
          <h1 className="font-heading text-4xl tracking-wide text-foreground">Teams</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage teams across all leagues.</p>
        </div>
        <Link
          href="/admin/teams/new"
          className="inline-flex items-center gap-2 rounded-sm bg-vcl-gold px-5 h-10 text-sm font-bold text-vcl-gold-foreground hover:bg-vcl-gold/90 transition-colors shrink-0"
        >
          <Plus className="h-4 w-4" />
          Add Team
        </Link>
      </div>

      {/* League filters */}
      <div className="flex items-center gap-1.5 flex-wrap">
        <Link
          href="/admin/teams"
          className={`rounded-sm px-3 h-8 flex items-center text-xs font-semibold transition-colors ${!normalizedLeague ? "bg-vcl-gold text-vcl-gold-foreground" : "border border-border text-muted-foreground hover:text-foreground"}`}
        >All Leagues</Link>
        {leagues.map((lg) => (
          <Link
            key={lg.id}
            href={`/admin/teams?league=${lg.code}`}
            className={`rounded-sm px-3 h-8 flex items-center text-xs font-semibold transition-colors ${normalizedLeague === lg.code ? "bg-vcl-gold text-vcl-gold-foreground" : "border border-border text-muted-foreground hover:text-foreground"}`}
          >{lg.code}</Link>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-sm border border-border bg-card overflow-hidden">
        <div className="hidden lg:grid grid-cols-[1fr_100px_160px_120px_100px_100px_120px] items-center h-11 px-5 bg-secondary border-b border-border">
          {["Team","League","Conference","Division","Status","Source","Actions"].map((h) => (
            <span key={h} className="text-[10px] font-bold tracking-[0.15em] text-muted-foreground uppercase">{h}</span>
          ))}
        </div>
        {teams.length === 0 ? (
          <div className="py-16 text-center text-sm text-muted-foreground">No teams found. Add your first team to get started.</div>
        ) : (
          <div className="divide-y divide-border">
            {teams.map((team) => (
              <div key={team.id} className="grid grid-cols-1 lg:grid-cols-[1fr_100px_160px_120px_100px_100px_120px] items-center min-h-[52px] px-5 py-3 lg:py-0 hover:bg-accent transition-colors">
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-medium text-foreground">{team.name}</span>
                  {team.shortName && <span className="text-xs text-muted-foreground">{team.shortName}</span>}
                </div>
                <span className="hidden lg:block">
                  <span className="rounded-sm bg-vcl-gold px-2 py-0.5 text-[10px] font-bold tracking-widest text-vcl-gold-foreground uppercase">{team.league}</span>
                </span>
                <span className="hidden lg:block text-xs text-muted-foreground">{team.conference || "—"}</span>
                <span className="hidden lg:block text-xs text-muted-foreground">{team.division || "—"}</span>
                <span className="hidden lg:block">
                  <span className={`rounded-sm px-2 py-0.5 text-[10px] font-bold tracking-widest uppercase ${team.active ? "bg-vcl-gold text-vcl-gold-foreground" : "border border-border text-muted-foreground"}`}>
                    {team.active ? "Active" : "Inactive"}
                  </span>
                </span>
                <span className="hidden lg:block text-xs text-muted-foreground">{team.syncedFromMcla ? "MCLA API" : "Manual"}</span>
                <div className="flex items-center gap-1.5 mt-2 lg:mt-0">
                  <Link href={`/admin/teams/${team.id}`} className="inline-flex items-center gap-1.5 rounded-sm border border-border px-2.5 py-1.5 text-xs font-semibold text-muted-foreground hover:border-vcl-gold/40 hover:text-vcl-gold transition-colors">
                    <Pencil className="h-3 w-3" /> Edit
                  </Link>
                  <form action={deleteTeam}>
                    <input type="hidden" name="id" value={team.id} />
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
