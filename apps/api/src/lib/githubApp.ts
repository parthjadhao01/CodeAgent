import jwt from "jsonwebtoken";
import { env } from "../env.js";

const GITHUB_API = "https://api.github.com";

export function createAppJwt(): string {
  const now = Math.floor(Date.now() / 1000);
  return jwt.sign(
    {
      iat: now - 60,
      exp: now + 9 * 60,
      iss: env.githubAppId,
    },
    env.githubAppPrivateKey,
    { algorithm: "RS256" },
  );
}

function githubHeaders(token: string): HeadersInit {
  return {
    Authorization: `Bearer ${token}`,
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };
}

async function githubRequest(
  token: string,
  path: string,
  init?: RequestInit,
): Promise<Response> {
  const response = await fetch(`${GITHUB_API}${path}`, {
    ...init,
    headers: { ...githubHeaders(token), ...init?.headers },
  });
  if (!response.ok) {
    throw new Error(`GitHub API ${path} failed: ${response.status} ${await response.text()}`);
  }
  return response;
}

function githubAppRequest(path: string, init?: RequestInit): Promise<Response> {
  return githubRequest(createAppJwt(), path, init);
}

export async function getInstallationAccessToken(installationId: string): Promise<string> {
  const response = await githubAppRequest(`/app/installations/${installationId}/access_tokens`, {
    method: "POST",
  });
  const data = (await response.json()) as { token: string };
  return data.token;
}

export async function getInstallationAccount(installationId: string): Promise<string> {
  const response = await githubAppRequest(`/app/installations/${installationId}`);
  const data = (await response.json()) as { account: { login: string } };
  return data.account.login;
}

export interface InstallationRepository {
  id: number;
  full_name: string;
  private: boolean;
}

const REPOS_PER_PAGE = 100;

export async function listInstallationRepositories(
  installationId: string,
): Promise<InstallationRepository[]> {
  const token = await getInstallationAccessToken(installationId);
  const repositories: InstallationRepository[] = [];

  for (let page = 1; ; page++) {
    const response = await githubRequest(
      token,
      `/installation/repositories?per_page=${REPOS_PER_PAGE}&page=${page}`,
    );
    const data = (await response.json()) as { repositories: InstallationRepository[] };
    repositories.push(...data.repositories);
    if (data.repositories.length < REPOS_PER_PAGE) break;
  }

  return repositories;
}

export async function exchangeUserCode(code: string): Promise<string> {
  const response = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      client_id: env.githubAppClientId,
      client_secret: env.githubAppClientSecret,
      code,
    }),
  });
  const data = (await response.json()) as {
    access_token?: string;
    error?: string;
    error_description?: string;
  };
  if (!data.access_token) {
    throw new Error(`GitHub OAuth exchange failed: ${data.error_description ?? data.error}`);
  }
  return data.access_token;
}
