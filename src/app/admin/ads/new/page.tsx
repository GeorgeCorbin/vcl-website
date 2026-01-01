import { createAdUnit } from "../actions";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function NewAdUnitPage() {
  const adTypes = [
    { label: "Display", value: "DISPLAY" },
    { label: "Leaderboard", value: "LEADERBOARD" },
    { label: "Sidebar", value: "SIDEBAR" },
    { label: "Popup", value: "POPUP" },
    { label: "Inline", value: "INLINE" },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Link href="/admin/ads">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">Advertising</p>
          <h1 className="text-3xl font-bold tracking-tight">New Ad Unit</h1>
        </div>
      </div>

      <form action={createAdUnit} className="max-w-2xl space-y-6">
        <section className="rounded-3xl border border-border/50 bg-card p-6 shadow-sm space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Ad Name</Label>
              <Input id="name" name="name" placeholder="e.g., Homepage Leaderboard" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="adType">Ad Type</Label>
              <select
                id="adType"
                name="adType"
                required
                className="w-full rounded-lg border border-border/60 bg-background px-3 py-2"
              >
                {adTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="placement">Placement (optional)</Label>
            <Input id="placement" name="placement" placeholder="e.g., Above the fold, Sidebar right" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Input id="description" name="description" placeholder="Brief description of this ad unit" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="code">Ad Code</Label>
            <Textarea
              id="code"
              name="code"
              rows={8}
              className="font-mono text-sm"
              placeholder="Paste your ad code here (HTML, JavaScript, etc.)"
              required
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="enabled"
              name="enabled"
              defaultChecked
              className="h-4 w-4 rounded border-border"
            />
            <Label htmlFor="enabled">Enable this ad unit</Label>
          </div>
        </section>

        <div className="flex gap-4">
          <Button type="button" variant="outline" asChild>
            <Link href="/admin/ads">Cancel</Link>
          </Button>
          <Button type="submit">Create Ad Unit</Button>
        </div>
      </form>
    </div>
  );
}
