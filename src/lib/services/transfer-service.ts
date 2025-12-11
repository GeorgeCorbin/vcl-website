import prisma from "@/lib/db";
import { Prisma } from "@prisma/client";

export type TransferWithTeams = Prisma.TransferGetPayload<{
  include: { fromTeam: true; toTeam: true };
}>;

export class TransferService {
  static async list(options?: {
    confirmed?: boolean;
    teamId?: string;
    limit?: number;
    offset?: number;
  }) {
    const { confirmed, teamId, limit = 50, offset = 0 } = options || {};

    return prisma.transfer.findMany({
      where: {
        ...(confirmed !== undefined && { confirmed }),
        ...(teamId && {
          OR: [{ fromTeamId: teamId }, { toTeamId: teamId }],
        }),
      },
      include: {
        fromTeam: true,
        toTeam: true,
      },
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: offset,
    });
  }

  static async getById(id: string) {
    return prisma.transfer.findUnique({
      where: { id },
      include: {
        fromTeam: true,
        toTeam: true,
      },
    });
  }

  static async create(data: {
    playerName: string;
    fromTeamId?: string;
    toTeamId?: string;
    position?: string;
    classYear?: string;
    notes?: string;
    confirmed?: boolean;
  }) {
    return prisma.transfer.create({
      data,
      include: { fromTeam: true, toTeam: true },
    });
  }

  static async update(
    id: string,
    data: {
      playerName?: string;
      fromTeamId?: string | null;
      toTeamId?: string | null;
      position?: string;
      classYear?: string;
      notes?: string;
      confirmed?: boolean;
    }
  ) {
    return prisma.transfer.update({
      where: { id },
      data,
      include: { fromTeam: true, toTeam: true },
    });
  }

  static async delete(id: string) {
    return prisma.transfer.delete({ where: { id } });
  }

  static async confirm(id: string) {
    return prisma.transfer.update({
      where: { id },
      data: { confirmed: true },
      include: { fromTeam: true, toTeam: true },
    });
  }

  static async unconfirm(id: string) {
    return prisma.transfer.update({
      where: { id },
      data: { confirmed: false },
      include: { fromTeam: true, toTeam: true },
    });
  }

  static async getRecentConfirmed(limit = 10) {
    return prisma.transfer.findMany({
      where: { confirmed: true },
      include: { fromTeam: true, toTeam: true },
      orderBy: { createdAt: "desc" },
      take: limit,
    });
  }
}
