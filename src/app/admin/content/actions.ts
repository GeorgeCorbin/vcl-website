"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import prisma from "@/lib/db";

export async function updatePageContent(formData: FormData) {
  const slug = formData.get("slug") as string;
  const title = (formData.get("title") as string).trim();
  const content = (formData.get("content") as string) || "";

  const existingPage = await prisma.page.findUnique({ where: { slug } });

  if (existingPage) {
    await prisma.page.update({
      where: { slug },
      data: { title, content },
    });
  } else {
    await prisma.page.create({
      data: { slug, title, content },
    });
  }

  revalidatePath("/admin/content");
  revalidatePath(`/${slug}`);
  redirect("/admin/content");
}
