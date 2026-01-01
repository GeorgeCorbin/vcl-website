"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Save, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { createLeagueConfig } from "../actions";

type Conference = {
  id: string;
  name: string;
  code: string;
  regions: Region[];
};

type Region = {
  id: string;
  name: string;
  code: string;
};

export default function NewLeaguePage() {
  const [conferences, setConferences] = useState<Conference[]>([]);
  const [selectedDivisions, setSelectedDivisions] = useState({
    division1: false,
    division2: false,
    division3: false,
  });
  const [newConf, setNewConf] = useState({ name: "", code: "" });
  const [newRegion, setNewRegion] = useState<{ [key: string]: { name: string; code: string } }>({});

  const addConference = () => {
    if (!newConf.name.trim()) return;
    setConferences([...conferences, {
      id: crypto.randomUUID(),
      name: newConf.name.trim(),
      code: newConf.code.trim().toUpperCase(),
      regions: [],
    }]);
    setNewConf({ name: "", code: "" });
  };

  const removeConference = (id: string) => {
    setConferences(conferences.filter(c => c.id !== id));
  };

  const addRegion = (confId: string) => {
    const regionData = newRegion[confId];
    if (!regionData?.name.trim()) return;
    
    setConferences(conferences.map(conf => {
      if (conf.id === confId) {
        return {
          ...conf,
          regions: [...conf.regions, {
            id: crypto.randomUUID(),
            name: regionData.name.trim(),
            code: regionData.code.trim(),
          }],
        };
      }
      return conf;
    }));
    
    setNewRegion({ ...newRegion, [confId]: { name: "", code: "" } });
  };

  const removeRegion = (confId: string, regionId: string) => {
    setConferences(conferences.map(conf => {
      if (conf.id === confId) {
        return {
          ...conf,
          regions: conf.regions.filter(r => r.id !== regionId),
        };
      }
      return conf;
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    // Add conferences as JSON
    const conferencesData = conferences.map(({ name, code, regions }) => ({
      name,
      code: code || undefined,
      regions: regions.map(({ name, code }) => ({ name, code: code || undefined })),
    }));
    
    // Build divisions array from checkboxes
    const divisionsData = [];
    if (selectedDivisions.division1) {
      divisionsData.push({ name: "Division 1", code: "D1", displayOrder: 0 });
    }
    if (selectedDivisions.division2) {
      divisionsData.push({ name: "Division 2", code: "D2", displayOrder: 1 });
    }
    if (selectedDivisions.division3) {
      divisionsData.push({ name: "Division 3", code: "D3", displayOrder: 2 });
    }
    
    formData.set("conferences", JSON.stringify(conferencesData));
    formData.set("divisions", JSON.stringify(divisionsData));
    
    await createLeagueConfig(formData);
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
          <h1 className="text-3xl font-bold tracking-tight">Add League</h1>
          <p className="text-muted-foreground">Create a new league configuration with conferences and divisions.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <Card className="max-w-xl">
          <CardHeader>
            <CardTitle>League Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">League Name</Label>
              <Input
                id="name"
                name="name"
                placeholder="e.g., Men's Collegiate Lacrosse Association"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="code">League Code</Label>
              <Input
                id="code"
                name="code"
                placeholder="e.g., MCLA"
                maxLength={10}
                required
              />
              <p className="text-xs text-muted-foreground">
                Short code used throughout the system (will be converted to uppercase)
              </p>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="active"
                name="active"
                defaultChecked
                className="h-4 w-4 rounded border-border"
              />
              <Label htmlFor="active">Active league</Label>
            </div>
          </CardContent>
        </Card>

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
                      checked={selectedDivisions.division1}
                      onChange={(e) => setSelectedDivisions({ ...selectedDivisions, division1: e.target.checked })}
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
                      checked={selectedDivisions.division2}
                      onChange={(e) => setSelectedDivisions({ ...selectedDivisions, division2: e.target.checked })}
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
                      checked={selectedDivisions.division3}
                      onChange={(e) => setSelectedDivisions({ ...selectedDivisions, division3: e.target.checked })}
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
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeConference(conf.id)}
                            className="text-red-500 hover:text-red-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
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
                                <button
                                  type="button"
                                  onClick={() => removeRegion(conf.id, region.id)}
                                  className="ml-1 text-red-500 opacity-0 transition group-hover:opacity-100"
                                >
                                  ×
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                        
                        {/* Add Region Form */}
                        <details className="mt-2">
                          <summary className="cursor-pointer text-xs text-muted-foreground hover:text-foreground">
                            + Add Region
                          </summary>
                          <div className="mt-2 flex gap-2">
                            <Input
                              value={newRegion[conf.id]?.name || ""}
                              onChange={(e) => setNewRegion({
                                ...newRegion,
                                [conf.id]: { ...newRegion[conf.id], name: e.target.value },
                              })}
                              placeholder="Region name"
                              className="h-8 text-xs"
                            />
                            <Input
                              value={newRegion[conf.id]?.code || ""}
                              onChange={(e) => setNewRegion({
                                ...newRegion,
                                [conf.id]: { ...newRegion[conf.id], code: e.target.value },
                              })}
                              placeholder="Code (opt)"
                              className="h-8 w-20 text-xs"
                            />
                            <Button type="button" onClick={() => addRegion(conf.id)} size="sm" className="h-8">
                              Add
                            </Button>
                          </div>
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
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="confName">Conference Name</Label>
                    <Input
                      id="confName"
                      value={newConf.name}
                      onChange={(e) => setNewConf({ ...newConf, name: e.target.value })}
                      placeholder="e.g., Rocky Mountain Lacrosse Conference"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confCode">Conference Code (optional)</Label>
                    <Input
                      id="confCode"
                      value={newConf.code}
                      onChange={(e) => setNewConf({ ...newConf, code: e.target.value })}
                      placeholder="e.g., RMLC"
                      maxLength={10}
                    />
                  </div>
                  <Button type="button" onClick={addConference} className="w-full">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Conference
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Submit Buttons */}
        <Card className="max-w-xl">
          <CardContent className="pt-6">
            <div className="flex gap-4">
              <Button type="button" variant="outline" asChild className="flex-1">
                <Link href="/admin/leagues">Cancel</Link>
              </Button>
              <Button type="submit" className="flex-1">
                <Save className="mr-2 h-4 w-4" />
                Create League
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
