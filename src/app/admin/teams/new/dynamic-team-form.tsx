"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Save, Upload, X } from "lucide-react";
import Image from "next/image";

type League = { id: string; name: string; code: string };
type Conference = { id: string; name: string; code: string | null };
type Division = { id: string; name: string; code: string };
type Team = {
  id: string;
  name: string;
  shortName: string | null;
  league: string;
  conference: string | null;
  division: string | null;
  logoUrl: string | null;
  officialUrl: string | null;
};

type DynamicTeamFormProps = {
  leagues: League[];
  team?: Team;
  formAction: (formData: FormData) => Promise<void>;
};

export function DynamicTeamForm({ leagues, team, formAction }: DynamicTeamFormProps) {
  const [selectedLeague, setSelectedLeague] = useState(team?.league || leagues[0]?.code || "");
  const [conferences, setConferences] = useState<Conference[]>([]);
  const [divisions, setDivisions] = useState<Division[]>([]);
  const [logoPreview, setLogoPreview] = useState<string>(team?.logoUrl || "");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedLeague) {
      setLoading(true);
      Promise.all([
        fetch(`/api/leagues/${selectedLeague}/conferences`).then(r => r.json()),
        fetch(`/api/leagues/${selectedLeague}/divisions`).then(r => r.json()),
      ])
        .then(([confs, divs]) => {
          setConferences(confs);
          setDivisions(divs);
        })
        .finally(() => setLoading(false));
    }
  }, [selectedLeague]);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearLogo = () => {
    setLogoPreview("");
    const input = document.getElementById("logo") as HTMLInputElement;
    if (input) input.value = "";
  };

  return (
    <form action={formAction}>
      {team && <input type="hidden" name="id" value={team.id} />}
      <Card className="max-w-xl">
        <CardHeader>
          <CardTitle>Team Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Team Name *</Label>
            <Input
              id="name"
              name="name"
              defaultValue={team?.name}
              placeholder="e.g., Colorado State"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="shortName">Short Name (optional)</Label>
            <Input
              id="shortName"
              name="shortName"
              defaultValue={team?.shortName || ""}
              placeholder="e.g., CSU"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="league">League *</Label>
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

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="conference">Conference</Label>
              <select
                id="conference"
                name="conference"
                defaultValue={team?.conference || ""}
                disabled={loading || conferences.length === 0}
                className="w-full rounded-lg border border-border/60 bg-background px-3 py-2 disabled:opacity-50"
              >
                <option value="">Select conference</option>
                {conferences.map((conf) => (
                  <option key={conf.id} value={conf.name}>
                    {conf.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="division">Division</Label>
              <select
                id="division"
                name="division"
                defaultValue={team?.division || ""}
                disabled={loading || divisions.length === 0}
                className="w-full rounded-lg border border-border/60 bg-background px-3 py-2 disabled:opacity-50"
              >
                <option value="">Select division</option>
                {divisions.map((div) => (
                  <option key={div.id} value={div.code}>
                    {div.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="logo">Team Logo {!team && "*"}</Label>
            {logoPreview ? (
              <div className="relative inline-block">
                <Image
                  src={logoPreview}
                  alt="Logo preview"
                  width={120}
                  height={120}
                  className="rounded-lg border border-border/60 object-contain"
                />
                <button
                  type="button"
                  onClick={clearLogo}
                  className="absolute -right-2 -top-2 rounded-full bg-red-500 p-1 text-white hover:bg-red-600"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <label
                htmlFor="logo"
                className="flex h-32 w-32 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border/60 bg-muted/20 transition hover:bg-muted/40"
              >
                <Upload className="h-8 w-8 text-muted-foreground" />
                <span className="mt-2 text-xs text-muted-foreground">Upload Logo</span>
              </label>
            )}
            <input
              id="logo"
              name="logo"
              type="file"
              accept="image/*"
              onChange={handleLogoChange}
              className="hidden"
              required={!team}
            />
            <p className="text-xs text-muted-foreground">
              {team ? "Upload a new logo to replace the current one (optional)" : "Upload a team logo (PNG, JPG, or SVG recommended)"}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="officialUrl">Official Website (optional)</Label>
            <Input
              id="officialUrl"
              name="officialUrl"
              type="url"
              defaultValue={team?.officialUrl || ""}
              placeholder="https://..."
            />
          </div>

          <Button type="submit" className="w-full">
            <Save className="mr-2 h-4 w-4" />
            Save Team
          </Button>
        </CardContent>
      </Card>
    </form>
  );
}
