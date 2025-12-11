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
import { Plus, Pencil, Trash2, Eye } from "lucide-react";

type PollWeek = {
  id: string;
  weekNumber: number;
  season: string;
  status: "DRAFT" | "PUBLISHED";
  publishedAt: string | null;
  entries: { id: string }[];
};

export default function PollsPage() {
  const [polls] = useState<PollWeek[]>([]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Media Polls</h1>
          <p className="text-muted-foreground">
            Manage weekly media poll rankings.
          </p>
        </div>
        <Link href="/admin/polls/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Poll Week
          </Button>
        </Link>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Week</TableHead>
              <TableHead>Season</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Teams Ranked</TableHead>
              <TableHead>Published</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {polls.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  <p className="text-muted-foreground">No polls found.</p>
                  <Link href="/admin/polls/new">
                    <Button variant="link">Create your first poll</Button>
                  </Link>
                </TableCell>
              </TableRow>
            ) : (
              polls.map((poll) => (
                <TableRow key={poll.id}>
                  <TableCell className="font-medium">
                    Week {poll.weekNumber}
                  </TableCell>
                  <TableCell>{poll.season}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        poll.status === "PUBLISHED" ? "default" : "secondary"
                      }
                    >
                      {poll.status.toLowerCase()}
                    </Badge>
                  </TableCell>
                  <TableCell>{poll.entries.length}</TableCell>
                  <TableCell>
                    {poll.publishedAt
                      ? new Date(poll.publishedAt).toLocaleDateString()
                      : "—"}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Link href={`/polls/${poll.season}/${poll.weekNumber}`}>
                        <Button variant="ghost" size="icon">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Link href={`/admin/polls/${poll.id}`}>
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
