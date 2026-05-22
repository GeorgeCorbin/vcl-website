import { redirect } from "next/navigation";
import { FEATURES } from "@/lib/feature-flags";
import Link from "next/link";
import { format } from "date-fns";
import { Plus, Pencil, Trash2, Eye, EyeOff, Info } from "lucide-react";
import prisma from "@/lib/db";
import { AdType } from "@prisma/client";
import { deleteAdUnit, toggleAdUnit } from "./actions";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdsManagementPage() {
  if (!FEATURES.ADS_ADMIN) redirect("/admin");

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
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-border pb-6">
        <div>
          <h1 className="font-heading text-4xl tracking-wide text-foreground">Ad Units</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage display ads and ad placements across the site.</p>
        </div>
        <Link
          href="/admin/ads/new"
          className="inline-flex items-center gap-2 rounded-sm bg-vcl-gold px-5 h-10 text-sm font-bold text-vcl-gold-foreground hover:bg-vcl-gold/90 transition-colors shrink-0"
        >
          <Plus className="h-4 w-4" />
          New Ad Unit
        </Link>
      </div>

      {/* Info banner */}
      <div className="flex items-start gap-3 rounded-sm border border-vcl-gold/30 bg-vcl-gold/5 p-4">
        <Info className="h-4 w-4 text-vcl-gold shrink-0 mt-0.5" />
        <p className="text-sm text-muted-foreground leading-relaxed">
          Public ad placements are managed in code. Use this panel to configure ad units, sizes, and targeting.
        </p>
      </div>

      {/* Table */}
      <div className="rounded-sm border border-border bg-card overflow-hidden">
        <div className="hidden lg:grid grid-cols-[1fr_140px_180px_100px_140px_120px] items-center h-11 px-5 bg-secondary border-b border-border">
          {["Name","Size","Placement","Status","Updated","Actions"].map((h) => (
            <span key={h} className="text-[10px] font-bold tracking-[0.15em] text-muted-foreground uppercase">{h}</span>
          ))}
        </div>
        {ads.length === 0 ? (
          <div className="py-16 text-center text-sm text-muted-foreground">No ad units found. Create your first ad unit to get started.</div>
        ) : (
          <div className="divide-y divide-border">
            {ads.map((ad) => (
              <div key={ad.id} className="grid grid-cols-1 lg:grid-cols-[1fr_140px_180px_100px_140px_120px] items-center min-h-[52px] px-5 py-3 lg:py-0 hover:bg-accent transition-colors">
                <span className="text-sm font-medium text-foreground">{ad.name}</span>
                <span className="hidden lg:block text-xs text-muted-foreground">{adTypeLabels[ad.adType]}</span>
                <span className="hidden lg:block text-xs text-muted-foreground">{ad.placement || "—"}</span>
                <span className="hidden lg:block">
                  <span className={`rounded-sm px-2 py-0.5 text-[10px] font-bold tracking-widest uppercase ${
                    ad.enabled ? "bg-vcl-gold text-vcl-gold-foreground" : "border border-border text-muted-foreground"
                  }`}>{ad.enabled ? "Active" : "Disabled"}</span>
                </span>
                <span className="hidden lg:block text-xs text-muted-foreground">{format(ad.updatedAt, "MMM d, yyyy")}</span>
                <div className="flex items-center gap-1.5 mt-2 lg:mt-0">
                  <form action={toggleAdUnit}>
                    <input type="hidden" name="id" value={ad.id} />
                    <input type="hidden" name="enabled" value={ad.enabled ? "false" : "true"} />
                    <button type="submit" className="inline-flex items-center gap-1 rounded-sm border border-border px-2.5 py-1.5 text-xs font-semibold text-muted-foreground hover:border-vcl-gold/40 hover:text-vcl-gold transition-colors">
                      {ad.enabled ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                      {ad.enabled ? "Disable" : "Enable"}
                    </button>
                  </form>
                  <Link href={`/admin/ads/${ad.id}`} className="inline-flex items-center gap-1 rounded-sm border border-border px-2.5 py-1.5 text-xs font-semibold text-muted-foreground hover:border-vcl-gold/40 hover:text-vcl-gold transition-colors">
                    <Pencil className="h-3 w-3" /> Edit
                  </Link>
                  <form action={deleteAdUnit}>
                    <input type="hidden" name="id" value={ad.id} />
                    <button type="submit" className="inline-flex items-center gap-1 rounded-sm border border-border px-2.5 py-1.5 text-xs font-semibold text-muted-foreground hover:border-red-500/40 hover:text-red-400 transition-colors" aria-label={`Delete ${ad.name}`}>
                      <Trash2 className="h-3 w-3" /> Delete
                    </button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Tips */}
      <div className="rounded-sm border border-border bg-card p-4">
        <h3 className="mb-2 text-[10px] font-bold tracking-[0.15em] text-muted-foreground uppercase">Ad Unit Types</h3>
        <ul className="space-y-1 text-sm text-muted-foreground">
          <li>• <strong className="text-foreground">Display:</strong> Standard rectangular ads (300×250, 728×90)</li>
          <li>• <strong className="text-foreground">Leaderboard:</strong> Wide banner ads at the top of pages (728×90, 970×90)</li>
          <li>• <strong className="text-foreground">Sidebar:</strong> Vertical ads in sidebars (160×600, 300×600)</li>
          <li>• <strong className="text-foreground">Popup:</strong> Bottom popup or overlay ads</li>
          <li>• <strong className="text-foreground">Inline:</strong> Ads embedded within content</li>
        </ul>
      </div>
    </div>
  );
}
