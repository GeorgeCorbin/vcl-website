import Link from "next/link";
import { format } from "date-fns";
import { Plus, Pencil, Trash2, Eye, EyeOff } from "lucide-react";
import prisma from "@/lib/db";
import { AdType } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { deleteAdUnit, toggleAdUnit } from "./actions";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdsManagementPage() {
  const ads = await prisma.adUnit.findMany({
    orderBy: { createdAt: "desc" },
  });

  const adTypeLabels: Record<AdType, string> = {
    DISPLAY: "Display",
    LEADERBOARD: "Leaderboard",
    SIDEBAR: "Sidebar",
    POPUP: "Popup",
    INLINE: "Inline",
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">Advertising</p>
          <h1 className="text-3xl font-bold tracking-tight">Ad Management</h1>
          <p className="text-muted-foreground">Manage display ads and ad placements across the site.</p>
        </div>
        <Link href="/admin/ads/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Ad Unit
          </Button>
        </Link>
      </div>

      <div className="rounded-3xl border border-border/50 bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Placement</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Updated</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {ads.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                  No ad units found. Create your first ad unit to get started.
                </TableCell>
              </TableRow>
            ) : (
              ads.map((ad) => (
                <TableRow key={ad.id}>
                  <TableCell className="font-medium">{ad.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{adTypeLabels[ad.adType]}</Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{ad.placement || "—"}</TableCell>
                  <TableCell>
                    <Badge variant={ad.enabled ? "default" : "secondary"}>
                      {ad.enabled ? "Active" : "Disabled"}
                    </Badge>
                  </TableCell>
                  <TableCell>{format(ad.updatedAt, "MMM d, yyyy")}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <form action={toggleAdUnit}>
                        <input type="hidden" name="id" value={ad.id} />
                        <input type="hidden" name="enabled" value={ad.enabled ? "false" : "true"} />
                        <Button
                          type="submit"
                          variant="ghost"
                          size="icon"
                          aria-label={ad.enabled ? "Disable ad" : "Enable ad"}
                        >
                          {ad.enabled ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                        </Button>
                      </form>
                      <Link href={`/admin/ads/${ad.id}`}>
                        <Button variant="ghost" size="icon">
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </Link>
                      <form action={deleteAdUnit}>
                        <input type="hidden" name="id" value={ad.id} />
                        <Button
                          type="submit"
                          variant="ghost"
                          size="icon"
                          className="text-red-500 hover:text-red-600"
                          aria-label={`Delete ${ad.name}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </form>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
        <h3 className="mb-2 text-sm font-medium text-blue-800">Ad Unit Types</h3>
        <ul className="space-y-1 text-sm text-blue-700">
          <li>• <strong>Display:</strong> Standard rectangular ads (300x250, 728x90, etc.)</li>
          <li>• <strong>Leaderboard:</strong> Wide banner ads at the top of pages (728x90, 970x90)</li>
          <li>• <strong>Sidebar:</strong> Vertical ads in sidebars (160x600, 300x600)</li>
          <li>• <strong>Popup:</strong> Bottom popup or overlay ads</li>
          <li>• <strong>Inline:</strong> Ads embedded within content</li>
        </ul>
      </div>
    </div>
  );
}
