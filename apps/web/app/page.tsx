"use client";

import { useEffect, useState } from "react";
import {
  clearStoredConnection,
  getStoredConnection,
  startGithubConnect,
  type GithubConnection,
} from "../lib/github";

export default function Page() {
  const [connection, setConnection] = useState<GithubConnection | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setConnection(getStoredConnection());
    setLoaded(true);
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
