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

export default function PollsPage() {
  // TODO: Fetch latest poll from API
  const latestPoll = null as {
    id: string;
    weekNumber: number;
    season: string;
    notes: string | null;
    publishedAt: string;
    entries: Array<{
      id: string;
      rank: number;
      previousRank: number | null;
      points: number | null;
      note: string | null;
      team: { id: string; name: string; conference: string | null };
    }>;
  } | null;

  const getRankChange = (current: number, previous: number | null) => {
    if (previous === null) return { icon: null, text: "NR", color: "text-green-600" };
    const diff = previous - current;
    if (diff > 0) return { icon: ArrowUp, text: `+${diff}`, color: "text-green-600" };
    if (diff < 0) return { icon: ArrowDown, text: `${diff}`, color: "text-red-600" };
    return { icon: Minus, text: "—", color: "text-muted-foreground" };
  };

  return (
    <div className="container py-8 md:py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
          Media Poll
        </h1>
        <p className="mt-2 text-muted-foreground">
          Weekly rankings of the top MCLA teams.
        </p>
      </div>

      {!latestPoll ? (
        <Card>
          <CardContent className="py-12 text-center">
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
                    {new Date(latestPoll.publishedAt).toLocaleDateString()}
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
  );
}
