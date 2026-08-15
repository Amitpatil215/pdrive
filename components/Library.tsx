"use client";

import { useState } from "react";
import { Header } from "@/components/Header";
import { MediaGrid } from "@/components/MediaGrid";
import { MediaViewer } from "@/components/MediaViewer";
import { parseApi } from "@/lib/format";
import type { MediaItem } from "@/lib/types";

type Filter = "all" | "image" | "video";

type Props = {
  initialItems: MediaItem[];
};

export function Library({ initialItems }: Props) {
  const [items, setItems] = useState(initialItems);
  const [filter, setFilter] = useState<Filter>("all");
  const [selected, setSelected] = useState<MediaItem | null>(null);

  async function onDelete(item: MediaItem) {
    if (!confirm(`Delete ${item.filename}?`)) {
      return;
    }
    try {
      await parseApi(await fetch(`/api/media/${item.id}`, { method: "DELETE" }));
      setItems((current) => current.filter((row) => row.id !== item.id));
      setSelected((current) => (current?.id === item.id ? null : current));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Delete failed");
    }
  }

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <Header onUploaded={(item) => setItems((current) => [item, ...current])} />
      <MediaGrid
        items={items}
        filter={filter}
        onFilter={setFilter}
        onOpen={setSelected}
        onDelete={onDelete}
      />
      {selected ? (
        <MediaViewer
          item={selected}
          onClose={() => setSelected(null)}
          onDelete={onDelete}
        />
      ) : null}
    </div>
  );
}
