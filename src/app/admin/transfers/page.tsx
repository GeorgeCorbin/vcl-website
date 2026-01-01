import Link from "next/link";
import { format } from "date-fns";
import { Plus, Pencil, Trash2, ArrowRight } from "lucide-react";
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
import { deleteTransfer } from "./actions";
import { getActiveLeagues } from "@/lib/league-config";

type PageProps = {
  searchParams: Promise<{ league?: string; confirmed?: string }>;
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function TransfersPage({ searchParams }: PageProps) {
  const { league, confirmed } = await searchParams;
  const normalizedLeague = league?.toUpperCase() as League | undefined;
  const confirmedFilter = confirmed === "true" ? true : confirmed === "false" ? false : undefined;

  const [transfers, leagues] = await Promise.all([
    prisma.transfer.findMany({
      where: {
        ...(normalizedLeague && { league: normalizedLeague }),
        ...(confirmedFilter !== undefined && { confirmed: confirmedFilter }),
      },
      include: {
        fromTeam: { select: { name: true } },
        toTeam: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    getActiveLeagues(),
  ]);

  const confirmStatuses = [
    { label: "All Status", value: "" },
    { label: "Confirmed", value: "true" },
    { label: "Unconfirmed", value: "false" },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">Player Movement</p>
          <h1 className="text-3xl font-bold tracking-tight">Transfers</h1>
          <p className="text-muted-foreground">Track player transfers between teams across all leagues.</p>
        </div>
        <Link href="/admin/transfers/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Transfer
          </Button>
        </Link>
      </div>

      <div className="flex flex-wrap gap-2 rounded-2xl border border-border/50 bg-card p-2">
        <Link
          href={`/admin/transfers${confirmed ? `?confirmed=${confirmed}` : ""}`}
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
            href={`/admin/transfers?league=${league.code}${confirmed ? `&confirmed=${confirmed}` : ""}`}
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
            <select name="confirmed" defaultValue={confirmed ?? ""} className="rounded-lg border border-border/60 bg-background px-3 py-2">
              {confirmStatuses.map((s) => (
                <option key={s.label} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </label>
          <Button type="submit" variant="secondary" size="sm">
            Filter
          </Button>
        </form>
        {(normalizedLeague || confirmed) && (
          <Link href="/admin/transfers" className="text-sm text-muted-foreground hover:text-foreground">
            Reset filters
          </Link>
        )}
      </div>

      <div className="rounded-3xl border border-border/50 bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Player</TableHead>
              <TableHead>Transfer</TableHead>
              <TableHead>League</TableHead>
              <TableHead>Position</TableHead>
              <TableHead>Class</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transfers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="py-10 text-center text-muted-foreground">
                  No transfers found. Try another filter or add your first transfer.
                </TableCell>
              </TableRow>
            ) : (
              transfers.map((transfer) => (
                <TableRow key={transfer.id}>
                  <TableCell className="font-medium">{transfer.playerName}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span>{transfer.fromTeam?.name || "Unknown"}</span>
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                      <span>{transfer.toTeam?.name || "Unknown"}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="uppercase">
                      {transfer.league}
                    </Badge>
                  </TableCell>
                  <TableCell>{transfer.position || "—"}</TableCell>
                  <TableCell>{transfer.classYear || "—"}</TableCell>
                  <TableCell>
                    <Badge variant={transfer.confirmed ? "default" : "secondary"}>
                      {transfer.confirmed ? "Confirmed" : "Unconfirmed"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Link href={`/admin/transfers/${transfer.id}`}>
                        <Button variant="ghost" size="icon">
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </Link>
                      <form action={deleteTransfer}>
                        <input type="hidden" name="id" value={transfer.id} />
                        <Button
                          type="submit"
                          variant="ghost"
                          size="icon"
                          className="text-red-500 hover:text-red-600"
                          aria-label={`Delete transfer for ${transfer.playerName}`}
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
