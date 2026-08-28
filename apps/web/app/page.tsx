"use client";

import { useRouter } from "next/navigation";
import { Hero } from "@/components/ui/hero-1";
import { Features } from "@/components/ui/features-6";
import { MinimalFooter } from "@/components/ui/minimal-footer";
import { signIn, useSession } from "next-auth/react";

export default function Page() {
  const router = useRouter();
  const { data: session, status } = useSession();

  // Google is the only way in. Connecting a GitHub App installation happens
  // later, from inside the dashboard, against this signed-in account.
  const handleCta = () => {
    if (session) {
      router.push("/code");
      return;
    }
    void signIn("google", { callbackUrl: "/code" });
  };

  const signedIn = status === "authenticated";

  return (
    <main>
      <header className="absolute inset-x-0 top-0 z-30 flex items-center justify-between px-6 py-5 md:px-8">
        <span className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
          Code Agent
        </span>
        <button
          type="button"
          onClick={handleCta}
          className="text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          {signedIn ? "Dashboard" : "Sign in"}
        </button>
      </header>
      <Hero
        eyebrow="Autonomous Coding Agent"
        title="Your AI engineer, shipping PRs"
        subtitle="Describe the task. Code Agent plans, edits, and tests it inside its own isolated sandbox — then opens a pull request for you to review."
        ctaLabel={signedIn ? "Go to dashboard" : "Continue with Google"}
        onCtaClick={handleCta}
      />
      {/* Companies */}
      <Features />
      <MinimalFooter />
    </main>
  );
}
