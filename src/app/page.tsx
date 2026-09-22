import { Star } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";

export default function Home() {
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-10 px-6 py-10">
      <header className="flex items-center justify-between">
        <span className="text-lg font-semibold">ServiceHub</span>
        <ThemeToggle />
      </header>

      <section className="flex flex-col gap-3">
        <h1 className="text-3xl font-semibold tracking-tight">
          Design tokens, step 0
        </h1>
        <p className="max-w-xl text-muted-foreground">
          This page exists to prove the token system works before we build
          anything real: neutral surfaces, one accent color, consistent
          radius/shadow, and a light/dark toggle — all driven by CSS
          variables, no per-component overrides.
        </p>
      </section>

      <section className="flex flex-wrap gap-3">
        <Button variant="primary">Primary action</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="danger">Danger</Button>
        <Button variant="primary" disabled>
          Disabled
        </Button>
      </section>

      <section className="grid gap-6 sm:grid-cols-2">
        <article className="flex flex-col gap-3 rounded-lg border border-border bg-surface p-5 shadow-md">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center rounded-sm bg-muted px-2 py-1 text-xs font-medium text-muted-foreground">
              Home Repair
            </span>
            <span className="flex items-center gap-1 text-sm text-muted-foreground">
              <Star className="h-3.5 w-3.5 fill-current text-accent" />
              4.9
            </span>
          </div>
          <h2 className="font-medium">Sample listing card</h2>
          <p className="text-sm text-muted-foreground">
            This is what a service listing will look like — image, category
            tag, rating, price.
          </p>
          <div className="flex items-center justify-between pt-2">
            <span className="text-lg font-semibold">$85</span>
            <Button size="sm" variant="secondary">
              View details
            </Button>
          </div>
        </article>

        <article className="flex flex-col gap-3 rounded-lg border border-border bg-surface p-5 shadow-md">
          <h2 className="font-medium">Status colors</h2>
          <div className="flex flex-col gap-2">
            <div className="rounded-sm bg-success-bg px-3 py-2 text-sm text-success">
              Payment succeeded
            </div>
            <div className="rounded-sm bg-warning-bg px-3 py-2 text-sm text-warning">
              Listing pending review
            </div>
            <div className="rounded-sm bg-danger-bg px-3 py-2 text-sm text-danger">
              Payment failed
            </div>
          </div>
        </article>
      </section>
    </div>
  );
}
