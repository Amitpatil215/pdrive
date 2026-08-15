import { presignGet } from "@/lib/r2";
import type { MediaItem, MediaRow } from "@/lib/types";

export async function toMediaItem(row: MediaRow): Promise<MediaItem> {
  return {
    id: row.id,
    filename: row.filename,
    contentType: row.content_type,
    kind: row.kind,
    sizeBytes: row.size_bytes,
    createdAt: row.created_at,
    url: await presignGet(row.r2_key),
  };
}

export {
  inferContentType,
  isAllowedType,
  mediaKind,
  sanitizeFilename,
} from "@/lib/media-kind";
