import jwt from "jsonwebtoken";
import { env } from "../env.js";

/**
 * The API does not mint sessions any more — the web app's Google/NextAuth
 * sign-in does, emitting a plain HS256 JWT signed with the same
 * SESSION_SECRET. This only verifies it.
 */
export interface SessionPayload {
  userId: string;
  email?: string;
}

export function verifySessionToken(token: string): SessionPayload | null {
  try {
    const decoded = jwt.verify(token, env.sessionSecret, { algorithms: ["HS256"] });
    if (typeof decoded !== "object" || decoded === null) {
      return null;
    }
    const claims = decoded as Record<string, unknown>;
    const userId = claims.userId ?? claims.sub;
    if (typeof userId !== "string" || userId.length === 0) {
      return null;
    }
    return {
      userId,
      email: typeof claims.email === "string" ? claims.email : undefined,
    };
  } catch {
    return null;
  }
}
