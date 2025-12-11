"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";

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

export default function NewTeamPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    shortName: "",
    conference: "",
    division: "",
    logoUrl: "",
    officialUrl: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/teams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          division: formData.division || undefined,
        }),
      });

      if (response.ok) {
        router.push("/admin/teams");
      } else {
        const error = await response.json();
        alert(error.error || "Failed to create team");
      }
    } catch (error) {
      console.error("Error creating team:", error);
      alert("Failed to create team");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/teams">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Add Team</h1>
          <p className="text-muted-foreground">Add a new team to the database.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card className="max-w-xl">
          <CardHeader>
            <CardTitle>Team Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Team Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="e.g., Colorado State"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="shortName">Short Name (optional)</Label>
              <Input
                id="shortName"
                value={formData.shortName}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, shortName: e.target.value }))
                }
                placeholder="e.g., CSU"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="conference">Conference</Label>
                <Select
                  value={formData.conference}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, conference: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select conference" />
                  </SelectTrigger>
                  <SelectContent>
                    {conferences.map((conf) => (
                      <SelectItem key={conf} value={conf}>
                        {conf}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="division">Division</Label>
                <Select
                  value={formData.division}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, division: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select division" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="D1">Division 1</SelectItem>
                    <SelectItem value="D2">Division 2</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="logoUrl">Logo URL (optional)</Label>
              <Input
                id="logoUrl"
                type="url"
                value={formData.logoUrl}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, logoUrl: e.target.value }))
                }
                placeholder="https://..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="officialUrl">Official Website (optional)</Label>
              <Input
                id="officialUrl"
                type="url"
                value={formData.officialUrl}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    officialUrl: e.target.value,
                  }))
                }
                placeholder="https://..."
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              <Save className="mr-2 h-4 w-4" />
              {loading ? "Saving..." : "Save Team"}
            </Button>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
