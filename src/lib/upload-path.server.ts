import { access } from "fs/promises";
import { join } from "path";
import { getUploadDirectory } from "@/lib/upload-path";

export function getUploadSearchDirectories() {
  const dirs = [getUploadDirectory(), join(process.cwd(), "public/uploads")];
  return [...new Set(dirs)];
}

export async function resolveUploadFilePath(filename: string): Promise<string | null> {
  for (const dir of getUploadSearchDirectories()) {
    const filePath = join(dir, filename);
    try {
      await access(filePath);
      return filePath;
    } catch {
      // try next location
    }
  }
  return null;
}
