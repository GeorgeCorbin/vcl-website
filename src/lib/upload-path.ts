import { join } from "path";

export function getUploadDirectory() {
  return process.env.UPLOAD_DIR ?? join(process.cwd(), "public/uploads");
}

export function getUploadUrl(filename: string) {
  return `/uploads/${filename}`;
}
