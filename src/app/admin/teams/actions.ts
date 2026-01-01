"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import prisma from "@/lib/db";
import { uploadFile } from "@/lib/upload";
import { League, Division } from "@prisma/client";

export async function createTeam(formData: FormData) {
  const name = (formData.get("name") as string).trim();
  const shortName = (formData.get("shortName") as string)?.trim() || null;
  const league = (formData.get("league") as string) as League;
  const conference = (formData.get("conference") as string)?.trim() || null;
  const divisionRaw = formData.get("division") as string;
  const division = divisionRaw ? (divisionRaw as Division) : null;
  const officialUrl = (formData.get("officialUrl") as string)?.trim() || null;

  // Handle logo upload
  const logoFile = formData.get("logo") as File | null;
  let logoUrl: string | null = null;
  if (logoFile && logoFile.size > 0) {
    logoUrl = await uploadFile(logoFile);
  }

  await prisma.team.create({
    data: {
      name,
      shortName,
      league,
      conference,
      division,
      logoUrl,
      officialUrl,
      active: true,
      syncedFromMcla: false,
    },
  });

  revalidatePath("/admin/teams");
  redirect("/admin/teams");
}

export async function updateTeam(formData: FormData) {
  const id = formData.get("id") as string;
  const name = (formData.get("name") as string).trim();
  const shortName = (formData.get("shortName") as string)?.trim() || null;
  const league = (formData.get("league") as string) as League;
  const conference = (formData.get("conference") as string)?.trim() || null;
  const divisionRaw = formData.get("division") as string;
  const division = divisionRaw ? (divisionRaw as Division) : null;
  const officialUrl = (formData.get("officialUrl") as string)?.trim() || null;
  const active = formData.get("active") === "on";

  // Handle logo upload
  const logoFile = formData.get("logo") as File | null;
  const existingLogoUrl = (formData.get("logoUrlCurrent") as string) || null;
  let logoUrl = existingLogoUrl;
  if (logoFile && logoFile.size > 0) {
    logoUrl = await uploadFile(logoFile);
  }

  await prisma.team.update({
    where: { id },
    data: {
      name,
      shortName,
      league,
      conference,
      division,
      logoUrl,
      officialUrl,
      active,
    },
  });

  revalidatePath("/admin/teams");
  redirect("/admin/teams");
}

export async function deleteTeam(formData: FormData) {
  const id = formData.get("id") as string;
  if (!id) return;

  await prisma.team.delete({ where: { id } });

  revalidatePath("/admin/teams");
}
