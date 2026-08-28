import type { NextFunction, Request, Response } from "express";
import { verifySessionToken, type SessionPayload } from "./session.js";

/** Must match SESSION_COOKIE in apps/web/lib/session.ts. */
export const SESSION_COOKIE = "code_agent_session";

function parseCookies(header: string | undefined): Map<string, string> {
  const cookies = new Map<string, string>();
  if (!header) return cookies;

  for (const part of header.split(";")) {
    const separator = part.indexOf("=");
    if (separator === -1) continue;
    const name = part.slice(0, separator).trim();
    const value = part.slice(separator + 1).trim();
    if (name) cookies.set(name, decodeURIComponent(value));
  }
  return cookies;
}

function extractToken(req: Request): string | null {
  const header = req.headers.authorization;
  if (header?.startsWith("Bearer ")) {
    return header.slice("Bearer ".length);
  }
  return parseCookies(req.headers.cookie).get(SESSION_COOKIE) ?? null;
}

export function requireUser(req: Request, res: Response, next: NextFunction): void {
  const token = extractToken(req);
  if (!token) {
    res.status(401).json({ error: "Not signed in" });
    return;
  }

  const payload = verifySessionToken(token);
  if (!payload) {
    res.status(401).json({ error: "Invalid or expired session" });
    return;
  }

  req.user = payload;
  next();
}

/** Narrows `req.user` for handlers mounted behind `requireUser`. */
export function currentUser(req: Request): SessionPayload {
  if (!req.user) {
    throw new Error("currentUser() called on a route not guarded by requireUser");
  }
  return req.user;
}
