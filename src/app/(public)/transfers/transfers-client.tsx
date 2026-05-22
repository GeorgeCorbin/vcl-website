"use client";

import { ArrowRight, Search } from "lucide-react";
import { useState, useMemo } from "react";

type Transfer = {
  id: string;
  playerName: string;
  position: string | null;
  league: string;
  createdAt: Date;
  fromTeam: { name: string } | null;
  toTeam: { name: string } | null;
};

const leagues = ["All", "MCLA", "SMLL", "NCLL", "WCLL"];

export function TransfersClient({ transfers }: { transfers: Transfer[] }) {
  const [activeLeague, setActiveLeague] = useState("All");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    return transfers.filter((tx) => {
      const leagueMatch =
        activeLeague === "All" || tx.league === activeLeague;
      const q = query.trim().toLowerCase();
      const searchMatch =
        !q ||
        tx.playerName.toLowerCase().includes(q) ||
        tx.fromTeam?.name.toLowerCase().includes(q) ||
        tx.toTeam?.name.toLowerCase().includes(q) ||
        (tx.position?.toLowerCase().includes(q) ?? false);
      return leagueMatch && searchMatch;
    });
  }, [transfers, activeLeague, query]);

  return (
    <>
      {/* Filter bar */}
      <div className="border-b border-border bg-secondary">
        <div className="mx-auto max-w-[1440px] px-6 md:px-12 py-3 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap">
            {leagues.map((lg) => (
              <button
                key={lg}
                onClick={() => setActiveLeague(lg)}
                className={`shrink-0 flex items-center justify-center h-8 px-3.5 text-xs font-semibold rounded-sm transition-colors ${
                  activeLeague === lg
                    ? "bg-vcl-gold text-vcl-gold-foreground"
                    : "border border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                {lg}
              </button>
            ))}
          </div>
          <form
            onSubmit={(e) => e.preventDefault()}
            className="flex items-center gap-2 rounded-sm border border-border bg-card px-3 h-8 w-[240px] focus-within:border-vcl-gold/50 transition-colors"
          >
            <Search className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search player or team..."
              className="flex-1 bg-transparent text-xs text-foreground placeholder:text-muted-foreground outline-none min-w-0"
            />
          </form>
        </div>
      </div>

      {/* Table */}
      <div className="mx-auto w-full max-w-[1440px] px-6 py-12 md:px-12 md:py-14">
        <div className="rounded-sm border border-border bg-card overflow-hidden">
          <div className="hidden md:grid grid-cols-[1fr_1fr_48px_1fr_120px_120px] items-center h-11 px-5 bg-secondary border-b border-border">
            {["Player", "From", "", "To", "League", "Date"].map((h) => (
              <span
                key={h}
                className="text-[10px] font-bold tracking-[0.15em] text-muted-foreground uppercase"
              >
                {h}
              </span>
            ))}
          </div>

          {filtered.length === 0 ? (
            <div className="py-20 text-center text-sm text-muted-foreground">
              {query || activeLeague !== "All"
                ? "No transfers match your search. Try adjusting your filters."
                : "No transfers recorded yet. Check back soon."}
            </div>
          ) : (
            <div className="divide-y divide-border">
              {filtered.map((tx) => (
                <div
                  key={tx.id}
                  className="grid grid-cols-1 md:grid-cols-[1fr_1fr_48px_1fr_120px_120px] items-center min-h-[56px] px-5 py-3 md:py-0 hover:bg-accent transition-colors"
                >
                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm font-semibold text-foreground">
                      {tx.playerName}
                    </span>
                    {tx.position && (
                      <span className="text-xs text-muted-foreground">
                        {tx.position}
                      </span>
                    )}
                  </div>
                  <span className="hidden md:block text-sm text-muted-foreground">
                    {tx.fromTeam?.name ?? "—"}
                  </span>
                  <span className="hidden md:flex items-center justify-center">
                    <ArrowRight className="h-3.5 w-3.5 text-vcl-gold" />
                  </span>
                  <span className="hidden md:block text-sm font-medium text-foreground">
                    {tx.toTeam?.name ?? "—"}
                  </span>
                  <span className="hidden md:block">
                    {tx.league && (
                      <span className="rounded-sm bg-vcl-gold px-2 py-0.5 text-[10px] font-bold tracking-widest text-vcl-gold-foreground uppercase">
                        {tx.league}
                      </span>
                    )}
                  </span>
                  <span className="hidden md:block text-xs text-muted-foreground">
                    {new Date(tx.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
