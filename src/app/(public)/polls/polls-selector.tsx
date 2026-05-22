"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";

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
    <>
      {/* League tab underline bar */}
      {leagues.map((league) => (
        <button
          key={league.id}
          onClick={() => router.push(`/polls?league=${league.code}`)}
          className={`shrink-0 flex items-center justify-center h-12 px-8 text-[13px] border-b-2 transition-colors ${
            selectedLeague === league.code
              ? "border-vcl-gold text-vcl-gold font-bold"
              : "border-transparent text-muted-foreground hover:text-foreground font-normal"
          }`}
        >
          {league.code}
        </button>
      ))}

      {/* Spacer then selectors */}
      <div className="ml-auto flex items-center gap-3 py-2">
        {availableDivisions.length > 1 && (
          <select
            value={selectedDivision || availableDivisions[0]}
            onChange={(e) => handleDivisionChange(e.target.value)}
            className="rounded-sm border border-border bg-card px-3 h-8 text-xs text-foreground"
          >
            {availableDivisions.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        )}
        {availableWeeks.length > 0 && (
          <select
            value={defaultWeekValue}
            onChange={(e) => handleWeekChange(e.target.value)}
            className="rounded-sm border border-border bg-card px-3 h-8 text-xs text-foreground"
          >
            {availableWeeks.map((w, index) => (
              <option key={`${w.season}-${w.weekNumber}-${w.division || "nodiv"}-${index}`} value={`${w.season}-${w.weekNumber}`}>
                Week {w.weekNumber} — {w.season}
              </option>
            ))}
          </select>
        )}
      </div>
    </>
  );
}
