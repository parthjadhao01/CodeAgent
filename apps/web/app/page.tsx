"use client";

import { useEffect, useState } from "react";
import {
  clearStoredConnection,
  getStoredConnection,
  listRepositories,
  startGithubConnect,
  type GithubConnection,
  type GithubRepository,
} from "../lib/github";

export default function Page() {
  const [connection, setConnection] = useState<GithubConnection | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [repos, setRepos] = useState<GithubRepository[] | null>(null);
  const [reposError, setReposError] = useState<string | null>(null);

  useEffect(() => {
    const stored = getStoredConnection();
    setConnection(stored);
    setLoaded(true);

    if (stored) {
      listRepositories(stored.installationId)
        .then(setRepos)
        .catch((error: unknown) => {
          setReposError(error instanceof Error ? error.message : "Failed to list repositories.");
        });
    }
  }, []);

  if (!loaded) {
    return null;
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-8 text-center">
      {connection ? (
        <>
          <p>
            Connected as <strong>{connection.accountLogin}</strong>
          </p>
          <p className="text-sm text-neutral-500">
            Installation ID: {connection.installationId}
          </p>
          <a
            className="underline"
            href={`https://github.com/settings/installations/${connection.installationId}`}
            rel="noopener noreferrer"
            target="_blank"
          >
            Manage on GitHub
          </a>
          <button
            className="text-sm text-neutral-500 underline"
            onClick={() => {
              clearStoredConnection();
              setConnection(null);
            }}
            type="button"
          >
            Disconnect
          </button>
          {reposError ? (
            <p className="text-sm text-red-500">{reposError}</p>
          ) : (
            <ul className="text-sm text-neutral-500">
              {repos === null
                ? "Loading repositories…"
                : repos.length === 0
                  ? "No repositories found."
                  : repos.map((repo) => <li key={repo.id}>{repo.full_name}</li>)}
            </ul>
          )}
        </>
      ) : (
        <button
          className="rounded-md bg-black px-4 py-2 text-white dark:bg-white dark:text-black"
          onClick={startGithubConnect}
          type="button"
        >
          Connect GitHub
        </button>
      )}
    </main>
  );
}
