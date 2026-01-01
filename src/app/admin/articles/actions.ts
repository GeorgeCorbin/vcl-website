"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import slugify from "slugify";
import prisma from "@/lib/db";
import { uploadFile } from "@/lib/upload";
import { ArticleStatus } from "@prisma/client";
import { join } from "path";
import { readdir } from "fs/promises";

const slugifyInput = (value: string) =>
  slugify(value, {
    lower: true,
    strict: true,
    trim: true,
  });

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
  const slug = slugifyInput(slugInput || title);
  const content = (formData.get("content") as string) || "";
  if (!content.trim()) {
    throw new Error("Content is required.");
  }

  const excerpt = ((formData.get("excerpt") as string) || "").trim() || null;
  const status = normalizeStatus(formData.get("status"));
  const featured = formData.get("featured") === "on";

  const author = ((formData.get("author") as string) || "").trim() || null;
  const existingCover = (formData.get("coverImageCurrent") as string) || null;
  const coverImage = await handleCoverUpload(existingCover, (formData.get("coverImage") as File | null) || null);

  await prisma.article.create({
    data: {
      title,
      slug,
      excerpt,
      content,
      coverImage,
      author,
      status,
      featured,
      publishedAt: getPublishedAt(status, null),
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
  const slug = slugifyInput(slugInput || title);
  const content = (formData.get("content") as string) || "";
  if (!content.trim()) {
    throw new Error("Content is required.");
  }

  const excerpt = ((formData.get("excerpt") as string) || "").trim() || null;
  const status = normalizeStatus(formData.get("status"));
  const featured = formData.get("featured") === "on";
  const author = ((formData.get("author") as string) || "").trim() || null;
  const existingCover = (formData.get("coverImageCurrent") as string) || null;
  const coverImage = await handleCoverUpload(existingCover, formData.get("coverImage") as File | null);

  const existing = await prisma.article.findUnique({ where: { id }, select: { publishedAt: true } });
  if (!existing) {
    throw new Error("Article not found.");
  }

  await prisma.article.update({
    where: { id },
    data: {
      title,
      slug,
      excerpt,
      content,
      coverImage,
      author,
      status,
      featured,
      publishedAt: getPublishedAt(status, existing.publishedAt),
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
    const uploadDir = join(process.cwd(), "public/uploads");
    const files = await readdir(uploadDir);
    const imageExtensions = [".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg"];
    return files
      .filter((file) => imageExtensions.some((ext) => file.toLowerCase().endsWith(ext)))
      .map((file) => `/uploads/${file}`);
  } catch {
    return [];
  }
}
