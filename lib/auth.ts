import { cookies } from "next/headers";
import { d1First, d1Query } from "@/lib/d1";
import { sessionSecret } from "@/lib/env";
import { COOKIE_NAME, SESSION_DAYS } from "@/lib/constants";
import { passwordsMatch } from "@/lib/password";
import { readSessionId, signSessionId } from "@/lib/session-cookie";
import type { SessionRow, UserRow } from "@/lib/types";

const SESSION_MAX_AGE = SESSION_DAYS * 24 * 60 * 60;

export type AuthUser = {
  id: string;
  email: string;
};

function cookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    path: "/",
    maxAge: SESSION_MAX_AGE,
    secure: process.env.NODE_ENV === "production",
  };
}

export async function login(email: string, password: string): Promise<AuthUser | null> {
  const normalized = email.trim().toLowerCase();
  const user = await d1First<UserRow>(
    "SELECT id, email, password FROM users WHERE email = ?",
    [normalized],
  );
  if (!user || !passwordsMatch(password, user.password)) {
    return null;
  }

  const sessionId = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + SESSION_MAX_AGE * 1000).toISOString();
  await d1Query(
    "INSERT INTO sessions (id, user_id, expires_at) VALUES (?, ?, ?)",
    [sessionId, user.id, expiresAt],
  );

  const jar = await cookies();
  jar.set(COOKIE_NAME, await signSessionId(sessionId, sessionSecret()), cookieOptions());
  return { id: user.id, email: user.email };
}

export async function logout() {
  const jar = await cookies();
  const sessionId = await readSessionId(jar.get(COOKIE_NAME)?.value, process.env.SESSION_SECRET);
  if (sessionId) {
    await d1Query("DELETE FROM sessions WHERE id = ?", [sessionId]);
  }
  jar.delete(COOKIE_NAME);
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  const jar = await cookies();
  const sessionId = await readSessionId(
    jar.get(COOKIE_NAME)?.value,
    process.env.SESSION_SECRET,
  );
  if (!sessionId) {
    return null;
  }

  const row = await d1First<SessionRow & { email: string }>(
    `SELECT s.id, s.user_id, s.expires_at, u.email
     FROM sessions s JOIN users u ON u.id = s.user_id
     WHERE s.id = ?`,
    [sessionId],
  );
  if (!row || new Date(row.expires_at).getTime() < Date.now()) {
    jar.delete(COOKIE_NAME);
    return null;
  }

  return { id: row.user_id, email: row.email };
}

export async function requireUser(): Promise<AuthUser> {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Unauthorized");
  }
  return user;
}
