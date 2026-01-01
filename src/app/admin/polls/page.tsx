import Link from "next/link";
import { format } from "date-fns";
import { Plus, Pencil, Trash2, Eye } from "lucide-react";
import prisma from "@/lib/db";
import { League, PollStatus } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { deletePollWeek } from "./actions";
import { getActiveLeagues } from "@/lib/league-config";

type PageProps = {
  searchParams: Promise<{ league?: string; status?: string; division?: string }>;
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function PollsPage({ searchParams }: PageProps) {
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
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">Rankings</p>
          <h1 className="text-3xl font-bold tracking-tight">Media Polls</h1>
          <p className="text-muted-foreground">Manage weekly media poll rankings across all leagues.</p>
        </div>
        <Link href="/admin/polls/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Poll Week
          </Button>
        </Link>
      </div>

      <div className="flex flex-wrap gap-2 rounded-2xl border border-border/50 bg-card p-2">
        <Link
          href={`/admin/polls${normalizedStatus ? `?status=${normalizedStatus}` : ""}`}
          className={`rounded-xl px-4 py-2 text-sm font-medium transition-colors ${
            !normalizedLeague
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:bg-muted"
          }`}
        >
          All
        </Link>
        {leagues.map((league) => (
          <Link
            key={league.id}
            href={`/admin/polls?league=${league.code}${normalizedStatus ? `&status=${normalizedStatus}` : ""}`}
            className={`rounded-xl px-4 py-2 text-sm font-medium transition-colors ${
              normalizedLeague === league.code
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted"
            }`}
          >
            {league.code}
          </Link>
        ))}
      </div>

      <div className="flex items-center gap-4">
        <form className="flex items-center gap-3">
          {normalizedLeague && <input type="hidden" name="league" value={normalizedLeague} />}
          <label className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">Status:</span>
            <select name="status" defaultValue={normalizedStatus ?? ""} className="rounded-lg border border-border/60 bg-background px-3 py-2">
              {statuses.map((s) => (
                <option key={s.label} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </label>
          <label className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">Division:</span>
            <select name="division" defaultValue={normalizedDivision ?? ""} className="rounded-lg border border-border/60 bg-background px-3 py-2">
              <option value="">All Divisions</option>
              <option value="Division 1">Division 1</option>
              <option value="Division 2">Division 2</option>
              <option value="Division 3">Division 3</option>
            </select>
          </label>
          <Button type="submit" variant="secondary" size="sm">
            Filter
          </Button>
        </form>
        {(normalizedLeague || normalizedStatus || normalizedDivision) && (
          <Link href="/admin/polls" className="text-sm text-muted-foreground hover:text-foreground">
            Reset filters
          </Link>
        )}
      </div>

      <div className="rounded-3xl border border-border/50 bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Week</TableHead>
              <TableHead>Season</TableHead>
              <TableHead>League</TableHead>
              <TableHead>Division</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Teams</TableHead>
              <TableHead>Published</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {polls.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="py-10 text-center text-muted-foreground">
                  No polls found. Try another filter or create your first poll.
                </TableCell>
              </TableRow>
            ) : (
              polls.map((poll) => (
                <TableRow key={poll.id}>
                  <TableCell className="font-medium">Week {poll.weekNumber}</TableCell>
                  <TableCell>{poll.season}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="uppercase">
                      {poll.league}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {poll.division ? (
                      <Badge variant="secondary">{poll.division}</Badge>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={poll.status === "PUBLISHED" ? "default" : "secondary"}>
                      {poll.status.toLowerCase()}
                    </Badge>
                  </TableCell>
                  <TableCell>{poll.entries.length}</TableCell>
                  <TableCell>
                    {poll.publishedAt ? format(poll.publishedAt, "MMM d, yyyy") : "—"}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Link href={`/polls/${poll.league.toLowerCase()}/${poll.season}/${poll.weekNumber}`}>
                        <Button variant="ghost" size="icon">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Link href={`/admin/polls/${poll.id}`}>
                        <Button variant="ghost" size="icon">
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </Link>
                      <form action={deletePollWeek}>
                        <input type="hidden" name="id" value={poll.id} />
                        <Button
                          type="submit"
                          variant="ghost"
                          size="icon"
                          className="text-red-500 hover:text-red-600"
                          aria-label={`Delete poll week ${poll.weekNumber}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </form>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
