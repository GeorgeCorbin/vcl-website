"use client";

import { useState, useEffect, useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Save } from "lucide-react";
import { createPollWeek } from "../actions";

type League = {
  id: string;
  name: string;
  code: string;
};

type Division = {
  id: string;
  name: string;
  code: string;
};

type Props = {
  leagues: League[];
  currentYear: number;
};

type FormState = {
  error: string | null;
};

const statuses = [
  { label: "Draft", value: "DRAFT" },
  { label: "Published", value: "PUBLISHED" },
];

const initialState: FormState = { error: null };

export default function PollForm({ leagues, currentYear }: Props) {
  const [state, formAction] = useActionState<FormState, FormData>(createPollWeek, initialState);
  const [selectedLeague, setSelectedLeague] = useState(leagues[0]?.code || "");
  const [divisions, setDivisions] = useState<Division[]>([]);

  useEffect(() => {
    async function fetchDivisions() {
      if (!selectedLeague) return;
      
      try {
        const response = await fetch(`/api/leagues/${selectedLeague}/divisions`);
        if (response.ok) {
          const data = await response.json();
          setDivisions(data);
        }
      } catch (error) {
        console.error("Failed to fetch divisions:", error);
      }
    }
    
    fetchDivisions();
  }, [selectedLeague]);

  return (
    <form action={formAction}>
      <Card className="max-w-xl">
        <CardHeader>
          <CardTitle>Poll Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {state?.error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-900">
              <p className="font-medium">Error</p>
              <p className="mt-1">{state.error}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="weekNumber">Week Number</Label>
              <Input
                id="weekNumber"
                name="weekNumber"
                type="number"
                min={1}
                max={20}
                defaultValue={1}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="season">Season</Label>
              <Input
                id="season"
                name="season"
                defaultValue={`${currentYear}`}
                placeholder="2024"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="league">League</Label>
            <select
              id="league"
              name="league"
              value={selectedLeague}
              onChange={(e) => setSelectedLeague(e.target.value)}
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

          {divisions.length > 1 ? (
            <div className="space-y-2">
              <Label htmlFor="division">Division *</Label>
              <select
                id="division"
                name="division"
                required
                defaultValue={divisions[0]?.code ?? divisions[0]?.name ?? ""}
                className="w-full rounded-lg border border-border/60 bg-background px-3 py-2"
              >
                {divisions.map((division) => (
                  <option key={division.id} value={division.code ?? division.name ?? ""}>
                    {division.name}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            divisions[0] && (
              <input type="hidden" name="division" value={divisions[0].code ?? divisions[0].name ?? ""} />
            )
          )}

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <select
              id="status"
              name="status"
              required
              className="w-full rounded-lg border border-border/60 bg-background px-3 py-2"
            >
              {statuses.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea
              id="notes"
              name="notes"
              placeholder="Any notes about this poll week..."
              rows={3}
            />
          </div>

          <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900">
            <p className="font-medium">📝 Next Step</p>
            <p className="mt-1 text-blue-800">
              After creating the poll week, you'll be able to add teams and set their rankings on the edit page.
            </p>
          </div>

          <Button type="submit" className="w-full">
            <Save className="mr-2 h-4 w-4" />
            Create Poll Week
          </Button>
        </CardContent>
      </Card>
    </form>
  );
}
