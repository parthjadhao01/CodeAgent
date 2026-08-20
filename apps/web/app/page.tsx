import Link from "next/link";
import { Hero } from "@/components/ui/hero-1";
import { Features } from "@/components/ui/features-6";
import { MinimalFooter } from "@/components/ui/minimal-footer";

export default function Page() {
  return (
    <main>
      <header className="absolute inset-x-0 top-0 z-30 flex items-center justify-between px-6 py-5 md:px-8">
        <span className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
          Code Agent
        </span>
        <Link
          href="/code"
          className="text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          Sign in
        </Link>
      </header>
      <Hero
        eyebrow="Autonomous Coding Agent"
        title="Your AI engineer, shipping PRs"
        subtitle="Describe the task. Code Agent plans, edits, and tests it inside its own isolated sandbox — then opens a pull request for you to review."
        ctaLabel="Continue with GitHub"
        ctaHref="/code"
      />
      {/* Companies */}
      <Features />
      <MinimalFooter />
    </main>
  );
}
