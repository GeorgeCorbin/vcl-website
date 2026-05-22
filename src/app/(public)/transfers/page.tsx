import { redirect } from "next/navigation";
import { FEATURES } from "@/lib/feature-flags";
import Link from "next/link";
import prisma from "@/lib/db";
import { TransfersClient } from "./transfers-client";

export const dynamic = "force-dynamic";

export default async function TransfersPage() {
  if (!FEATURES.TRANSFERS) redirect("/");

  const transfers = await prisma.transfer.findMany({
    include: { fromTeam: true, toTeam: true },
    orderBy: { createdAt: "desc" },
    take: 50,
  }).catch(() => []);

  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="border-b border-border bg-secondary">
        <div className="mx-auto max-w-[1440px] px-6 py-10 md:px-12 md:py-12">
          <nav className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
            <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
            <span>/</span>
            <span className="text-foreground">Transfers</span>
          </nav>
          <h1 className="font-heading text-6xl lg:text-[64px] tracking-wide text-foreground leading-none">TRANSFER TRACKER</h1>
          <p className="mt-3 text-sm text-muted-foreground max-w-xl">
            Track player movements between programs across all club lacrosse leagues.
          </p>
        </div>
      </div>

      <TransfersClient transfers={transfers} />
    </div>
  );
}
