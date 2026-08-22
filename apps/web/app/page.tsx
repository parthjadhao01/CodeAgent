"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Hero } from "@/components/ui/hero-1";
import { Features } from "@/components/ui/features-6";
import { MinimalFooter } from "@/components/ui/minimal-footer";
import { getStoredConnection, startGithubConnect } from "@/lib/github";

export default function Page() {
  const router = useRouter();
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    setConnected(getStoredConnection() !== null);
  }, []);

  const handleConnect = () => {
    if (connected) {
      router.push("/code");
      return;
    }
    startGithubConnect();
  };

  return (
    <main>
      <header className="absolute inset-x-0 top-0 z-30 flex items-center justify-between px-6 py-5 md:px-8">
        <span className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
          Code Agent
        </span>
        <button
          type="button"
          onClick={handleConnect}
          className="text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          {connected ? "Dashboard" : "Sign in"}
        </button>
      </header>
      <Hero
        eyebrow="Autonomous Coding Agent"
        title="Your AI engineer, shipping PRs"
        subtitle="Describe the task. Code Agent plans, edits, and tests it inside its own isolated sandbox — then opens a pull request for you to review."
        ctaLabel={connected ? "Go to dashboard" : "Continue with GitHub"}
        onCtaClick={handleConnect}
      />
      {/* Companies */}
      <Features />
      <MinimalFooter />
    </main>
  );
}
