"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    setPending(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        throw new Error(data.error ?? "Login failed");
      }
      router.push("/");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex w-full max-w-sm flex-col gap-4">
      <label className="flex flex-col gap-1.5 text-sm">
        <span className="text-zinc-400">Email</span>
        <input
          type="email"
          autoComplete="username"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-zinc-100 outline-none focus:border-sky-500"
        />
      </label>
      <label className="flex flex-col gap-1.5 text-sm">
        <span className="text-zinc-400">Password</span>
        <input
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-zinc-100 outline-none focus:border-sky-500"
        />
      </label>
      <p className="text-xs text-zinc-500">
        Enter your base password plus today&apos;s date as DDMMYYYY (IST).
      </p>
      {error ? <p className="text-sm text-red-400">{error}</p> : null}
      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-sky-500 px-4 py-2.5 text-sm font-medium text-zinc-950 hover:bg-sky-400 disabled:opacity-60"
      >
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
