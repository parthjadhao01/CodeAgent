const STATE_STORAGE_KEY = "github_oauth_state";
const CONNECTED_STORAGE_KEY = "github_connection";

export const API_URL = "http://localhost:3002"

export interface GithubConnection {
  installationId: string;
  accountLogin: string;
}

export interface GithubRepository {
  id: number;
  full_name: string;
  private: boolean;
}

export async function listRepositories(installationId: string): Promise<GithubRepository[]> {
  const response = await fetch(`${API_URL}/api/github/repos?installationId=${installationId}`);
  if (!response.ok) {
    const body = (await response.json()) as { error?: string };
    throw new Error(body.error ?? `Failed to list repositories: ${response.status}`);
  }
  const data = (await response.json()) as { repositories: GithubRepository[] };
  return data.repositories;
}

export function generateState(): string {
  return crypto.randomUUID();
}

export function buildInstallUrl(state: string): string {
  const slug = process.env.NEXT_PUBLIC_GITHUB_APP_SLUG;
  const url = new URL(`https://github.com/apps/${slug}/installations/new`);
  url.searchParams.set("state", state);
  return url.toString();
}

export function startGithubConnect(): void {
  const state = generateState();
  sessionStorage.setItem(STATE_STORAGE_KEY, state);
  window.location.href = buildInstallUrl(state);
}

export function consumeStoredState(): string | null {
  const state = sessionStorage.getItem(STATE_STORAGE_KEY);
  sessionStorage.removeItem(STATE_STORAGE_KEY);
  return state;
}

export function getStoredConnection(): GithubConnection | null {
  const raw = localStorage.getItem(CONNECTED_STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as GithubConnection;
  } catch {
    return null;
  }
}

export function setStoredConnection(connection: GithubConnection): void {
  localStorage.setItem(CONNECTED_STORAGE_KEY, JSON.stringify(connection));
}

export function clearStoredConnection(): void {
  localStorage.removeItem(CONNECTED_STORAGE_KEY);
}
