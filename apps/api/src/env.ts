import { readFileSync } from "node:fs";

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required env var: ${name}`);
  }
  return value;
}

function loadPrivateKey(): string {
  const path = process.env.GITHUB_APP_PRIVATE_KEY_PATH;
  if (path) {
    return readFileSync(path, "utf8");
  }
  return required("GITHUB_APP_PRIVATE_KEY").replace(/\\n/g, "\n");
}

export const env = {
  githubAppId: required("GITHUB_APP_ID"),
  githubAppClientId: required("GITHUB_APP_CLIENT_ID"),
  githubAppClientSecret: required("GITHUB_APP_CLIENT_SECRET"),
  githubAppPrivateKey: loadPrivateKey(),
  githubAppSlug: required("GITHUB_APP_SLUG"),
  sessionSecret: required("SESSION_SECRET"),
  webAppUrl: process.env.WEB_APP_URL ?? "http://localhost:3001",
  port: Number(process.env.PORT ?? 3002),
};
