import { LoginForm } from "@/components/LoginForm";

export default function LoginPage() {
  return (
    <main className="flex min-h-full flex-1 flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-2xl border border-zinc-800 bg-zinc-950/80 p-8 shadow-xl">
        <h1 className="mb-1 text-2xl font-semibold tracking-tight">Drive</h1>
        <p className="mb-6 text-sm text-zinc-400">Sign in to view your media</p>
        <LoginForm />
      </div>
    </main>
  );
}
