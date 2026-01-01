"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import prisma from "@/lib/db";
import { AdType } from "@prisma/client";

export async function createAdUnit(formData: FormData) {
  const name = (formData.get("name") as string).trim();
  const adType = (formData.get("adType") as string) as AdType;
  const code = (formData.get("code") as string) || "";
  const placement = (formData.get("placement") as string)?.trim() || null;
  const description = (formData.get("description") as string)?.trim() || null;
  const enabled = formData.get("enabled") === "on";

  await prisma.adUnit.create({
    data: {
      name,
      adType,
      code,
      placement,
      description,
      enabled,
    },
  });

  revalidatePath("/admin/ads");
  redirect("/admin/ads");
}

export async function updateAdUnit(formData: FormData) {
  const id = formData.get("id") as string;
  const name = (formData.get("name") as string).trim();
  const adType = (formData.get("adType") as string) as AdType;
  const code = (formData.get("code") as string) || "";
  const placement = (formData.get("placement") as string)?.trim() || null;
  const description = (formData.get("description") as string)?.trim() || null;
  const enabled = formData.get("enabled") === "on";

  await prisma.adUnit.update({
    where: { id },
    data: {
      name,
      adType,
      code,
      placement,
      description,
      enabled,
    },
  });

  revalidatePath("/admin/ads");
  redirect("/admin/ads");
}

export async function toggleAdUnit(formData: FormData) {
  const id = formData.get("id") as string;
  const enabled = formData.get("enabled") === "true";

  await prisma.adUnit.update({
    where: { id },
    data: { enabled },
  });

  revalidatePath("/admin/ads");
}

export async function deleteAdUnit(formData: FormData) {
  const id = formData.get("id") as string;
  if (!id) return;

  await prisma.adUnit.delete({ where: { id } });

  revalidatePath("/admin/ads");
}
