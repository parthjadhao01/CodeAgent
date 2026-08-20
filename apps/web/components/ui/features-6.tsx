import Image from "next/image";
import { Cpu, Lock, Sparkles, Zap } from "lucide-react";

export function Features() {
  return (
    <section className="py-16 md:py-32">
      <div className="mx-auto max-w-5xl space-y-12 px-6">
        <div className="relative z-10 grid items-center gap-4 md:grid-cols-2 md:gap-12">
          <h2 className="text-4xl font-semibold">
            Built for engineers who ship
          </h2>
          <p className="max-w-sm sm:ml-auto">
            Code Agent plans, edits, and tests your task inside its own
            isolated sandbox, then opens a pull request ready for review.
          </p>
        </div>
        <div className="relative overflow-hidden rounded-2xl border">
          <Image
            src="/dashboard.png"
            alt="Code Agent workspace showing progress, browser, agents, editor, changes, and PR tabs"
            width={1627}
            height={967}
            className="w-full"
            priority
          />
          <div className="bg-gradient-to-t from-background pointer-events-none absolute inset-x-0 bottom-0 h-48 to-transparent" />
        </div>
        <div className="relative mx-auto grid grid-cols-2 gap-x-3 gap-y-6 sm:gap-8 lg:grid-cols-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Zap className="size-4" />
              <h3 className="text-sm font-medium">Faaast</h3>
            </div>
            <p className="text-muted-foreground text-sm">
              Tasks run the moment you describe them, no queue, no setup.
            </p>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Cpu className="size-4" />
              <h3 className="text-sm font-medium">Powerful</h3>
            </div>
            <p className="text-muted-foreground text-sm">
              Plans, edits, and tests changes across your codebase end to end.
            </p>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Lock className="size-4" />
              <h3 className="text-sm font-medium">Secure</h3>
            </div>
            <p className="text-muted-foreground text-sm">
              Every task runs in its own disposable sandbox with a
              short-lived, repo-scoped token.
            </p>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Sparkles className="size-4" />
              <h3 className="text-sm font-medium">AI Powered</h3>
            </div>
            <p className="text-muted-foreground text-sm">
              Understands your codebase and opens PRs ready for your review.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
