import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE } from "@/lib/session";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3002";

function redirectHome(request: NextRequest): NextResponse {
  const url = request.nextUrl.clone();
  url.pathname = "/";
  return NextResponse.redirect(url);
}

export async function proxy(request: NextRequest) {
  const session = request.cookies.get(SESSION_COOKIE);

  if (!session) {
    return redirectHome(request);
  }

  const verifyResponse = await fetch(`${API_URL}/api/session/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token: session.value }),
  }).catch(() => null);

  if (!verifyResponse || !verifyResponse.ok) {
    const response = redirectHome(request);
    response.cookies.delete(SESSION_COOKIE);
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/code/:path*"],
};
