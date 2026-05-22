import { join } from "path";

export function getUploadDirectory() {
  return process.env.UPLOADS_DIR
    ? join(process.env.UPLOADS_DIR)
    : join(process.cwd(), "public/uploads");
}

export function getUploadUrl(filename: string) {
  return `/uploads/${filename}`;
}

export function isUploadedImage(path: string) {
  return path.startsWith("/uploads/");
}
