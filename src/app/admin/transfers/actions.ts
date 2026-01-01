"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import prisma from "@/lib/db";
import { League } from "@prisma/client";

export async function createTransfer(formData: FormData) {
  const playerName = (formData.get("playerName") as string).trim();
  const fromTeamId = (formData.get("fromTeamId") as string) || null;
  const toTeamId = (formData.get("toTeamId") as string) || null;
  const league = (formData.get("league") as string) as League;
  const position = (formData.get("position") as string)?.trim() || null;
  const classYear = (formData.get("classYear") as string)?.trim() || null;
  const notes = (formData.get("notes") as string)?.trim() || null;
  const confirmed = formData.get("confirmed") === "on";

  await prisma.transfer.create({
    data: {
      playerName,
      fromTeamId,
      toTeamId,
      league,
      position,
      classYear,
      notes,
      confirmed,
    },
  });

  revalidatePath("/admin/transfers");
  redirect("/admin/transfers");
}

export async function updateTransfer(formData: FormData) {
  const id = formData.get("id") as string;
  const playerName = (formData.get("playerName") as string).trim();
  const fromTeamId = (formData.get("fromTeamId") as string) || null;
  const toTeamId = (formData.get("toTeamId") as string) || null;
  const league = (formData.get("league") as string) as League;
  const position = (formData.get("position") as string)?.trim() || null;
  const classYear = (formData.get("classYear") as string)?.trim() || null;
  const notes = (formData.get("notes") as string)?.trim() || null;
  const confirmed = formData.get("confirmed") === "on";

  await prisma.transfer.update({
    where: { id },
    data: {
      playerName,
      fromTeamId,
      toTeamId,
      league,
      position,
      classYear,
      notes,
      confirmed,
    },
  });

  revalidatePath("/admin/transfers");
  redirect("/admin/transfers");
}

export async function deleteTransfer(formData: FormData) {
  const id = formData.get("id") as string;
  if (!id) return;

  await prisma.transfer.delete({ where: { id } });

  revalidatePath("/admin/transfers");
}
