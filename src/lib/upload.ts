"use server";

import { mkdir, writeFile } from "fs/promises";
import { join } from "path";

const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB

export async function uploadFile(file: File | null): Promise<string | null> {
  if (!file || file.size === 0) return null;

  if (file.size > MAX_FILE_SIZE) {
    throw new Error("File size exceeds 25MB limit");
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const sanitizedName = file.name.replace(/[^a-zA-Z0-9._-]/g, "");
  const filename = `${Date.now()}-${sanitizedName || "upload"}`;
  const uploadDir = join(process.cwd(), "public/uploads");

  await mkdir(uploadDir, { recursive: true });
  await writeFile(join(uploadDir, filename), buffer);

  return `/uploads/${filename}`;
}
