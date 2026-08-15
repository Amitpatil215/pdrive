"use client";

import { MediaCard } from "@/components/MediaCard";
import type { MediaItem } from "@/lib/types";

type Filter = "all" | "image" | "video";

type Props = {
  items: MediaItem[];
  filter: Filter;
  onFilter: (filter: Filter) => void;
  onOpen: (item: MediaItem) => void;
  onDelete: (item: MediaItem) => void;
};

const FILTERS: Filter[] = ["all", "image", "video"];

export function MediaGrid({ items, filter, onFilter, onOpen, onDelete }: Props) {
  const visible =
    filter === "all" ? items : items.filter((item) => item.kind === filter);

  return (
    <section className="flex flex-1 flex-col gap-4 p-4 sm:p-6">
      <div className="flex gap-2">
        {FILTERS.map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => onFilter(value)}
            className={`rounded-full px-3 py-1 text-sm capitalize ${
              filter === value
                ? "bg-zinc-100 text-zinc-950"
                : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
            }`}
          >
            {value === "all" ? "All" : `${value}s`}
          </button>
        ))}
      </div>
      {visible.length === 0 ? (
        <p className="mt-12 text-center text-sm text-zinc-500">
          No media yet. Upload an image or video to get started.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {visible.map((item) => (
            <MediaCard
              key={item.id}
              item={item}
              onOpen={onOpen}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </section>
  );
}
