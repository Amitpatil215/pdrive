"use client";

import { useRouter } from "next/navigation";
import { UploadButton } from "@/components/UploadButton";
import type { MediaItem } from "@/lib/types";

type Props = {
  onUploaded: (item: MediaItem) => void;
};

export function Header({ onUploaded }: Props) {
  const router = useRouter();

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="flex items-center justify-between gap-4 border-b border-zinc-800 px-4 py-3 sm:px-6">
      <h1 className="text-lg font-semibold tracking-tight">Drive</h1>
      <div className="flex items-center gap-2">
        <UploadButton onUploaded={onUploaded} />
        <button
          type="button"
          onClick={logout}
          className="rounded-lg border border-zinc-700 px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-800"
        >
          Log out
        </button>
      </div>
    </header>
  );
}
