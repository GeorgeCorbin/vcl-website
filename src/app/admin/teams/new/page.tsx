import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { createTeam } from "../actions";
import { DynamicTeamForm } from "./dynamic-team-form";
import { getActiveLeagues } from "@/lib/league-config";

export const dynamic = "force-dynamic";

export default async function NewTeamPage() {
  const leagues = await getActiveLeagues();

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

      <DynamicTeamForm leagues={leagues} formAction={createTeam} />
    </div>
  );
}
