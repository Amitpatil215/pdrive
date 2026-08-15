"use client";

import { formatBytes } from "@/lib/format";
import type { MediaItem } from "@/lib/types";

type Props = {
  item: MediaItem;
  onClose: () => void;
  onDelete: (item: MediaItem) => void;
};

export function MediaViewer({ item, onClose, onDelete }: Props) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
      onClick={onClose}
    >
      <div
        className="flex max-h-full w-full max-w-5xl flex-col gap-3"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-3 text-sm">
          <div className="min-w-0">
            <p className="truncate font-medium text-zinc-100">{item.filename}</p>
            <p className="text-zinc-400">{formatBytes(item.sizeBytes)}</p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => onDelete(item)}
              className="rounded-lg border border-zinc-600 px-3 py-1.5 text-zinc-200 hover:bg-red-500/20 hover:text-red-300"
            >
              Delete
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg bg-zinc-100 px-3 py-1.5 text-zinc-950"
            >
              Close
            </button>
          </div>
        </div>
        <div className="flex max-h-[80vh] items-center justify-center overflow-hidden rounded-xl bg-zinc-950">
          {item.kind === "image" ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={item.url}
              alt={item.filename}
              className="max-h-[80vh] max-w-full object-contain"
            />
          ) : (
            <video
              src={item.url}
              controls
              autoPlay
              className="max-h-[80vh] max-w-full"
            />
          )}
        </div>
      </div>
    </div>
  );
}
