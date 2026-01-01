import { notFound } from "next/navigation";
import prisma from "@/lib/db";
import EditLeagueClient from "./edit-league-client";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditLeaguePage({ params }: PageProps) {
  const { id } = await params;

  const league = await prisma.leagueConfig.findUnique({
    where: { id },
  });

  if (!league) {
    notFound();
  }

  const [conferences, divisions] = await Promise.all([
    prisma.conference.findMany({
      where: { leagueConfigId: league.id },
      orderBy: { name: "asc" },
      include: {
        regions: {
          orderBy: { name: "asc" },
        },
      },
    }),
    prisma.leagueDivision.findMany({
      where: { leagueConfigId: league.id },
      orderBy: { displayOrder: "asc" },
    }),
  ]);

  return (
    <EditLeagueClient 
      league={league}
      conferences={conferences}
      divisions={divisions}
    />
  );
}
