import Link from "next/link";
import { notFound } from "next/navigation";
import type { League } from "@prisma/client";
import { PollService } from "@/lib/services";
import { LeaderboardAd, SidebarAds } from "@/components/ads";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ArrowUp, ArrowDown, Minus } from "lucide-react";

export const dynamic = "force-dynamic";

type PageParams = Promise<{
  league: string;
  season: string;
  week: string;
}>;

function getRankChange(current: number, previous: number | null) {
  if (previous === null) {
    return { icon: null, text: "NR", color: "text-muted-foreground" };
  }
  const diff = previous - current;
  if (diff > 0) {
    return { icon: ArrowUp, text: `+${diff}`, color: "text-green-600" };
  }
  if (diff < 0) {
    return { icon: ArrowDown, text: `${diff}`, color: "text-red-600" };
  }
  return { icon: Minus, text: "—", color: "text-muted-foreground" };
}

export default async function PollDetailPage({ params }: { params: PageParams }) {
  const { league, season, week } = await params;
  const normalizedLeague = league?.toUpperCase() as League | undefined;
  const weekNumber = Number(week);

  if (!normalizedLeague || Number.isNaN(weekNumber) || !season) {
    notFound();
  }

  const poll = await PollService.getByLeagueSeasonWeek(normalizedLeague, season, weekNumber);

  if (!poll) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-12 md:px-6 md:py-16">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">{poll.league} Media Poll</p>
          <h1 className="text-3xl font-bold tracking-tight">
            Week {poll.weekNumber} · {poll.season}
          </h1>
          <p className="text-muted-foreground">
            Published {poll.publishedAt ? new Date(poll.publishedAt).toLocaleDateString() : "Unpublished"}
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/polls" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />
            Back to Polls
          </Link>
        </div>
      </div>

      <LeaderboardAd className="mb-8 hidden md:flex" />

      <div className="flex gap-8">
        <div className="flex-1 space-y-6">
          <Card className="border-border/50">
            <CardHeader>
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="space-y-1">
                  <CardTitle className="text-2xl font-semibold">Top 25 Rankings</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {poll.entries.length} teams ranked · {poll.league}
                  </p>
                </div>
                <Badge variant={poll.status === "PUBLISHED" ? "default" : "secondary"} className="uppercase">
                  {poll.status}
                </Badge>
              </div>
              {poll.notes && (
                <p className="mt-3 text-sm text-muted-foreground whitespace-pre-line">{poll.notes}</p>
              )}
            </CardHeader>
            <CardContent>
              {poll.entries.length === 0 ? (
                <p className="py-10 text-center text-muted-foreground">No rankings submitted for this week.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-16">Rank</TableHead>
                      <TableHead>Team</TableHead>
                      <TableHead>Conference</TableHead>
                      <TableHead className="w-24 text-center">Change</TableHead>
                      {poll.entries.some((entry) => entry.points !== null) && (
                        <TableHead className="w-20 text-right">Points</TableHead>
                      )}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {poll.entries.map((entry) => {
                      const change = getRankChange(entry.rank, entry.previousRank);
                      const ChangeIcon = change.icon;
                      return (
                        <TableRow key={entry.id}>
                          <TableCell className="font-semibold">{entry.rank}</TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">{entry.team.name}</p>
                              {entry.note && <p className="text-xs text-muted-foreground">{entry.note}</p>}
                            </div>
                          </TableCell>
                          <TableCell className="text-muted-foreground">{entry.team.conference || "—"}</TableCell>
                          <TableCell className="text-center">
                            <span className={`inline-flex items-center gap-1 text-sm ${change.color}`}>
                              {ChangeIcon && <ChangeIcon className="h-3 w-3" />}
                              {change.text}
                            </span>
                          </TableCell>
                          {poll.entries.some((e) => e.points !== null) && (
                            <TableCell className="text-right">{entry.points ?? "—"}</TableCell>
                          )}
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          <div className="text-center">
            <Link href="/polls" className="text-sm text-muted-foreground hover:text-foreground">
              View Latest Poll →
            </Link>
          </div>
        </div>

        <SidebarAds className="hidden w-[300px] flex-shrink-0 lg:block" />
      </div>
    </div>
  );
}
