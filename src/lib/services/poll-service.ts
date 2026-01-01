import prisma from "@/lib/db";
import { League, PollStatus, Prisma } from "@prisma/client";

export type PollWeekWithEntries = Prisma.PollWeekGetPayload<{
  include: { entries: { include: { team: true } } };
}>;

export class PollService {
  static async listPollWeeks(options?: {
    season?: string;
    status?: PollStatus;
    limit?: number;
    offset?: number;
  }) {
    const { season, status, limit = 20, offset = 0 } = options || {};

    return prisma.pollWeek.findMany({
      where: {
        ...(season && { season }),
        ...(status && { status }),
      },
      include: {
        entries: {
          include: { team: true },
          orderBy: { rank: "asc" },
        },
      },
      orderBy: [{ season: "desc" }, { weekNumber: "desc" }],
      take: limit,
      skip: offset,
    });
  }

  static async getByLeagueSeasonWeek(league: League, season: string, weekNumber: number) {
    return prisma.pollWeek.findFirst({
      where: { league, season, weekNumber },
      include: {
        entries: {
          include: { team: true },
          orderBy: { rank: "asc" },
        },
      },
    });
  }

  static async getLatestPublished() {
    return prisma.pollWeek.findFirst({
      where: { status: "PUBLISHED" },
      include: {
        entries: {
          include: { team: true },
          orderBy: { rank: "asc" },
        },
      },
      orderBy: [{ season: "desc" }, { weekNumber: "desc" }],
    });
  }

  static async getById(id: string) {
    return prisma.pollWeek.findUnique({
      where: { id },
      include: {
        entries: {
          include: { team: true },
          orderBy: { rank: "asc" },
        },
      },
    });
  }

  static async createPollWeek(data: {
    weekNumber: number;
    season: string;
    notes?: string;
  }) {
    return prisma.pollWeek.create({
      data,
      include: { entries: { include: { team: true } } },
    });
  }

  static async updatePollWeek(
    id: string,
    data: {
      weekNumber?: number;
      season?: string;
      notes?: string;
      status?: PollStatus;
      publishedAt?: Date | null;
    }
  ) {
    return prisma.pollWeek.update({
      where: { id },
      data,
      include: { entries: { include: { team: true } } },
    });
  }

  static async deletePollWeek(id: string) {
    return prisma.pollWeek.delete({ where: { id } });
  }

  static async publishPollWeek(id: string) {
    return prisma.pollWeek.update({
      where: { id },
      data: {
        status: "PUBLISHED",
        publishedAt: new Date(),
      },
    });
  }

  static async unpublishPollWeek(id: string) {
    return prisma.pollWeek.update({
      where: { id },
      data: {
        status: "DRAFT",
        publishedAt: null,
      },
    });
  }

  // Poll Entries
  static async addEntry(data: {
    pollWeekId: string;
    teamId: string;
    rank: number;
    previousRank?: number;
    points?: number;
    note?: string;
  }) {
    return prisma.pollEntry.create({
      data,
      include: { team: true },
    });
  }

  static async updateEntry(
    id: string,
    data: {
      rank?: number;
      previousRank?: number;
      points?: number;
      note?: string;
    }
  ) {
    return prisma.pollEntry.update({
      where: { id },
      data,
      include: { team: true },
    });
  }

  static async deleteEntry(id: string) {
    return prisma.pollEntry.delete({ where: { id } });
  }

  static async setEntries(
    pollWeekId: string,
    entries: Array<{
      teamId: string;
      rank: number;
      previousRank?: number;
      points?: number;
      note?: string;
    }>
  ) {
    // Delete existing entries and create new ones in a transaction
    return prisma.$transaction([
      prisma.pollEntry.deleteMany({ where: { pollWeekId } }),
      ...entries.map((entry) =>
        prisma.pollEntry.create({
          data: { ...entry, pollWeekId },
        })
      ),
    ]);
  }

  static async getSeasons() {
    const polls = await prisma.pollWeek.findMany({
      select: { season: true },
      distinct: ["season"],
      orderBy: { season: "desc" },
    });
    return polls.map((p) => p.season);
  }
}
