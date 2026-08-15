import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { MAX_UPLOAD_BYTES } from "@/lib/constants";
import { d1Query } from "@/lib/d1";
import { isAllowedType, mediaKind, sanitizeFilename, toMediaItem } from "@/lib/media";
import { objectExists } from "@/lib/r2";
import type { MediaRow } from "@/lib/types";

export const runtime = "nodejs";

export async function GET() {
  try {
    const user = await requireUser();
    const rows = await d1Query<MediaRow>(
      `SELECT id, user_id, r2_key, filename, content_type, kind, size_bytes, created_at
       FROM media WHERE user_id = ? ORDER BY created_at DESC`,
      [user.id],
    );
    const items = await Promise.all(rows.map(toMediaItem));
    return NextResponse.json({ items });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to list media";
    const status = message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    const body = (await request.json()) as {
      key?: string;
      filename?: string;
      contentType?: string;
      sizeBytes?: number;
    };

    const key = body.key ?? "";
    const filename = sanitizeFilename(body.filename ?? "");
    const contentType = body.contentType ?? "";
    const sizeBytes = Number(body.sizeBytes ?? 0);
    const kind = mediaKind(contentType);
    const prefix = `${user.id}/`;

    if (!key.startsWith(prefix) || !isAllowedType(contentType) || !kind) {
      return NextResponse.json({ error: "Invalid upload metadata" }, { status: 400 });
    }
    if (!Number.isFinite(sizeBytes) || sizeBytes <= 0 || sizeBytes > MAX_UPLOAD_BYTES) {
      return NextResponse.json({ error: "Invalid file size" }, { status: 400 });
    }
    if (!(await objectExists(key))) {
      return NextResponse.json({ error: "File not found in storage" }, { status: 400 });
    }

    const row: MediaRow = {
      id: crypto.randomUUID(),
      user_id: user.id,
      r2_key: key,
      filename,
      content_type: contentType,
      kind,
      size_bytes: sizeBytes,
      created_at: new Date().toISOString(),
    };
    await d1Query(
      `INSERT INTO media (id, user_id, r2_key, filename, content_type, kind, size_bytes, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [row.id, row.user_id, row.r2_key, row.filename, row.content_type, row.kind, row.size_bytes, row.created_at],
    );

    return NextResponse.json({ item: await toMediaItem(row) });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to save media";
    const status = message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
