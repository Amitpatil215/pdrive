import { createHash, timingSafeEqual } from "crypto";

// Today's date in IST as DDMMYYYY, e.g. 15082026.
export function istDateStamp(date = new Date()): string {
  const fmt = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Kolkata",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
  const parts = Object.fromEntries(
    fmt.formatToParts(date).map((part) => [part.type, part.value]),
  );
  return `${parts.day}${parts.month}${parts.year}`;
}

export function dailyPassword(base: string, date = new Date()): string {
  return `${base}${istDateStamp(date)}`;
}

export function passwordsMatch(submitted: string, storedBase: string): boolean {
  const expected = dailyPassword(storedBase);
  const a = createHash("sha256").update(submitted).digest();
  const b = createHash("sha256").update(expected).digest();
  return timingSafeEqual(a, b);
}
