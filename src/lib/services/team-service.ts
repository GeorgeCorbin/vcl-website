import prisma from "@/lib/db";
import { Division, Prisma } from "@prisma/client";

export type TeamWithRelations = Prisma.TeamGetPayload<{
  include: { pollEntries: true };
}>;

export class TeamService {
  static async list(options?: {
    conference?: string;
    division?: Division;
    active?: boolean;
    limit?: number;
    offset?: number;
  }) {
    const { conference, division, active = true, limit = 100, offset = 0 } = options || {};

    return prisma.team.findMany({
      where: {
        ...(conference && { conference }),
        ...(division && { division }),
        ...(active !== undefined && { active }),
      },
      orderBy: { name: "asc" },
      take: limit,
      skip: offset,
    });
  }

  static async getById(id: string) {
    return prisma.team.findUnique({
      where: { id },
    });
  }

  static async getByMclaId(mclaTeamId: string) {
    return prisma.team.findUnique({
      where: { mclaTeamId },
    });
  }

  static async create(data: {
    name: string;
    shortName?: string;
    conference?: string;
    division?: Division;
    logoUrl?: string;
    officialUrl?: string;
    mclaTeamId?: string;
  }) {
    return prisma.team.create({ data });
  }

  static async update(
    id: string,
    data: {
      name?: string;
      shortName?: string;
      conference?: string;
      division?: Division;
      logoUrl?: string;
      officialUrl?: string;
      active?: boolean;
      mclaTeamId?: string;
    }
  ) {
    return prisma.team.update({
      where: { id },
      data,
    });
  }

  static async delete(id: string) {
    return prisma.team.delete({ where: { id } });
  }

  // Future: Sync from MCLA API
  static async syncFromMclaApi() {
    // This will be implemented when MCLA API access is available
    // const teamsFromApi = await mclaClient.getTeams();
    // for (const apiTeam of teamsFromApi) {
    //   await prisma.team.upsert({
    //     where: { mclaTeamId: apiTeam.id },
    //     create: { ...mapApiTeamToDb(apiTeam), syncedFromMcla: true },
    //     update: { ...mapApiTeamToDb(apiTeam), syncedFromMcla: true },
    //   });
    // }
    throw new Error("MCLA API sync not yet implemented");
  }

  static async getConferences() {
    const teams = await prisma.team.findMany({
      where: { active: true },
      select: { conference: true },
      distinct: ["conference"],
    });
    return teams.map((t) => t.conference).filter(Boolean) as string[];
  }
}
