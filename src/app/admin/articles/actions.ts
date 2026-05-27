"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import slugify from "slugify";
import prisma from "@/lib/db";
import { uploadFile } from "@/lib/upload";
import { ArticleStatus } from "@prisma/client";
import { resolveLeagueCode } from "@/lib/league-config";
import { readdir } from "fs/promises";
import { getUploadDirectory, getUploadUrl } from "@/lib/upload-path";

const slugifyInput = (value: string) =>
  slugify(value, {
    lower: true,
    strict: true,
    trim: true,
  });

async function ensureUniqueArticleSlug(baseValue: string, excludeId?: string): Promise<string> {
  const baseSlug = slugifyInput(baseValue) || "article";
  let candidate = baseSlug;
  let suffix = 1;

  while (true) {
    const existing = await prisma.article.findFirst({
      where: {
        slug: candidate,
        ...(excludeId ? { id: { not: excludeId } } : {}),
      },
      select: { id: true },
    });

    if (!existing) {
      return candidate;
    }

    candidate = `${baseSlug}-${suffix}`;
    suffix += 1;
  }
}

async function upsertTags(tagNames: string[]): Promise<string[]> {
  if (!tagNames.length) return [];
  const ids: string[] = [];
  for (const name of tagNames) {
    const slug = slugifyInput(name);
    const tag = await prisma.tag.upsert({
      where: { slug },
      update: {},
      create: { name, slug },
    });
    ids.push(tag.id);
  }
  return ids;
}

function normalizeStatus(value: FormDataEntryValue | null): ArticleStatus {
  const upper = (value as string | null)?.toUpperCase();
  if (upper === "PUBLISHED" || upper === "ARCHIVED" || upper === "DRAFT") {
    return upper as ArticleStatus;
  }
  return ArticleStatus.DRAFT;
}

async function handleCoverUpload(existing: string | null, file: File | null): Promise<string | null> {
  if (file && file.size > 0) {
    return uploadFile(file);
  }
  return existing || null;
}

function getPublishedAt(status: ArticleStatus, previous?: Date | null) {
  if (status === "PUBLISHED") {
    return previous ?? new Date();
  }
  if (status === "DRAFT") {
    return null;
  }
  return previous ?? null;
}

export async function createArticle(formData: FormData) {
  const title = (formData.get("title") as string)?.trim();
  if (!title) {
    throw new Error("Title is required.");
  }

  const slugInput = (formData.get("slug") as string)?.trim();
  const slug = await ensureUniqueArticleSlug(slugInput || title);
  const content = (formData.get("content") as string) || "";
  if (!content.trim()) {
    throw new Error("Content is required.");
  }

  const excerpt = ((formData.get("excerpt") as string) || "").trim() || null;
  const status = normalizeStatus(formData.get("status"));
  const featured = formData.get("featured") === "on";

  const author = ((formData.get("author") as string) || "").trim() || null;
  const photographerCredit = ((formData.get("photographerCredit") as string) || "").trim() || null;
  const coverFocalX = parseFloat((formData.get("coverFocalX") as string) || "50") || 50;
  const coverFocalY = parseFloat((formData.get("coverFocalY") as string) || "50") || 50;
  const league = await resolveLeagueCode(formData.get("league"));
  const existingCover = (formData.get("coverImageCurrent") as string) || null;
  const coverImage = await handleCoverUpload(existingCover, (formData.get("coverImage") as File | null) || null);

  const tagNames = formData.getAll("tags") as string[];
  const tagIds = await upsertTags(tagNames.filter(Boolean));

  await prisma.article.create({
    data: {
      title,
      slug,
      excerpt,
      content,
      coverImage,
      coverFocalX,
      coverFocalY,
      photographerCredit,
      author,
      status,
      featured,
      league,
      publishedAt: getPublishedAt(status, null),
      ...(tagIds.length && { tags: { connect: tagIds.map((id) => ({ id })) } }),
    },
  });

  revalidatePath("/");
  revalidatePath("/articles");
  revalidatePath("/admin/articles");
  redirect("/admin/articles");
}

export async function updateArticle(formData: FormData) {
  const id = formData.get("id") as string;
  if (!id) {
    throw new Error("Missing article id.");
  }

  const title = (formData.get("title") as string)?.trim();
  if (!title) {
    throw new Error("Title is required.");
  }

  const slugInput = (formData.get("slug") as string)?.trim();
  const slug = await ensureUniqueArticleSlug(slugInput || title, id);
  const content = (formData.get("content") as string) || "";
  if (!content.trim()) {
    throw new Error("Content is required.");
  }

  const excerpt = ((formData.get("excerpt") as string) || "").trim() || null;
  const status = normalizeStatus(formData.get("status"));
  const featured = formData.get("featured") === "on";
  const author = ((formData.get("author") as string) || "").trim() || null;
  const photographerCredit = ((formData.get("photographerCredit") as string) || "").trim() || null;
  const coverFocalX = parseFloat((formData.get("coverFocalX") as string) || "50") || 50;
  const coverFocalY = parseFloat((formData.get("coverFocalY") as string) || "50") || 50;
  const league = await resolveLeagueCode(formData.get("league"));
  const existingCover = (formData.get("coverImageCurrent") as string) || null;
  const coverImage = await handleCoverUpload(existingCover, formData.get("coverImage") as File | null);

  const existing = await prisma.article.findUnique({ where: { id }, select: { publishedAt: true } });
  if (!existing) {
    throw new Error("Article not found.");
  }

  const tagNames = formData.getAll("tags") as string[];
  const tagIds = await upsertTags(tagNames.filter(Boolean));

  await prisma.article.update({
    where: { id },
    data: {
      title,
      slug,
      excerpt,
      content,
      coverImage,
      coverFocalX,
      coverFocalY,
      photographerCredit,
      author,
      status,
      featured,
      league,
      publishedAt: getPublishedAt(status, existing.publishedAt),
      tags: { set: tagIds.map((id) => ({ id })) },
    },
  });

  revalidatePath("/");
  revalidatePath("/articles");
  revalidatePath("/admin/articles");
  redirect("/admin/articles");
}

export async function deleteArticle(formData: FormData) {
  const id = formData.get("id") as string;
  if (!id) return;

  await prisma.article.delete({ where: { id } });

  revalidatePath("/");
  revalidatePath("/articles");
  revalidatePath("/admin/articles");
  redirect("/admin/articles");
}

export async function uploadImageAction(formData: FormData): Promise<{ path?: string; error?: string }> {
  const file = formData.get("file") as File | null;
  if (!file || file.size === 0) {
    return { error: "No file provided" };
  }

  try {
    const path = await uploadFile(file);
    if (!path) {
      return { error: "Failed to upload file" };
    }
    return { path };
  } catch (error) {
    console.error("Failed to upload image:", error);
    return { error: error instanceof Error ? error.message : "Failed to upload image" };
  }
}

export async function getUploadedImages(): Promise<string[]> {
  try {
    const uploadDir = getUploadDirectory();
    const files = await readdir(uploadDir);
    const imageExtensions = [".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg"];
    return files
      .filter((file) => imageExtensions.some((ext) => file.toLowerCase().endsWith(ext)))
      .map((file) => getUploadUrl(file));
  } catch {
    return [];
  }
}
