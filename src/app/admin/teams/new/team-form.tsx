"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Save, Upload, X } from "lucide-react";
import Image from "next/image";

const leagues = [
  { label: "MCLA", value: "MCLA" },
  { label: "SMLL", value: "SMLL" },
  { label: "NCLL", value: "NCLL" },
  { label: "WCLL", value: "WCLL" },
  { label: "Other", value: "OTHER" },
];

const conferences = [
  "RMLC",
  "SELC",
  "LSA",
  "GRLC",
  "CCLA",
  "PNCLL",
  "UMLC",
  "SLC",
];

type TeamFormProps = {
  formAction: (formData: FormData) => Promise<void>;
};

export function TeamForm({ formAction }: TeamFormProps) {
  const [logoPreview, setLogoPreview] = useState<string>("");

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
              placeholder="e.g., Colorado State"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="shortName">Short Name (optional)</Label>
            <Input
              id="shortName"
              name="shortName"
              placeholder="e.g., CSU"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="league">League *</Label>
            <select
              id="league"
              name="league"
              required
              className="w-full rounded-lg border border-border/60 bg-background px-3 py-2"
            >
              {leagues.map((league) => (
                <option key={league.value} value={league.value}>
                  {league.label}
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
                className="w-full rounded-lg border border-border/60 bg-background px-3 py-2"
              >
                <option value="">Select conference</option>
                {conferences.map((conf) => (
                  <option key={conf} value={conf}>
                    {conf}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="division">Division</Label>
              <select
                id="division"
                name="division"
                className="w-full rounded-lg border border-border/60 bg-background px-3 py-2"
              >
                <option value="">Select division</option>
                <option value="D1">Division 1</option>
                <option value="D2">Division 2</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="logo">Team Logo *</Label>
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
              required
            />
            <p className="text-xs text-muted-foreground">
              Upload a team logo (PNG, JPG, or SVG recommended)
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="officialUrl">Official Website (optional)</Label>
            <Input
              id="officialUrl"
              name="officialUrl"
              type="url"
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
