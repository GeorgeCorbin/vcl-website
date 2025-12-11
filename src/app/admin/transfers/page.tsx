"use client";

import { useState } from "react";
import Link from "next/link";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Pencil, Trash2, ArrowRight } from "lucide-react";

type Transfer = {
  id: string;
  playerName: string;
  fromTeam: { name: string } | null;
  toTeam: { name: string } | null;
  position: string | null;
  classYear: string | null;
  confirmed: boolean;
  createdAt: string;
};

export default function TransfersPage() {
  const [confirmedFilter, setConfirmedFilter] = useState<string>("all");
  const [transfers] = useState<Transfer[]>([]);

  const filteredTransfers =
    confirmedFilter === "all"
      ? transfers
      : transfers.filter(
          (t) => t.confirmed === (confirmedFilter === "confirmed")
        );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Transfers</h1>
          <p className="text-muted-foreground">
            Track player transfers between teams.
          </p>
        </div>
        <Link href="/admin/transfers/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Transfer
          </Button>
        </Link>
      </div>

      <div className="flex items-center gap-4">
        <Select value={confirmedFilter} onValueChange={setConfirmedFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Transfers</SelectItem>
            <SelectItem value="confirmed">Confirmed</SelectItem>
            <SelectItem value="unconfirmed">Unconfirmed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Player</TableHead>
              <TableHead>Transfer</TableHead>
              <TableHead>Position</TableHead>
              <TableHead>Class</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTransfers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  <p className="text-muted-foreground">No transfers found.</p>
                  <Link href="/admin/transfers/new">
                    <Button variant="link">Add your first transfer</Button>
                  </Link>
                </TableCell>
              </TableRow>
            ) : (
              filteredTransfers.map((transfer) => (
                <TableRow key={transfer.id}>
                  <TableCell className="font-medium">
                    {transfer.playerName}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span>{transfer.fromTeam?.name || "Unknown"}</span>
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                      <span>{transfer.toTeam?.name || "Unknown"}</span>
                    </div>
                  </TableCell>
                  <TableCell>{transfer.position || "—"}</TableCell>
                  <TableCell>{transfer.classYear || "—"}</TableCell>
                  <TableCell>
                    <Badge
                      variant={transfer.confirmed ? "default" : "secondary"}
                    >
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
                      <Button variant="ghost" size="icon">
                        <Trash2 className="h-4 w-4" />
                      </Button>
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
