import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowUp, ArrowDown, Minus } from "lucide-react";
import { SidebarAds, LeaderboardAd } from "@/components/ads";
import { PollService } from "@/lib/services";
import { getActiveLeagues, getDivisionsForLeague } from "@/lib/league-config";
import { League } from "@prisma/client";
import PollsSelector from "./polls-selector";
import prisma from "@/lib/db";

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
  const params = await searchParams;
  const leagues = await getActiveLeagues();
  
  const selectedLeague = (params.league?.toUpperCase() as League) || leagues[0]?.code;
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
    <div className="container mx-auto px-4 py-12 md:px-6 md:py-16">
      <div className="mb-8 md:mb-10">
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight">
          Media Polls
        </h1>
        <p className="mt-2 text-sm md:text-base text-muted-foreground">
          Weekly rankings across all leagues.
        </p>
      </div>

      {/* Poll Selector */}
      <div className="mb-8">
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

      {/* Leaderboard Ad */}
      <LeaderboardAd className="mb-8 hidden md:flex" />

      <div className="flex gap-8">
        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {!latestPoll ? (
            <Card className="border-border/50">
              <CardContent className="py-16 text-center">
                <p className="text-muted-foreground">
                  No polls published yet. Check back soon!
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>
                          Week {latestPoll.weekNumber} - {latestPoll.season}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                          Published{" "}
                          {latestPoll.publishedAt ? new Date(latestPoll.publishedAt).toLocaleDateString() : "Recently"}
                        </p>
                      </div>
                      <Badge>Latest</Badge>
                    </div>
                    {latestPoll.notes && (
                      <p className="text-sm text-muted-foreground mt-2">
                        {latestPoll.notes}
                      </p>
                    )}
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-16">Rank</TableHead>
                          <TableHead>Team</TableHead>
                          <TableHead>Conference</TableHead>
                          <TableHead className="w-24 text-center">Change</TableHead>
                          {latestPoll.entries[0]?.points !== null && (
                            <TableHead className="w-20 text-right">Points</TableHead>
                          )}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {latestPoll.entries.map((entry) => {
                          const change = getRankChange(entry.rank, entry.previousRank);
                          const ChangeIcon = change.icon;
                          return (
                            <TableRow key={entry.id}>
                              <TableCell className="font-bold">{entry.rank}</TableCell>
                              <TableCell>
                                <div>
                                  <span className="font-medium">{entry.team.name}</span>
                                  {entry.note && (
                                    <p className="text-xs text-muted-foreground">
                                      {entry.note}
                                    </p>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell className="text-muted-foreground">
                                {entry.team.conference || "—"}
                              </TableCell>
                              <TableCell className="text-center">
                                <span
                                  className={`inline-flex items-center gap-1 ${change.color}`}
                                >
                                  {ChangeIcon && <ChangeIcon className="h-3 w-3" />}
                                  {change.text}
                                </span>
                              </TableCell>
                              {entry.points !== null && (
                                <TableCell className="text-right">
                                  {entry.points}
                                </TableCell>
                              )}
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>

                <div className="text-center">
                  <Link
                    href="/polls/archive"
                    className="text-sm text-muted-foreground hover:text-foreground"
                  >
                    View Poll Archive →
                  </Link>
                </div>
              </div>
          )}
        </div>

        {/* Sidebar Ads */}
        <SidebarAds className="hidden lg:block w-[300px] flex-shrink-0 sticky top-20" />
      </div>
    </div>
  );
}
