import { SignJWT, jwtVerify, type JWTPayload } from "jose";

/**
 * The single session cookie. NextAuth writes it after Google sign-in, the
 * proxy reads it to guard /code, and apps/api verifies it with the same
 * SESSION_SECRET — so the token is a plain HS256 JWT rather than NextAuth's
 * default encrypted (JWE) format.
 */
export const SESSION_COOKIE = "code_agent_session";

export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

/** Claims apps/api relies on. Google's `sub` is the stable user id. */
export interface PlatformSession {
  userId: string;
  email?: string;
}

function secretKey(): Uint8Array {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error("Missing required env var: SESSION_SECRET");
  }
  return new TextEncoder().encode(secret);
}

/**
 * Generic signer — NextAuth reuses `jwt.encode` for the short-lived OAuth
 * `state` and PKCE cookies as well as the session, so this must pass any
 * payload through untouched and honour the caller's maxAge.
 */
export async function signSessionToken(
  payload: JWTPayload,
  maxAgeSeconds: number,
): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt(now)
    .setExpirationTime(now + maxAgeSeconds)
    .sign(secretKey());
}

export async function verifySessionToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secretKey(), { algorithms: ["HS256"] });
    return payload;
  } catch {
    return null;
  }
}
