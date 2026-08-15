import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { COOKIE_NAME, readSessionId } from "@/lib/session-cookie";

function isPublicPath(pathname: string) {
  return pathname === "/login" || pathname === "/api/auth/login";
}

export async function proxy(request: NextRequest) {
  const sessionId = await readSessionId(
    request.cookies.get(COOKIE_NAME)?.value,
    process.env.SESSION_SECRET,
  );
  const { pathname } = request.nextUrl;

  if (!sessionId && !isPublicPath(pathname)) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (sessionId && pathname === "/login") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
