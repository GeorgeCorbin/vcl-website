import prisma from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";
import { createTransfer } from "../actions";
import { getActiveLeagues } from "@/lib/league-config";

const positions = [
  "Attack",
  "Midfield",
  "Defense",
  "Goalie",
  "LSM",
  "FOGO",
];

const classYears = ["Freshman", "Sophomore", "Junior", "Senior", "Graduate"];

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function NewTransferPage() {
  const [teams, leagues] = await Promise.all([
    prisma.team.findMany({
      where: { active: true },
      orderBy: { name: "asc" },
      select: { id: true, name: true, league: true },
    }),
    getActiveLeagues(),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/transfers">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Add Transfer</h1>
          <p className="text-muted-foreground">Record a new player transfer.</p>
        </div>
      </div>

      <form action={createTransfer}>
        <Card className="max-w-xl">
          <CardHeader>
            <CardTitle>Transfer Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="playerName">Player Name</Label>
              <Input
                id="playerName"
                name="playerName"
                placeholder="Enter player name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="league">League</Label>
              <select
                id="league"
                name="league"
                required
                className="w-full rounded-lg border border-border/60 bg-background px-3 py-2"
              >
                {leagues.map((league) => (
                  <option key={league.id} value={league.code}>
                    {league.code}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fromTeamId">From Team</Label>
                <select
                  id="fromTeamId"
                  name="fromTeamId"
                  className="w-full rounded-lg border border-border/60 bg-background px-3 py-2"
                >
                  <option value="">Select team (optional)</option>
                  {teams.map((team) => (
                    <option key={team.id} value={team.id}>
                      {team.name} ({team.league})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="toTeamId">To Team</Label>
                <select
                  id="toTeamId"
                  name="toTeamId"
                  className="w-full rounded-lg border border-border/60 bg-background px-3 py-2"
                >
                  <option value="">Select team (optional)</option>
                  {teams.map((team) => (
                    <option key={team.id} value={team.id}>
                      {team.name} ({team.league})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="position">Position</Label>
                <select
                  id="position"
                  name="position"
                  className="w-full rounded-lg border border-border/60 bg-background px-3 py-2"
                >
                  <option value="">Select position</option>
                  {positions.map((pos) => (
                    <option key={pos} value={pos}>
                      {pos}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="classYear">Class Year</Label>
                <select
                  id="classYear"
                  name="classYear"
                  className="w-full rounded-lg border border-border/60 bg-background px-3 py-2"
                >
                  <option value="">Select class</option>
                  {classYears.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes (optional)</Label>
              <Textarea
                id="notes"
                name="notes"
                placeholder="Any additional notes about this transfer..."
                rows={3}
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="confirmed"
                name="confirmed"
                className="h-4 w-4 rounded border-gray-300"
              />
              <Label htmlFor="confirmed">Confirmed transfer</Label>
            </div>

            <Button type="submit" className="w-full">
              <Save className="mr-2 h-4 w-4" />
              Save Transfer
            </Button>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
