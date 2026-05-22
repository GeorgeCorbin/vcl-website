import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowUp, ArrowDown, Minus } from "lucide-react";
import { PollService } from "@/lib/services";
import { getActiveLeagues, getDivisionsForLeague } from "@/lib/league-config";
import { League } from "@prisma/client";
import PollsSelector from "./polls-selector";
import prisma from "@/lib/db";
import { FEATURES } from "@/lib/feature-flags";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams: Promise<{
    league?: string;
    season?: string;
    week?: string;
    division?: string;
  }>;
};

export default async function PollsPage({ searchParams }: PageProps) {
  if (!FEATURES.MEDIA_POLLS) redirect("/");

  const params = await searchParams;
  const leagues = await getActiveLeagues();
  
  const validLeagues: League[] = ["MCLA", "SMLL", "NCLL", "WCLL", "OTHER"];
  const requestedLeague = params.league?.toUpperCase();
  const selectedLeague: League = (
    requestedLeague && validLeagues.includes(requestedLeague as League)
      ? requestedLeague
      : (leagues[0]?.code ?? "MCLA")
  ) as League;
  const selectedSeason = params.season;
  const selectedWeek = params.week ? parseInt(params.week) : undefined;
  const selectedDivision = params.division;

  // Get divisions for the selected league
  const divisions = selectedLeague ? await getDivisionsForLeague(selectedLeague) : [];
  const availableDivisions = divisions.map((d) => d.name);
  
  // Default to first division if multiple divisions exist and none selected
  const effectiveDivision = selectedDivision || (availableDivisions.length > 1 ? availableDivisions[0] : undefined);
  
  // Map division name to code for database queries
  const selectedDivisionCode = effectiveDivision 
    ? divisions.find(d => d.name === effectiveDivision)?.code 
    : undefined;

  // Get available weeks for the selected league and division
  const availableWeeks = await prisma.pollWeek.findMany({
    where: {
      league: selectedLeague,
      ...(selectedDivisionCode && { division: selectedDivisionCode }),
      status: "PUBLISHED",
    },
    select: {
      season: true,
      weekNumber: true,
      division: true,
    },
    // When division is selected, only distinct by season/week
    // When no division, distinct by all three to show all combinations
    distinct: selectedDivisionCode 
      ? ["season", "weekNumber"] 
      : ["season", "weekNumber", "division"],
    orderBy: [{ season: "desc" }, { weekNumber: "desc" }],
  });

  // Fetch the poll based on selections, or latest if no selection
  let displayPoll;
  if (selectedSeason && selectedWeek) {
    displayPoll = await prisma.pollWeek.findFirst({
      where: {
        league: selectedLeague,
        season: selectedSeason,
        weekNumber: selectedWeek,
        ...(selectedDivisionCode && { division: selectedDivisionCode }),
        status: "PUBLISHED",
      },
      include: {
        entries: {
          include: { team: true },
          orderBy: { rank: "asc" },
        },
      },
    });
  } else {
    // Get latest poll for selected league and division
    displayPoll = await prisma.pollWeek.findFirst({
      where: {
        league: selectedLeague,
        ...(selectedDivisionCode && { division: selectedDivisionCode }),
        status: "PUBLISHED",
      },
      include: {
        entries: {
          include: { team: true },
          orderBy: { rank: "asc" },
        },
      },
      orderBy: [{ season: "desc" }, { weekNumber: "desc" }],
    });
  }

  const latestPoll = displayPoll;

  const getRankChange = (current: number, previous: number | null) => {
    if (previous === null) return { icon: null, text: "NR", color: "text-green-600" };
    const diff = previous - current;
    if (diff > 0) return { icon: ArrowUp, text: `+${diff}`, color: "text-green-600" };
    if (diff < 0) return { icon: ArrowDown, text: `${diff}`, color: "text-red-600" };
    return { icon: Minus, text: "—", color: "text-muted-foreground" };
  };

  return (
    <div className="flex flex-col">
      {/* ── Page header ── */}
      <div className="border-b border-border bg-secondary">
        <div className="mx-auto max-w-[1440px] px-6 py-10 md:px-12 md:py-12">
          <nav className="flex items-center gap-2 text-xs text-muted-foreground mb-5">
            <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
            <span>/</span>
            <span className="text-foreground">Media Poll</span>
          </nav>
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <h1 className="font-heading text-6xl lg:text-7xl tracking-tight text-foreground">
                MEDIA POLL RANKINGS
              </h1>
              <p className="mt-3 text-sm text-muted-foreground max-w-xl">
                Weekly rankings compiled from our panel of club lacrosse media members.
              </p>
            </div>
            {latestPoll && (
              <div className="text-right shrink-0">
                <p className="text-[10px] font-bold tracking-[0.15em] text-muted-foreground uppercase mb-1">Current Poll</p>
                <p className="font-heading text-2xl text-vcl-gold">
                  Week {latestPoll.weekNumber} — {latestPoll.season}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── League tabs ── */}
      <div className="border-b border-border bg-secondary">
        <div className="mx-auto max-w-[1440px] px-6 md:px-12 flex items-center gap-0 overflow-x-auto">
          <PollsSelector
            leagues={leagues}
            availableWeeks={availableWeeks}
            availableDivisions={availableDivisions}
            selectedLeague={selectedLeague}
            selectedWeek={selectedWeek?.toString()}
            selectedSeason={selectedSeason}
            selectedDivision={effectiveDivision}
          />
        </div>
      </div>

      {/* ── Content ── */}
      <div className="mx-auto w-full max-w-[1440px] px-6 py-10 md:px-12 md:py-12">
        <div className="flex gap-10 items-start">
          {/* Rankings table */}
          <div className="flex-1 min-w-0">
            {!latestPoll ? (
              <div className="rounded-sm border border-border bg-card p-16 text-center">
                <p className="text-sm text-muted-foreground">No polls published yet. Check back soon!</p>
              </div>
            ) : (
              <div className="rounded-sm border border-border bg-card overflow-hidden">
                {latestPoll.notes && (
                  <div className="px-5 py-3 border-b border-border bg-secondary text-xs text-muted-foreground">
                    {latestPoll.notes}
                  </div>
                )}
                {/* Table head */}
                <div className="hidden md:grid grid-cols-[56px_1fr_140px_80px_80px] items-center h-11 px-5 bg-secondary border-b border-border">
                  <span className="text-[10px] font-bold tracking-[0.15em] text-muted-foreground uppercase">RK</span>
                  <span className="text-[10px] font-bold tracking-[0.15em] text-muted-foreground uppercase">TEAM</span>
                  <span className="text-[10px] font-bold tracking-[0.15em] text-muted-foreground uppercase">CONF</span>
                  <span className="text-[10px] font-bold tracking-[0.15em] text-muted-foreground uppercase">PTS</span>
                  <span className="text-[10px] font-bold tracking-[0.15em] text-muted-foreground uppercase">TREND</span>
                </div>
                {/* Rows */}
                <div className="divide-y divide-border">
                  {latestPoll.entries.map((entry) => {
                    const change = getRankChange(entry.rank, entry.previousRank);
                    const ChangeIcon = change.icon;
                    const isFirst = entry.rank === 1;
                    return (
                      <div
                        key={entry.id}
                        className={`grid grid-cols-[56px_1fr] md:grid-cols-[56px_1fr_140px_80px_80px] items-center min-h-[52px] px-5 py-3 md:py-0 ${isFirst ? "bg-vcl-gold/5" : ""}`}
                      >
                        {/* Rank badge */}
                        <div className={`flex items-center justify-center w-7 h-7 rounded-sm text-sm font-heading ${isFirst ? "bg-vcl-gold text-vcl-gold-foreground" : "bg-accent text-foreground"}`}>
                          {entry.rank}
                        </div>
                        {/* Team + mobile details */}
                        <div className="flex flex-col gap-0.5 ml-1">
                          <span className={`text-sm ${isFirst ? "font-bold text-foreground" : "font-medium text-foreground"}`}>
                            {entry.team.name}
                          </span>
                          {entry.note && <span className="text-xs text-muted-foreground">{entry.note}</span>}
                          {/* Mobile only: conf + trend inline */}
                          <div className="flex items-center gap-3 md:hidden text-xs text-muted-foreground mt-0.5">
                            <span>{entry.team.conference || "—"}</span>
                            {entry.points !== null && <span>{entry.points} pts</span>}
                            <span className={`inline-flex items-center gap-1 ${change.color}`}>
                              {ChangeIcon && <ChangeIcon className="h-3 w-3" />}
                              {change.text}
                            </span>
                          </div>
                        </div>
                        {/* Desktop columns */}
                        <span className="hidden md:block text-sm text-muted-foreground">{entry.team.conference || "—"}</span>
                        <span className="hidden md:block text-sm text-foreground">{entry.points ?? "—"}</span>
                        <span className={`hidden md:inline-flex items-center gap-1 text-sm ${change.color}`}>
                          {ChangeIcon && <ChangeIcon className="h-3.5 w-3.5" />}
                          {change.text}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <aside className="hidden xl:flex flex-col gap-6 w-[280px] shrink-0">
            {/* Archive */}
            {availableWeeks.length > 1 && (
              <div className="rounded-sm border border-border bg-card p-5">
                <h3 className="text-[10px] font-bold tracking-[0.15em] text-muted-foreground uppercase mb-4">Poll Archive</h3>
                <div className="flex flex-col gap-2">
                  {availableWeeks.slice(0, 8).map((w, i) => {
                    const isCurrent = i === 0;
                    return (
                      <Link
                        key={`${w.season}-${w.weekNumber}`}
                        href={`/polls?league=${selectedLeague}&season=${w.season}&week=${w.weekNumber}`}
                        className={`flex items-center justify-between rounded-sm px-3 py-2 text-sm transition-colors ${
                          isCurrent
                            ? "bg-vcl-gold text-vcl-gold-foreground font-semibold"
                            : "border border-border text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        <span>Week {w.weekNumber} — {w.season}</span>
                        {isCurrent && <span className="text-[10px] font-bold">Current</span>}
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}

            {/* About the poll */}
            <div className="rounded-sm border border-border bg-card p-5">
              <h3 className="text-[10px] font-bold tracking-[0.15em] text-muted-foreground uppercase mb-3">About the Poll</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Rankings are compiled weekly from a panel of club lacrosse journalists, writers, and media members covering all major conferences.
              </p>
            </div>

            {/* Ad */}
            <div className="rounded-sm border border-border bg-card flex items-center justify-center h-[250px] text-xs text-muted-foreground">
              Advertisement · 300×250
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
