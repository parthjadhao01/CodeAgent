import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/session";

function redirectHome(request: NextRequest): NextResponse {
  const url = request.nextUrl.clone();
  url.pathname = "/";
  return NextResponse.redirect(url);
}

/**
 * Guards the dashboard on *platform* auth (Google via NextAuth) only.
 * Whether the user has connected a GitHub App installation is a separate
 * concern, handled inside /code — not a condition for reaching it.
 */
export async function proxy(request: NextRequest) {
  const session = request.cookies.get(SESSION_COOKIE);

  if (!session) {
    return redirectHome(request);
  }

  const payload = await verifySessionToken(session.value);

  if (!payload) {
    const response = redirectHome(request);
    response.cookies.delete(SESSION_COOKIE);
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/code/:path*"],
};
