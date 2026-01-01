"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GripVertical, Trash2, Plus, Save } from "lucide-react";
import { updatePollEntries } from "../actions";

type Team = {
  id: string;
  name: string;
  shortName: string | null;
  league: string;
};

type PollEntry = {
  id: string;
  teamId: string;
  rank: number;
  previousRank: number | null;
  points: number | null;
  note: string | null;
  team: Team;
};

type Props = {
  pollWeekId: string;
  initialEntries: PollEntry[];
  availableTeams: Team[];
};

export default function PollRankingsManager({
  pollWeekId,
  initialEntries,
  availableTeams,
}: Props) {
  const [entries, setEntries] = useState<PollEntry[]>(initialEntries);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const rankedTeamIds = new Set(entries.map((e) => e.teamId));
  const unrankedTeams = availableTeams.filter((t) => !rankedTeamIds.has(t.id));

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newEntries = [...entries];
    const draggedEntry = newEntries[draggedIndex];
    newEntries.splice(draggedIndex, 1);
    newEntries.splice(index, 0, draggedEntry);

    // Update ranks
    newEntries.forEach((entry, idx) => {
      entry.rank = idx + 1;
    });

    setEntries(newEntries);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const addTeam = (teamId: string) => {
    const team = availableTeams.find((t) => t.id === teamId);
    if (!team) return;

    const newEntry: PollEntry = {
      id: `new-${Date.now()}`,
      teamId: team.id,
      rank: entries.length + 1,
      previousRank: null,
      points: null,
      note: null,
      team,
    };

    setEntries([...entries, newEntry]);
  };

  const removeTeam = (index: number) => {
    const newEntries = entries.filter((_, i) => i !== index);
    // Update ranks
    newEntries.forEach((entry, idx) => {
      entry.rank = idx + 1;
    });
    setEntries(newEntries);
  };

  const updatePoints = (index: number, points: string) => {
    const newEntries = [...entries];
    newEntries[index].points = points ? parseInt(points) : null;
    setEntries(newEntries);
  };

  const updateNote = (index: number, note: string) => {
    const newEntries = [...entries];
    newEntries[index].note = note || null;
    setEntries(newEntries);
  };

  const handleSave = async () => {
    setIsSaving(true);
    const formData = new FormData();
    formData.append("pollWeekId", pollWeekId);
    formData.append("entries", JSON.stringify(entries));
    
    try {
      await updatePollEntries(formData);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Rankings ({entries.length} teams)</CardTitle>
          <Button onClick={handleSave} disabled={isSaving}>
            <Save className="mr-2 h-4 w-4" />
            {isSaving ? "Saving..." : "Save Rankings"}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {entries.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No teams ranked yet. Add teams from the list below.
          </p>
        ) : (
          <div className="space-y-2">
            {entries.map((entry, index) => (
              <div
                key={entry.id}
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragEnd={handleDragEnd}
                className={`flex items-start gap-3 rounded-lg border border-border/50 bg-card p-3 transition ${
                  draggedIndex === index ? "opacity-50" : ""
                }`}
              >
                <div className="flex cursor-grab items-center text-muted-foreground active:cursor-grabbing">
                  <GripVertical className="h-5 w-5" />
                </div>
                <div className="flex min-w-0 flex-1 flex-col gap-2">
                  <div className="flex items-center gap-3">
                    <Badge variant="default" className="shrink-0">
                      #{entry.rank}
                    </Badge>
                    <span className="font-medium">{entry.team.name}</span>
                    {entry.previousRank && (
                      <Badge variant="outline" className="text-xs">
                        Prev: #{entry.previousRank}
                      </Badge>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      placeholder="Points"
                      value={entry.points ?? ""}
                      onChange={(e) => updatePoints(index, e.target.value)}
                      className="h-8 w-24 text-sm"
                    />
                    <Input
                      placeholder="Note (optional)"
                      value={entry.note ?? ""}
                      onChange={(e) => updateNote(index, e.target.value)}
                      className="h-8 flex-1 text-sm"
                    />
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeTeam(index)}
                  className="shrink-0 text-red-500 hover:text-red-600"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {unrankedTeams.length > 0 && (
          <div className="border-t border-border/50 pt-4">
            <h3 className="mb-3 text-sm font-medium">Add Teams</h3>
            <div className="flex flex-wrap gap-2">
              {unrankedTeams.map((team) => (
                <Button
                  key={team.id}
                  variant="outline"
                  size="sm"
                  onClick={() => addTeam(team.id)}
                  className="text-xs"
                >
                  <Plus className="mr-1 h-3 w-3" />
                  {team.shortName || team.name}
                </Button>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
