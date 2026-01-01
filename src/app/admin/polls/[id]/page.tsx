import { notFound } from "next/navigation";
import prisma from "@/lib/db";
import { Division } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Save, Trash2 } from "lucide-react";
import Link from "next/link";
import { updatePollWeek, deletePollWeek, publishPollWeek } from "../actions";
import PollRankingsManager from "./poll-rankings-manager";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ id: string }>;
};

const normalizeDivision = (division?: string | null): Division | undefined => {
  if (!division) return undefined;
  const normalized = division.trim().toUpperCase();
  if (normalized === "D1" || normalized === "DIVISION 1") return "D1";
  if (normalized === "D2" || normalized === "DIVISION 2") return "D2";
  return undefined;
};

export default async function EditPollWeekPage({ params }: PageProps) {
  const { id } = await params;

  const pollWeek = await prisma.pollWeek.findUnique({
    where: { id },
    include: {
      entries: {
        include: {
          team: true,
        },
        orderBy: { rank: "asc" },
      },
    },
  });

  if (!pollWeek) {
    notFound();
  }

  // Filter teams by league and division (if poll has division)
  const divisionFilter = normalizeDivision(pollWeek.division);
  const teams = await prisma.team.findMany({
    where: {
      active: true,
      league: pollWeek.league,
      ...(divisionFilter && { division: divisionFilter }),
    },
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      shortName: true,
      league: true,
    },
  });

  const deleteSlot = (
    <form action={deletePollWeek} className="flex-shrink-0">
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-100"
      >
        <Trash2 className="mr-2 inline h-4 w-4" />
        Delete Poll Week
      </button>
    </form>
  );

  const publishSlot = pollWeek.status === "DRAFT" ? (
    <form action={publishPollWeek}>
      <input type="hidden" name="id" value={id} />
      <Button type="submit" variant="default">
        Publish Poll
      </Button>
    </form>
  ) : null;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/polls">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Edit Poll Week {pollWeek.weekNumber}
            </h1>
            <p className="text-muted-foreground">
              {pollWeek.season} {pollWeek.league} Media Poll
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {publishSlot}
          {deleteSlot}
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <form action={updatePollWeek}>
            <input type="hidden" name="id" value={pollWeek.id} />
            <Card>
              <CardHeader>
                <CardTitle>Poll Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="weekNumber">Week Number</Label>
                  <Input
                    id="weekNumber"
                    name="weekNumber"
                    type="number"
                    defaultValue={pollWeek.weekNumber}
                    required
                    min="1"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="season">Season</Label>
                  <Input
                    id="season"
                    name="season"
                    defaultValue={pollWeek.season}
                    required
                    placeholder="e.g., 2025"
                  />
                </div>

                <div className="space-y-2">
                  <Label>League</Label>
                  <Badge variant="outline" className="uppercase">
                    {pollWeek.league}
                  </Badge>
                  <input type="hidden" name="league" value={pollWeek.league} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <select
                    id="status"
                    name="status"
                    defaultValue={pollWeek.status}
                    className="w-full rounded-lg border border-border/60 bg-background px-3 py-2"
                  >
                    <option value="DRAFT">Draft</option>
                    <option value="PUBLISHED">Published</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes (optional)</Label>
                  <Textarea
                    id="notes"
                    name="notes"
                    defaultValue={pollWeek.notes || ""}
                    placeholder="Any notes about this poll week..."
                    rows={4}
                  />
                </div>

                <Button type="submit" className="w-full">
                  <Save className="mr-2 h-4 w-4" />
                  Save Details
                </Button>
              </CardContent>
            </Card>
          </form>
        </div>

        <div className="lg:col-span-2">
          <PollRankingsManager
            pollWeekId={pollWeek.id}
            initialEntries={pollWeek.entries}
            availableTeams={teams}
          />
        </div>
      </div>
    </div>
  );
}
