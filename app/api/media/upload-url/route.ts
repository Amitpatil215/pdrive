import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { MAX_UPLOAD_BYTES } from "@/lib/constants";
import { isAllowedType, mediaKind, sanitizeFilename } from "@/lib/media";
import { presignPut } from "@/lib/r2";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    const body = (await request.json()) as {
      filename?: string;
      contentType?: string;
      sizeBytes?: number;
    };

    const filename = sanitizeFilename(body.filename ?? "");
    const contentType = body.contentType ?? "";
    const sizeBytes = Number(body.sizeBytes ?? 0);

    if (!isAllowedType(contentType) || !mediaKind(contentType)) {
      return NextResponse.json({ error: "Only images and videos are allowed" }, { status: 400 });
    }
    if (!Number.isFinite(sizeBytes) || sizeBytes <= 0 || sizeBytes > MAX_UPLOAD_BYTES) {
      return NextResponse.json({ error: "File is too large or invalid" }, { status: 400 });
    }

    const key = `${user.id}/${crypto.randomUUID()}-${filename}`;
    const uploadUrl = await presignPut(key, contentType);
    return NextResponse.json({ key, uploadUrl, contentType });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create upload URL";
    const status = message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
