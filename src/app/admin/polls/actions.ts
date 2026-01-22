"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import prisma from "@/lib/db";
import { League, PollStatus } from "@prisma/client";

export type PollActionState = {
  error: string | null;
};

type PollEntryInput = {
  teamId: string;
  rank: number;
  previousRank: number | null;
  points: number | null;
  note: string | null;
};

export async function createPollWeek(_prevState: PollActionState, formData: FormData): Promise<PollActionState> {
  const weekNumber = parseInt(formData.get("weekNumber") as string);
  const season = (formData.get("season") as string).trim();
  const league = (formData.get("league") as string) as League;
  const division = (formData.get("division") as string)?.trim() || null;
  const notes = (formData.get("notes") as string)?.trim() || null;
  const status = (formData.get("status") as string) as PollStatus;

  // Check if a poll already exists for this week number, league, and division
  const existing = await prisma.pollWeek.findFirst({
    where: {
      weekNumber,
      season,
      league,
      division,
    },
  });

  if (existing) {
    const divisionText = division ? ` ${division}` : "";
    return {
      error: `A poll for Week ${weekNumber} already exists for ${league}${divisionText} ${season}. Please use a different week number or edit the existing poll.`,
    };
  }

  const pollWeek = await prisma.pollWeek.create({
    data: {
      weekNumber,
      season,
      league,
      division,
      notes,
      status,
      publishedAt: null,
    },
  });

  revalidatePath("/admin/polls");
  redirect(`/admin/polls/${pollWeek.id}`);

  return { error: null };
}

export async function updatePollWeek(formData: FormData) {
  const id = formData.get("id") as string;
  const weekNumber = parseInt(formData.get("weekNumber") as string);
  const season = (formData.get("season") as string).trim();
  const league = (formData.get("league") as string) as League;
  const division = (formData.get("division") as string)?.trim() || null;
  const notes = (formData.get("notes") as string)?.trim() || null;
  const status = (formData.get("status") as string) as PollStatus;

  const existing = await prisma.pollWeek.findUnique({
    where: { id },
    select: { publishedAt: true },
  });

  await prisma.pollWeek.update({
    where: { id },
    data: {
      weekNumber,
      season,
      league,
      division,
      notes,
      status,
      publishedAt:
        status === "PUBLISHED"
          ? existing?.publishedAt ?? new Date()
          : null,
    },
  });

  revalidatePath("/admin/polls");
  redirect("/admin/polls");
}

export async function deletePollWeek(formData: FormData) {
  const id = formData.get("id") as string;
  if (!id) return;

  await prisma.pollWeek.delete({ where: { id } });

  revalidatePath("/admin/polls");
  redirect("/admin/polls");
}

export async function publishPollWeek(formData: FormData) {
  const id = formData.get("id") as string;
  if (!id) return;

  await prisma.pollWeek.update({
    where: { id },
    data: {
      status: "PUBLISHED",
      publishedAt: new Date(),
    },
  });

  revalidatePath("/admin/polls");
  revalidatePath(`/admin/polls/${id}`);
}

export async function updatePollEntries(formData: FormData) {
  const pollWeekId = formData.get("pollWeekId") as string;
  const entriesJson = formData.get("entries") as string;
  
  if (!pollWeekId || !entriesJson) return;

  const entries = JSON.parse(entriesJson) as PollEntryInput[];

  // Delete all existing entries
  await prisma.pollEntry.deleteMany({
    where: { pollWeekId },
  });

  // Create new entries
  if (entries.length > 0) {
    await prisma.pollEntry.createMany({
      data: entries.map((entry) => ({
        pollWeekId,
        teamId: entry.teamId,
        rank: entry.rank,
        previousRank: entry.previousRank,
        points: entry.points,
        note: entry.note,
      })),
    });
  }

  revalidatePath("/admin/polls");
  revalidatePath(`/admin/polls/${pollWeekId}`);
}
