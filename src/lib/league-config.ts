"use server";

import prisma from "@/lib/db";
import { Conference, ConferenceRegion, LeagueConfig, LeagueDivision } from "@prisma/client";

export async function getActiveLeagues() {
  return await prisma.leagueConfig.findMany({
    where: { active: true },
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      code: true,
    },
  });
}

type LeagueWithRelations = LeagueConfig & {
  conferences: (Conference & { regions: ConferenceRegion[] })[];
  divisions: LeagueDivision[];
};

export async function getLeagueWithConferences(leagueCode: string): Promise<LeagueWithRelations | null> {
  const league = await prisma.leagueConfig.findUnique({
    where: { code: leagueCode },
  });

  if (!league) {
    return null;
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

  return {
    ...league,
    conferences,
    divisions,
  };
}

export async function getConferencesForLeague(leagueCode: string) {
  const league = await prisma.leagueConfig.findUnique({
    where: { code: leagueCode },
    select: { id: true },
  });

  if (!league) {
    return [];
  }

  return prisma.conference.findMany({
    where: { leagueConfigId: league.id },
    orderBy: { name: "asc" },
  });
}

export async function getDivisionsForLeague(leagueCode: string) {
  const league = await prisma.leagueConfig.findUnique({
    where: { code: leagueCode },
    select: { id: true },
  });

  if (!league) {
    return [];
  }

  return prisma.leagueDivision.findMany({
    where: { leagueConfigId: league.id },
    orderBy: { displayOrder: "asc" },
  });
}

export async function getRegionsForConference(conferenceId: string) {
  return prisma.conferenceRegion.findMany({
    where: { conferenceId },
    orderBy: { name: "asc" },
  });
}
