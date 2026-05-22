import Link from "next/link";
import prisma from "@/lib/db";
import { Plus, Settings, Trash2 } from "lucide-react";
import { deleteLeagueConfig } from "./actions";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function LeaguesPage() {
  const leagueConfigs = await prisma.leagueConfig.findMany({
    include: {
      conferences: {
        orderBy: { name: "asc" },
      },
      divisions: {
        orderBy: { displayOrder: "asc" },
      },
    },
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-border pb-6">
        <div>
          <h1 className="font-heading text-4xl tracking-wide text-foreground">Leagues</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage leagues and their conferences.</p>
        </div>
        <Link
          href="/admin/leagues/new"
          className="inline-flex items-center gap-2 rounded-sm bg-vcl-gold px-5 h-10 text-sm font-bold text-vcl-gold-foreground hover:bg-vcl-gold/90 transition-colors shrink-0"
        >
          <Plus className="h-4 w-4" />
          Add League
        </Link>
      </div>

      {/* Table */}
      <div className="rounded-sm border border-border bg-card overflow-hidden">
        <div className="hidden lg:grid grid-cols-[1fr_100px_1fr_1fr_100px_120px] items-center h-11 px-5 bg-secondary border-b border-border">
          {["League","Code","Conferences","Divisions","Status","Actions"].map((h) => (
            <span key={h} className="text-[10px] font-bold tracking-[0.15em] text-muted-foreground uppercase">{h}</span>
          ))}
        </div>
        {leagueConfigs.length === 0 ? (
          <div className="py-16 text-center text-sm text-muted-foreground">No leagues configured. Add your first league to get started.</div>
        ) : (
          <div className="divide-y divide-border">
            {leagueConfigs.map((league) => (
              <div key={league.id} className="grid grid-cols-1 lg:grid-cols-[1fr_100px_1fr_1fr_100px_120px] items-center min-h-[52px] px-5 py-3 lg:py-0 hover:bg-accent transition-colors">
                <span className="text-sm font-medium text-foreground">{league.name}</span>
                <span className="hidden lg:block">
                  <span className="rounded-sm bg-vcl-gold px-2 py-0.5 text-[10px] font-bold tracking-widest text-vcl-gold-foreground uppercase">{league.code}</span>
                </span>
                <div className="hidden lg:flex flex-wrap gap-1">
                  {league.conferences.length === 0
                    ? <span className="text-xs text-muted-foreground">—</span>
                    : league.conferences.map((c) => (
                        <span key={c.id} className="rounded-sm border border-border px-1.5 py-0.5 text-[10px] text-muted-foreground">{c.name}</span>
                      ))}
                </div>
                <div className="hidden lg:flex flex-wrap gap-1">
                  {league.divisions.length === 0
                    ? <span className="text-xs text-muted-foreground">—</span>
                    : league.divisions.map((d) => (
                        <span key={d.id} className="rounded-sm border border-border px-1.5 py-0.5 text-[10px] text-muted-foreground uppercase">{d.code ?? d.name}</span>
                      ))}
                </div>
                <span className="hidden lg:block">
                  <span className={`rounded-sm px-2 py-0.5 text-[10px] font-bold tracking-widest uppercase ${league.active ? "bg-vcl-gold text-vcl-gold-foreground" : "border border-border text-muted-foreground"}`}>
                    {league.active ? "Active" : "Inactive"}
                  </span>
                </span>
                <div className="flex items-center gap-1.5 mt-2 lg:mt-0">
                  <Link href={`/admin/leagues/${league.id}`} className="inline-flex items-center gap-1.5 rounded-sm border border-border px-2.5 py-1.5 text-xs font-semibold text-muted-foreground hover:border-vcl-gold/40 hover:text-vcl-gold transition-colors">
                    <Settings className="h-3 w-3" /> Configure
                  </Link>
                  <form action={deleteLeagueConfig}>
                    <input type="hidden" name="id" value={league.id} />
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
