"use client";

import { useState } from "react";
import { inferContentType } from "@/lib/media-kind";
import { parseApi } from "@/lib/format";
import type { MediaItem } from "@/lib/types";

type Props = {
  onUploaded: (item: MediaItem) => void;
};

export function UploadButton({ onUploaded }: Props) {
  const [uploading, setUploading] = useState(false);

  async function onChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || uploading) {
      return;
    }

    const contentType = inferContentType(file);
    setUploading(true);
    try {
      const signed = await parseApi<{
        key: string;
        uploadUrl: string;
        contentType: string;
      }>(
        await fetch("/api/media/upload-url", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            filename: file.name,
            contentType,
            sizeBytes: file.size,
          }),
        }),
      );

      const put = await fetch(signed.uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": signed.contentType },
        body: file,
      });
      if (!put.ok) {
        throw new Error("Upload to storage failed");
      }

      const saved = await parseApi<{ item: MediaItem }>(
        await fetch("/api/media", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            key: signed.key,
            filename: file.name,
            contentType,
            sizeBytes: file.size,
          }),
        }),
      );
      onUploaded(saved.item);
    } catch (error) {
      alert(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  return (
    <label
      className={`rounded-lg bg-sky-500 px-3 py-2 text-sm font-medium text-zinc-950 hover:bg-sky-400 ${
        uploading ? "pointer-events-none opacity-60" : "cursor-pointer"
      }`}
    >
      {uploading ? "Uploading…" : "Upload"}
      <input
        type="file"
        accept="image/*,video/*"
        className="hidden"
        disabled={uploading}
        onChange={onChange}
      />
    </label>
  );
}
