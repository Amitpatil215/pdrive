import { NextResponse } from "next/server";
import { login } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = (await request.json()) as { email?: string; password?: string };
  const email = body.email?.trim() ?? "";
  const password = body.password ?? "";

  if (!email || !password) {
    return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
  }

  const user = await login(email, password);
  if (!user) {
    return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
  }

  return NextResponse.json({ ok: true });
}
