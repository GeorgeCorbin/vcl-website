import Link from "next/link";
import prisma from "@/lib/db";
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
import { Plus, Pencil, Trash2, Settings } from "lucide-react";
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
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">Configuration</p>
          <h1 className="text-3xl font-bold tracking-tight">Leagues</h1>
          <p className="text-muted-foreground">Manage leagues and their conferences.</p>
        </div>
        <Link href="/admin/leagues/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add League
          </Button>
        </Link>
      </div>

      <div className="rounded-3xl border border-border/50 bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>League</TableHead>
              <TableHead>Code</TableHead>
              <TableHead>Conferences</TableHead>
              <TableHead>Divisions</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {leagueConfigs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="py-10 text-center text-muted-foreground">
                  No leagues configured. Add your first league to get started.
                </TableCell>
              </TableRow>
            ) : (
              leagueConfigs.map((league) => (
                <TableRow key={league.id}>
                  <TableCell>
                    <div className="font-medium">{league.name}</div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="uppercase">
                      {league.code}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {league.conferences.length === 0 ? (
                        <span className="text-sm text-muted-foreground">No conferences</span>
                      ) : (
                        league.conferences.map((conf) => (
                          <Badge key={conf.id} variant="secondary" className="text-xs">
                            {conf.name}
                          </Badge>
                        ))
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {league.divisions.length === 0 ? (
                        <span className="text-sm text-muted-foreground">No divisions</span>
                      ) : (
                        league.divisions.map((division) => (
                          <Badge key={division.id} variant="outline" className="text-xs uppercase">
                            {division.code ?? division.name}
                          </Badge>
                        ))
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={league.active ? "default" : "secondary"}>
                      {league.active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Link href={`/admin/leagues/${league.id}`}>
                        <Button variant="ghost" size="icon">
                          <Settings className="h-4 w-4" />
                        </Button>
                      </Link>
                      <form action={deleteLeagueConfig}>
                        <input type="hidden" name="id" value={league.id} />
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
