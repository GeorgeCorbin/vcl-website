"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Label } from "@/components/ui/label";

type League = {
  id: string;
  name: string;
  code: string;
};

type Props = {
  leagues: League[];
  availableWeeks: Array<{ season: string; weekNumber: number; division: string | null }>;
  availableDivisions: string[];
  selectedLeague: string;
  selectedWeek?: string;
  selectedSeason?: string;
  selectedDivision?: string;
};

export default function PollsSelector({
  leagues,
  availableWeeks,
  availableDivisions,
  selectedLeague,
  selectedWeek,
  selectedSeason,
  selectedDivision,
}: Props) {
  const router = useRouter();

  const handleWeekChange = (value: string) => {
    if (!value) return;
    
    const [season, week] = value.split("-");
    const params = new URLSearchParams();
    params.set("league", selectedLeague);
    params.set("season", season);
    params.set("week", week);
    if (selectedDivision) params.set("division", selectedDivision);
    router.push(`/polls?${params.toString()}`);
  };
  
  // Auto-trigger week selection when available weeks change but no week is selected
  useEffect(() => {
    if (availableWeeks.length > 0 && !selectedWeek && !selectedSeason) {
      const firstWeek = availableWeeks[0];
      const params = new URLSearchParams();
      params.set("league", selectedLeague);
      params.set("season", firstWeek.season);
      params.set("week", firstWeek.weekNumber.toString());
      if (selectedDivision) params.set("division", selectedDivision);
      router.replace(`/polls?${params.toString()}`);
    }
  }, [availableWeeks, selectedWeek, selectedSeason, selectedLeague, selectedDivision, router]);

  const handleDivisionChange = (newDivision: string) => {
    const params = new URLSearchParams();
    params.set("league", selectedLeague);
    params.set("division", newDivision);
    // Don't carry over week/season when changing division - let it default to latest
    router.push(`/polls?${params.toString()}`);
  };

  // Default to most recent week if none selected
  const defaultWeekValue = selectedSeason && selectedWeek 
    ? `${selectedSeason}-${selectedWeek}` 
    : availableWeeks[0] ? `${availableWeeks[0].season}-${availableWeeks[0].weekNumber}` : "";

  return (
    <div className="space-y-4">
      {/* League Tabs */}
      <div className="flex flex-wrap gap-2 rounded-2xl border border-border/50 bg-card p-2">
        {leagues.map((league) => (
          <button
            key={league.id}
            onClick={() => router.push(`/polls?league=${league.code}`)}
            className={`rounded-xl px-4 py-2 text-sm font-medium transition-colors ${
              selectedLeague === league.code
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted"
            }`}
          >
            {league.code}
          </button>
        ))}
      </div>

      {/* Week and Division Selectors */}
      <div className="flex flex-wrap gap-4">
        <div className="flex-1 min-w-[200px] space-y-2">
          <Label htmlFor="week" className="text-xs uppercase tracking-wider text-muted-foreground">
            Week
          </Label>
          <select
            id="week"
            value={defaultWeekValue}
            onChange={(e) => handleWeekChange(e.target.value)}
            className="w-full rounded-lg border border-border/60 bg-background px-3 py-2 text-sm"
          >
            {availableWeeks.map((w, index) => (
              <option key={`${w.season}-${w.weekNumber}-${w.division || 'nodiv'}-${index}`} value={`${w.season}-${w.weekNumber}`}>
                Week {w.weekNumber} - {w.season}
              </option>
            ))}
          </select>
        </div>

        {availableDivisions.length > 1 && (
          <div className="flex-1 min-w-[200px] space-y-2">
            <Label htmlFor="division" className="text-xs uppercase tracking-wider text-muted-foreground">
              Division
            </Label>
            <select
              id="division"
              value={selectedDivision || availableDivisions[0]}
              onChange={(e) => handleDivisionChange(e.target.value)}
              className="w-full rounded-lg border border-border/60 bg-background px-3 py-2 text-sm"
            >
              {availableDivisions.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>
    </div>
  );
}
