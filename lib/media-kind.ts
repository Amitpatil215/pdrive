import { ALLOWED_TYPES, type AllowedType } from "@/lib/constants";
import type { MediaKind } from "@/lib/types";

export function mediaKind(contentType: string): MediaKind | null {
  if (contentType.startsWith("image/")) {
    return "image";
  }
  if (contentType.startsWith("video/")) {
    return "video";
  }
  return null;
}

export function isAllowedType(contentType: string): contentType is AllowedType {
  return (ALLOWED_TYPES as readonly string[]).includes(contentType);
}

export function inferContentType(file: File): string {
  if (file.type) {
    return file.type;
  }
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  const byExt: Record<string, string> = {
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    webp: "image/webp",
    gif: "image/gif",
    avif: "image/avif",
    mp4: "video/mp4",
    webm: "video/webm",
    mov: "video/quicktime",
  };
  return byExt[ext] ?? "";
}

export function sanitizeFilename(name: string): string {
  return name.replace(/[^\w.\- ()]/g, "_").slice(0, 180) || "file";
}
