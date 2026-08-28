import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import type { JWTPayload } from "jose";
import {
  SESSION_COOKIE,
  SESSION_MAX_AGE_SECONDS,
  signSessionToken,
  verifySessionToken,
} from "./session";

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required env var: ${name}`);
  }
  return value;
}

/**
 * Platform authentication only — this is what decides *who you are*.
 *
 * The GitHub App OAuth flow is deliberately not a provider here: installing
 * the app is a repo *connection* made by an already-signed-in user, handled
 * by apps/api and stored as a GitHubCredential against this user's id.
 */
export const authOptions: NextAuthOptions = {
  secret: required("SESSION_SECRET"),
  providers: [
    GoogleProvider({
      clientId: required("GOOGLE_CLIENT_ID"),
      clientSecret: required("GOOGLE_CLIENT_SECRET"),
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: SESSION_MAX_AGE_SECONDS,
  },
  cookies: {
    sessionToken: {
      name: SESSION_COOKIE,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },
  // Emit a plain HS256 JWT instead of NextAuth's default JWE so apps/api can
  // verify the same cookie with jsonwebtoken and the shared SESSION_SECRET.
  jwt: {
    maxAge: SESSION_MAX_AGE_SECONDS,
    async encode({ token, maxAge }) {
      return signSessionToken(
        (token ?? {}) as JWTPayload,
        maxAge ?? SESSION_MAX_AGE_SECONDS,
      );
    },
    async decode({ token }) {
      if (!token) return null;
      return (await verifySessionToken(token)) as Awaited<
        ReturnType<NonNullable<NonNullable<NextAuthOptions["jwt"]>["decode"]>>
      >;
    },
  },
  callbacks: {
    jwt({ token, account, profile }) {
      if (account && profile) {
        token.userId = profile.sub ?? token.sub ?? "";
        token.email = profile.email;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.userId ?? token.sub ?? "";
      }
      return session;
    },
  },
};
