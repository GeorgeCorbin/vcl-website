import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { getActiveLeagues } from "@/lib/league-config";
import PollForm from "./poll-form";

export const dynamic = "force-dynamic";

export default async function NewPollWeekPage() {
  const leagues = await getActiveLeagues();
  const currentYear = new Date().getFullYear();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/polls">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">New Poll Week</h1>
          <p className="text-muted-foreground">
            Create a new weekly media poll.
          </p>
        </div>
      </div>

      <PollForm leagues={leagues} currentYear={currentYear} />
    </div>
  );
}
