"use client";

import { formatBytes } from "@/lib/format";
import type { MediaItem } from "@/lib/types";

type Props = {
  item: MediaItem;
  onOpen: (item: MediaItem) => void;
  onDelete: (item: MediaItem) => void;
};

export function MediaCard({ item, onOpen, onDelete }: Props) {
  return (
    <article className="group relative overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900">
      <button
        type="button"
        onClick={() => onOpen(item)}
        className="block aspect-square w-full overflow-hidden bg-zinc-950"
      >
        {item.kind === "image" ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={item.url} alt={item.filename} className="h-full w-full object-cover" />
        ) : (
          <span className="relative block h-full w-full">
            <video src={item.url} muted preload="metadata" className="h-full w-full object-cover" />
            <span className="absolute inset-0 flex items-center justify-center bg-black/30 text-3xl text-white">
              ▶
            </span>
          </span>
        )}
      </button>
      <div className="flex items-start justify-between gap-2 px-3 py-2">
        <div className="min-w-0">
          <p className="truncate text-sm text-zinc-200">{item.filename}</p>
          <p className="text-xs text-zinc-500">{formatBytes(item.sizeBytes)}</p>
        </div>
        <button
          type="button"
          onClick={() => onDelete(item)}
          className="shrink-0 text-xs text-zinc-500 hover:text-red-400"
        >
          Delete
        </button>
      </div>
    </article>
  );
}
