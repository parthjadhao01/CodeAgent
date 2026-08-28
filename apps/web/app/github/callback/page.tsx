"use client";

import Link from "next/link";
import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { API_URL, consumeStoredState, setStoredConnection } from "../../../lib/github";

type Status = "verifying" | "connecting" | "error";

function GithubCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<Status>("verifying");
  const [error, setError] = useState<string | null>(null);
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    const code = searchParams.get("code");
    const installationId = searchParams.get("installation_id");
    const setupAction = searchParams.get("setup_action");
    const state = searchParams.get("state");

    const expectedState = consumeStoredState();
    if (!state || state !== expectedState) {
      setStatus("error");
      setError("State mismatch — please try connecting again.");
      return;
    }

    if (!code || !installationId) {
      setStatus("error");
      setError("GitHub did not return the expected code/installation_id.");
      return;
    }

    setStatus("connecting");

    // This attaches an installation to the already-signed-in platform user;
    // it does not create or replace the session. The platform session cookie
    // rides along so the API knows which user to file the credential under.
    fetch(`${API_URL}/api/github/callback`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, installationId, setupAction }),
    })
      .then(async (response) => {
        if (!response.ok) {
          const body = (await response.json()) as { error?: string };
          throw new Error(body.error ?? `Request failed: ${response.status}`);
        }
        return response.json() as Promise<{
          installationId: string;
          accountLogin: string;
        }>;
      })
      .then((data) => {
        setStoredConnection({
          installationId: data.installationId,
          accountLogin: data.accountLogin,
        });
        router.replace("/code");
      })
      .catch((err: unknown) => {
        setStatus("error");
        setError(err instanceof Error ? err.message : "Failed to connect.");
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (status === "error") {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-8 text-center">
        <p className="text-red-500">{error}</p>
        <Link className="underline" href="/">
          Back home
        </Link>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-8 text-center">
      <p>Connecting your GitHub account…</p>
    </main>
  );
}

export default function GithubCallbackPage() {
  return (
    <Suspense fallback={null}>
      <GithubCallbackContent />
    </Suspense>
  );
}
