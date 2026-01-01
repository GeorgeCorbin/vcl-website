"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import prisma from "@/lib/db";

export async function createLeagueConfig(formData: FormData) {
  const name = (formData.get("name") as string).trim();
  const code = (formData.get("code") as string).trim().toUpperCase();
  const active = formData.get("active") === "on";

  // Parse conferences and divisions from JSON
  const conferencesJson = formData.get("conferences") as string;
  const divisionsJson = formData.get("divisions") as string;
  
  const conferences = conferencesJson ? JSON.parse(conferencesJson) : [];
  const divisions = divisionsJson ? JSON.parse(divisionsJson) : [];

  const league = await prisma.leagueConfig.create({
    data: {
      name,
      code,
      active,
      conferences: {
        create: conferences.map((conf: { name: string; code?: string; regions?: { name: string; code?: string }[] }) => ({
          name: conf.name,
          code: conf.code || null,
          regions: conf.regions ? {
            create: conf.regions.map((region) => ({
              name: region.name,
              code: region.code || null,
            })),
          } : undefined,
        })),
      },
      divisions: {
        create: divisions.map((div: { name: string; code: string; displayOrder: number }) => ({
          name: div.name,
          code: div.code,
          displayOrder: div.displayOrder,
        })),
      },
    },
  });

  revalidatePath("/admin/leagues");
  redirect("/admin/leagues");
}

export async function updateLeagueConfig(formData: FormData) {
  const id = formData.get("id") as string;
  const name = (formData.get("name") as string).trim();
  const code = (formData.get("code") as string).trim().toUpperCase();
  const active = formData.get("active") === "on";

  await prisma.leagueConfig.update({
    where: { id },
    data: {
      name,
      code,
      active,
    },
  });

  revalidatePath("/admin/leagues");
  revalidatePath(`/admin/leagues/${id}`);
  redirect("/admin/leagues");
}

export async function deleteLeagueConfig(formData: FormData) {
  const id = formData.get("id") as string;
  if (!id) return;

  await prisma.leagueConfig.delete({ where: { id } });

  revalidatePath("/admin/leagues");
}

export async function addConference(formData: FormData) {
  const leagueConfigId = formData.get("leagueConfigId") as string;
  const name = (formData.get("name") as string).trim();
  const code = (formData.get("code") as string)?.trim().toUpperCase() || null;

  await prisma.conference.create({
    data: {
      name,
      code,
      leagueConfigId,
    },
  });

  revalidatePath(`/admin/leagues/${leagueConfigId}`);
}

export async function deleteConference(formData: FormData) {
  const id = formData.get("id") as string;
  const leagueConfigId = formData.get("leagueConfigId") as string;
  if (!id) return;

  await prisma.conference.delete({ where: { id } });

  revalidatePath(`/admin/leagues/${leagueConfigId}`);
}

export async function toggleDivision(formData: FormData) {
  const leagueConfigId = formData.get("leagueConfigId") as string;
  const divisionCode = formData.get("divisionCode") as string;
  const checked = formData.get("checked") === "true";

  if (checked) {
    // Add the division
    const divisionMap: { [key: string]: { name: string; displayOrder: number } } = {
      "D1": { name: "Division 1", displayOrder: 0 },
      "D2": { name: "Division 2", displayOrder: 1 },
      "D3": { name: "Division 3", displayOrder: 2 },
    };

    const divisionInfo = divisionMap[divisionCode];
    if (divisionInfo) {
      await prisma.leagueDivision.create({
        data: {
          name: divisionInfo.name,
          code: divisionCode,
          displayOrder: divisionInfo.displayOrder,
          leagueConfigId,
        },
      });
    }
  } else {
    // Remove the division
    await prisma.leagueDivision.deleteMany({
      where: {
        leagueConfigId,
        code: divisionCode,
      },
    });
  }

  revalidatePath(`/admin/leagues/${leagueConfigId}`);
}

export async function addRegion(formData: FormData) {
  const conferenceId = formData.get("conferenceId") as string;
  const leagueConfigId = formData.get("leagueConfigId") as string;
  const name = (formData.get("name") as string).trim();
  const code = (formData.get("code") as string)?.trim() || null;

  await prisma.conferenceRegion.create({
    data: {
      name,
      code,
      conferenceId,
    },
  });

  revalidatePath(`/admin/leagues/${leagueConfigId}`);
}

export async function deleteRegion(formData: FormData) {
  const id = formData.get("id") as string;
  const leagueConfigId = formData.get("leagueConfigId") as string;
  if (!id) return;

  await prisma.conferenceRegion.delete({ where: { id } });

  revalidatePath(`/admin/leagues/${leagueConfigId}`);
}
