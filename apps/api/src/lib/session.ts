import jwt from "jsonwebtoken";
import { env } from "../env.js";

const SESSION_TTL_SECONDS = 60 * 60 * 24 * 30;

export interface SessionPayload {
  installationId: string;
  accountLogin: string;
}

export function createSessionToken(payload: SessionPayload): string {
  return jwt.sign(payload, env.sessionSecret, {
    algorithm: "HS256",
    expiresIn: SESSION_TTL_SECONDS,
  });
}

export function verifySessionToken(token: string): SessionPayload | null {
  try {
    const decoded = jwt.verify(token, env.sessionSecret);
    if (
      typeof decoded !== "object" ||
      decoded === null ||
      typeof decoded.installationId !== "string" ||
      typeof decoded.accountLogin !== "string"
    ) {
      return null;
    }
    return { installationId: decoded.installationId, accountLogin: decoded.accountLogin };
  } catch {
    return null;
  }
}
