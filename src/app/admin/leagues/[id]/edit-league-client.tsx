"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Save, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { 
  updateLeagueConfig, 
  addConference, 
  deleteConference,
  toggleDivision,
  addRegion,
  deleteRegion
} from "../actions";

type Conference = {
  id: string;
  name: string;
  code: string | null;
  regions: {
    id: string;
    name: string;
    code: string | null;
  }[];
};

type Division = {
  id: string;
  name: string;
  code: string;
  displayOrder: number;
};

type League = {
  id: string;
  name: string;
  code: string;
  active: boolean;
};

type Props = {
  league: League;
  conferences: Conference[];
  divisions: Division[];
};

export default function EditLeagueClient({ league, conferences, divisions }: Props) {
  const hasDivision1 = divisions.some(d => d.code === "D1");
  const hasDivision2 = divisions.some(d => d.code === "D2");
  const hasDivision3 = divisions.some(d => d.code === "D3");

  const handleDivisionToggle = async (divisionCode: string, checked: boolean) => {
    const formData = new FormData();
    formData.set("leagueConfigId", league.id);
    formData.set("divisionCode", divisionCode);
    formData.set("checked", checked.toString());
    await toggleDivision(formData);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Link href="/admin/leagues">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit League</h1>
          <p className="text-muted-foreground">Update league settings and manage conferences.</p>
        </div>
      </div>

      <div className="space-y-8">
        {/* League Settings */}
        <form action={updateLeagueConfig}>
          <input type="hidden" name="id" value={league.id} />
          <Card>
            <CardHeader>
              <CardTitle>League Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">League Name</Label>
                <Input
                  id="name"
                  name="name"
                  defaultValue={league.name}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="code">League Code</Label>
                <Input
                  id="code"
                  name="code"
                  defaultValue={league.code}
                  maxLength={10}
                  required
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="active"
                  name="active"
                  defaultChecked={league.active}
                  className="h-4 w-4 rounded border-border"
                />
                <Label htmlFor="active">Active league</Label>
              </div>

              <Button type="submit" className="w-full">
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </Button>
            </CardContent>
          </Card>
        </form>

        {/* Divisions and Conferences */}
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Divisions */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Divisions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">Select which divisions this league has:</p>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="division1"
                      checked={hasDivision1}
                      onChange={(e) => handleDivisionToggle("D1", e.target.checked)}
                      className="h-4 w-4 rounded border-border"
                    />
                    <Label htmlFor="division1" className="cursor-pointer">
                      <span className="font-medium">Division 1</span>
                      <Badge variant="outline" className="ml-2 text-xs">D1</Badge>
                    </Label>
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="division2"
                      checked={hasDivision2}
                      onChange={(e) => handleDivisionToggle("D2", e.target.checked)}
                      className="h-4 w-4 rounded border-border"
                    />
                    <Label htmlFor="division2" className="cursor-pointer">
                      <span className="font-medium">Division 2</span>
                      <Badge variant="outline" className="ml-2 text-xs">D2</Badge>
                    </Label>
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="division3"
                      checked={hasDivision3}
                      onChange={(e) => handleDivisionToggle("D3", e.target.checked)}
                      className="h-4 w-4 rounded border-border"
                    />
                    <Label htmlFor="division3" className="cursor-pointer">
                      <span className="font-medium">Division 3</span>
                      <Badge variant="outline" className="ml-2 text-xs">D3</Badge>
                    </Label>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Conferences */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Conferences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {conferences.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No conferences added yet.</p>
                ) : (
                  <div className="space-y-3">
                    {conferences.map((conf) => (
                      <div key={conf.id} className="rounded-lg border border-border/50 p-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{conf.name}</p>
                            {conf.code && (
                              <Badge variant="outline" className="mt-1 text-xs">
                                {conf.code}
                              </Badge>
                            )}
                          </div>
                          <form action={deleteConference}>
                            <input type="hidden" name="id" value={conf.id} />
                            <input type="hidden" name="leagueConfigId" value={league.id} />
                            <Button
                              type="submit"
                              variant="ghost"
                              size="icon"
                              className="text-red-500 hover:text-red-600"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </form>
                        </div>
                        
                        {/* Regions */}
                        {conf.regions.length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-1 border-t border-border/30 pt-2">
                            <span className="text-xs text-muted-foreground">Regions:</span>
                            {conf.regions.map((region) => (
                              <div key={region.id} className="group relative">
                                <Badge variant="secondary" className="text-xs">
                                  {region.name}
                                </Badge>
                                <form action={deleteRegion} className="inline">
                                  <input type="hidden" name="id" value={region.id} />
                                  <input type="hidden" name="leagueConfigId" value={league.id} />
                                  <button
                                    type="submit"
                                    className="ml-1 text-red-500 opacity-0 transition group-hover:opacity-100"
                                  >
                                    ×
                                  </button>
                                </form>
                              </div>
                            ))}
                          </div>
                        )}
                        
                        {/* Add Region Form */}
                        <details className="mt-2">
                          <summary className="cursor-pointer text-xs text-muted-foreground hover:text-foreground">
                            + Add Region
                          </summary>
                          <form action={addRegion} className="mt-2 flex gap-2">
                            <input type="hidden" name="conferenceId" value={conf.id} />
                            <input type="hidden" name="leagueConfigId" value={league.id} />
                            <Input
                              name="name"
                              placeholder="Region name"
                              className="h-8 text-xs"
                              required
                            />
                            <Input
                              name="code"
                              placeholder="Code (opt)"
                              className="h-8 w-20 text-xs"
                            />
                            <Button type="submit" size="sm" className="h-8">
                              Add
                            </Button>
                          </form>
                        </details>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Add Conference</CardTitle>
              </CardHeader>
              <CardContent>
                <form action={addConference} className="space-y-4">
                  <input type="hidden" name="leagueConfigId" value={league.id} />
                  <div className="space-y-2">
                    <Label htmlFor="confName">Conference Name</Label>
                    <Input
                      id="confName"
                      name="name"
                      placeholder="e.g., Rocky Mountain Lacrosse Conference"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confCode">Conference Code (optional)</Label>
                    <Input
                      id="confCode"
                      name="code"
                      placeholder="e.g., RMLC"
                      maxLength={10}
                    />
                  </div>
                  <Button type="submit" className="w-full">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Conference
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
