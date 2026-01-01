import { notFound } from "next/navigation";
import prisma from "@/lib/db";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { getActiveLeagues } from "@/lib/league-config";
import { updateTeam } from "../actions";
import { DynamicTeamForm } from "../new/dynamic-team-form";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditTeamPage({ params }: PageProps) {
  const { id } = await params;
  const [team, leagues] = await Promise.all([
    prisma.team.findUnique({
      where: { id },
    }),
    getActiveLeagues(),
  ]);

  if (!team) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/teams">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Team</h1>
          <p className="text-muted-foreground">Update team information.</p>
        </div>
      </div>

      <DynamicTeamForm leagues={leagues} team={team} formAction={updateTeam} />
    </div>
  );
}
