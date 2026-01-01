import Link from "next/link";
import prisma from "@/lib/db";
import { League } from "@prisma/client";
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
import { Plus, Pencil, Trash2, RefreshCw } from "lucide-react";
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
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">Database</p>
          <h1 className="text-3xl font-bold tracking-tight">Teams</h1>
          <p className="text-muted-foreground">Manage teams across all leagues.</p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/teams/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Team
            </Button>
          </Link>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 rounded-2xl border border-border/50 bg-card p-2">
        <Link
          href="/admin/teams"
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
            href={`/admin/teams?league=${league.code}`}
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

      <div className="rounded-3xl border border-border/50 bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Team</TableHead>
              <TableHead>League</TableHead>
              <TableHead>Conference</TableHead>
              <TableHead>Division</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Source</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {teams.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="py-10 text-center text-muted-foreground">
                  No teams found. Add your first team to get started.
                </TableCell>
              </TableRow>
            ) : (
              teams.map((team) => (
                <TableRow key={team.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{team.name}</div>
                      {team.shortName && (
                        <div className="text-sm text-muted-foreground">
                          {team.shortName}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="uppercase">
                      {team.league}
                    </Badge>
                  </TableCell>
                  <TableCell>{team.conference || "—"}</TableCell>
                  <TableCell>{team.division || "—"}</TableCell>
                  <TableCell>
                    <Badge variant={team.active ? "default" : "secondary"}>
                      {team.active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {team.syncedFromMcla ? "MCLA API" : "Manual"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Link href={`/admin/teams/${team.id}`}>
                        <Button variant="ghost" size="icon">
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </Link>
                      <form action={deleteTeam}>
                        <input type="hidden" name="id" value={team.id} />
                        <Button
                          type="submit"
                          variant="ghost"
                          size="icon"
                          className="text-red-500 hover:text-red-600"
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
