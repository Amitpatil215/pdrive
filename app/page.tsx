import { redirect } from "next/navigation";
import { Library } from "@/components/Library";
import { getCurrentUser } from "@/lib/auth";
import { d1Query } from "@/lib/d1";
import { toMediaItem } from "@/lib/media";
import type { MediaRow } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function Home() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const rows = await d1Query<MediaRow>(
    `SELECT id, user_id, r2_key, filename, content_type, kind, size_bytes, created_at
     FROM media WHERE user_id = ? ORDER BY created_at DESC`,
    [user.id],
  );
  const items = await Promise.all(rows.map(toMediaItem));
  return <Library initialItems={items} />;
}
