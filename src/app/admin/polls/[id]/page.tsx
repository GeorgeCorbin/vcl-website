import { notFound, redirect } from "next/navigation";
import prisma from "@/lib/db";
import { Division } from "@prisma/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Save, Trash2 } from "lucide-react";
import Link from "next/link";
import { updatePollWeek, deletePollWeek, publishPollWeek } from "../actions";
import PollRankingsManager from "./poll-rankings-manager";
import { FEATURES } from "@/lib/feature-flags";

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
  if (!FEATURES.MEDIA_POLLS) redirect("/admin");

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

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between border-b border-border pb-6">
        <div className="flex items-start gap-3">
          <Link
            href="/admin/polls"
            className="inline-flex items-center justify-center rounded-sm border border-border h-9 w-9 text-muted-foreground hover:text-foreground transition-colors shrink-0 mt-1"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="font-heading text-4xl tracking-wide text-foreground">Edit Poll Week {pollWeek.weekNumber}</h1>
            <p className="text-sm text-muted-foreground mt-1">{pollWeek.season} {pollWeek.league} Media Poll</p>
          </div>
        </div>
        <div className="flex items-center gap-2 md:shrink-0">
          {pollWeek.status === "DRAFT" && (
            <form action={publishPollWeek}>
              <input type="hidden" name="id" value={id} />
              <button type="submit" className="inline-flex items-center gap-2 rounded-sm bg-vcl-gold px-5 h-10 text-sm font-bold text-vcl-gold-foreground hover:bg-vcl-gold/90 transition-colors">
                Publish Poll
              </button>
            </form>
          )}
          <form action={deletePollWeek}>
            <input type="hidden" name="id" value={id} />
            <button type="submit" className="inline-flex items-center gap-1.5 rounded-sm border border-border px-4 h-10 text-sm font-semibold text-muted-foreground hover:border-red-500/40 hover:text-red-400 transition-colors">
              <Trash2 className="h-4 w-4" /> Delete
            </button>
          </form>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <form action={updatePollWeek}>
            <input type="hidden" name="id" value={pollWeek.id} />
            <div className="rounded-sm border border-border bg-card p-6 space-y-4">
              <h2 className="text-[10px] font-bold tracking-[0.15em] text-muted-foreground uppercase">Poll Details</h2>
              <div className="space-y-2">
                <Label htmlFor="weekNumber">Week Number</Label>
                <Input id="weekNumber" name="weekNumber" type="number" defaultValue={pollWeek.weekNumber} required min="1" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="season">Season</Label>
                <Input id="season" name="season" defaultValue={pollWeek.season} required placeholder="e.g., 2025" />
              </div>
              <div className="space-y-2">
                <Label>League</Label>
                <div>
                  <span className="rounded-sm bg-vcl-gold px-2 py-0.5 text-[10px] font-bold tracking-widest text-vcl-gold-foreground uppercase">{pollWeek.league}</span>
                </div>
                <input type="hidden" name="league" value={pollWeek.league} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <select id="status" name="status" defaultValue={pollWeek.status} className="w-full rounded-sm border border-border bg-card px-3 py-2 text-sm text-foreground">
                  <option value="DRAFT">Draft</option>
                  <option value="PUBLISHED">Published</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes (optional)</Label>
                <Textarea id="notes" name="notes" defaultValue={pollWeek.notes || ""} placeholder="Any notes about this poll week..." rows={4} />
              </div>
              <button type="submit" className="inline-flex items-center justify-center gap-2 w-full rounded-sm bg-vcl-gold h-10 text-sm font-bold text-vcl-gold-foreground hover:bg-vcl-gold/90 transition-colors">
                <Save className="h-4 w-4" /> Save Details
              </button>
            </div>
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
