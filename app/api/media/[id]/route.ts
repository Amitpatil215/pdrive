import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { d1First, d1Query } from "@/lib/d1";
import { deleteObject } from "@/lib/r2";
import type { MediaRow } from "@/lib/types";

export const runtime = "nodejs";

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireUser();
    const { id } = await context.params;
    const row = await d1First<MediaRow>(
      "SELECT * FROM media WHERE id = ? AND user_id = ?",
      [id, user.id],
    );
    if (!row) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    await deleteObject(row.r2_key);
    await d1Query("DELETE FROM media WHERE id = ? AND user_id = ?", [id, user.id]);
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to delete";
    const status = message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
