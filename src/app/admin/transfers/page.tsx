import { redirect } from "next/navigation";
import { FEATURES } from "@/lib/feature-flags";
import Link from "next/link";
import { Plus, Pencil, Trash2, ArrowRight } from "lucide-react";
import prisma from "@/lib/db";
import { League } from "@prisma/client";
import { deleteTransfer } from "./actions";
import { getActiveLeagues } from "@/lib/league-config";

type PageProps = {
  searchParams: Promise<{ league?: string; confirmed?: string }>;
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function TransfersPage({ searchParams }: PageProps) {
  if (!FEATURES.TRANSFERS) redirect("/admin");

  const { league, confirmed } = await searchParams;
  const normalizedLeague = league?.toUpperCase() as League | undefined;
  const confirmedFilter = confirmed === "true" ? true : confirmed === "false" ? false : undefined;

  const [transfers, leagues] = await Promise.all([
    prisma.transfer.findMany({
      where: {
        ...(normalizedLeague && { league: normalizedLeague }),
        ...(confirmedFilter !== undefined && { confirmed: confirmedFilter }),
      },
      include: {
        fromTeam: { select: { name: true } },
        toTeam: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    getActiveLeagues(),
  ]);

  const confirmStatuses = [
    { label: "All Status", value: "" },
    { label: "Confirmed", value: "true" },
    { label: "Unconfirmed", value: "false" },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-border pb-6">
        <div>
          <h1 className="font-heading text-4xl tracking-wide text-foreground">Transfers</h1>
          <p className="text-sm text-muted-foreground mt-1">Track player transfers between teams across all leagues.</p>
        </div>
        <Link
          href="/admin/transfers/new"
          className="inline-flex items-center gap-2 rounded-sm bg-vcl-gold px-5 h-10 text-sm font-bold text-vcl-gold-foreground hover:bg-vcl-gold/90 transition-colors shrink-0"
        >
          <Plus className="h-4 w-4" />
          Add Transfer
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-1.5 flex-wrap">
          <Link
            href={`/admin/transfers${confirmed ? `?confirmed=${confirmed}` : ""}`}
            className={`rounded-sm px-3 h-8 flex items-center text-xs font-semibold transition-colors ${!normalizedLeague ? "bg-vcl-gold text-vcl-gold-foreground" : "border border-border text-muted-foreground hover:text-foreground"}`}
          >All Leagues</Link>
          {leagues.map((lg) => (
            <Link
              key={lg.id}
              href={`/admin/transfers?league=${lg.code}${confirmed ? `&confirmed=${confirmed}` : ""}`}
              className={`rounded-sm px-3 h-8 flex items-center text-xs font-semibold transition-colors ${normalizedLeague === lg.code ? "bg-vcl-gold text-vcl-gold-foreground" : "border border-border text-muted-foreground hover:text-foreground"}`}
            >{lg.code}</Link>
          ))}
        </div>
        <form className="flex items-center gap-2">
          {normalizedLeague && <input type="hidden" name="league" value={normalizedLeague} />}
          <select name="confirmed" defaultValue={confirmed ?? ""} className="rounded-sm border border-border bg-card px-3 h-8 text-xs text-foreground">
            {confirmStatuses.map((s) => (
              <option key={s.label} value={s.value}>{s.label}</option>
            ))}
          </select>
          <button type="submit" className="rounded-sm border border-border px-3 h-8 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors">Filter</button>
          {(normalizedLeague || confirmed) && (
            <Link href="/admin/transfers" className="text-xs text-muted-foreground hover:text-foreground">Reset</Link>
          )}
        </form>
      </div>

      {/* Table */}
      <div className="rounded-sm border border-border bg-card overflow-hidden">
        <div className="hidden lg:grid grid-cols-[180px_1fr_100px_120px_100px_120px_120px] items-center h-11 px-5 bg-secondary border-b border-border">
          {["Player","Transfer","League","Position","Class","Status","Actions"].map((h) => (
            <span key={h} className="text-[10px] font-bold tracking-[0.15em] text-muted-foreground uppercase">{h}</span>
          ))}
        </div>
        {transfers.length === 0 ? (
          <div className="py-16 text-center text-sm text-muted-foreground">No transfers found. Try another filter or add your first transfer.</div>
        ) : (
          <div className="divide-y divide-border">
            {transfers.map((transfer) => (
              <div key={transfer.id} className="grid grid-cols-1 lg:grid-cols-[180px_1fr_100px_120px_100px_120px_120px] items-center min-h-[56px] px-5 py-3 lg:py-0 hover:bg-accent transition-colors">
                <span className="text-sm font-semibold text-foreground">{transfer.playerName}</span>
                <div className="hidden lg:flex items-center gap-2 text-sm min-w-0">
                  <span className="text-muted-foreground truncate">{transfer.fromTeam?.name || "—"}</span>
                  <ArrowRight className="h-3.5 w-3.5 text-vcl-gold shrink-0" />
                  <span className="font-medium text-foreground truncate">{transfer.toTeam?.name || "—"}</span>
                </div>
                <span className="hidden lg:block">
                  <span className="rounded-sm bg-vcl-gold px-2 py-0.5 text-[10px] font-bold tracking-widest text-vcl-gold-foreground uppercase">{transfer.league}</span>
                </span>
                <span className="hidden lg:block text-xs text-muted-foreground">{transfer.position || "—"}</span>
                <span className="hidden lg:block text-xs text-muted-foreground">{transfer.classYear || "—"}</span>
                <span className="hidden lg:block">
                  <span className={`rounded-sm px-2 py-0.5 text-[10px] font-bold tracking-widest uppercase ${transfer.confirmed ? "bg-vcl-gold text-vcl-gold-foreground" : "border border-border text-muted-foreground"}`}>
                    {transfer.confirmed ? "Confirmed" : "Unconfirmed"}
                  </span>
                </span>
                <div className="flex items-center gap-1.5 mt-2 lg:mt-0">
                  <Link href={`/admin/transfers/${transfer.id}`} className="inline-flex items-center gap-1.5 rounded-sm border border-border px-2.5 py-1.5 text-xs font-semibold text-muted-foreground hover:border-vcl-gold/40 hover:text-vcl-gold transition-colors">
                    <Pencil className="h-3 w-3" /> Edit
                  </Link>
                  <form action={deleteTransfer}>
                    <input type="hidden" name="id" value={transfer.id} />
                    <button type="submit" className="inline-flex items-center gap-1.5 rounded-sm border border-border px-2.5 py-1.5 text-xs font-semibold text-muted-foreground hover:border-red-500/40 hover:text-red-400 transition-colors">
                      <Trash2 className="h-3 w-3" /> Delete
                    </button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
