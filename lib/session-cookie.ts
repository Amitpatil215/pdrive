import { COOKIE_NAME } from "@/lib/constants";

function toHex(bytes: ArrayBuffer): string {
  return [...new Uint8Array(bytes)]
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

async function hmac(value: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(value),
  );
  return toHex(signature);
}

export async function signSessionId(sessionId: string, secret: string) {
  const signature = await hmac(sessionId, secret);
  return `${sessionId}.${signature}`;
}

export async function readSessionId(
  cookieValue: string | undefined,
  secret: string | undefined,
): Promise<string | null> {
  if (!cookieValue || !secret) {
    return null;
  }
  const [sessionId, signature] = cookieValue.split(".");
  if (!sessionId || !signature) {
    return null;
  }
  const expected = await hmac(sessionId, secret);
  if (expected !== signature) {
    return null;
  }
  return sessionId;
}

export { COOKIE_NAME };
