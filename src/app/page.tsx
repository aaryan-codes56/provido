import { Star } from "lucide-react";

import { Button } from "@/components/ui/button";

const swatches = [
  { name: "background", className: "bg-background border border-border" },
  { name: "surface", className: "bg-surface border border-border" },
  { name: "muted", className: "bg-muted" },
  { name: "accent", className: "bg-accent" },
  { name: "success", className: "bg-success" },
  { name: "warning", className: "bg-warning" },
  { name: "danger", className: "bg-danger" },
];

export default function Home() {
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-16 px-6 py-12">
      <header className="flex items-center justify-between">
        <span className="text-lg font-semibold tracking-tight">Provido</span>
        <span className="text-sm text-muted-foreground">Design system preview</span>
      </header>

      <section className="flex flex-col gap-4">
        <span className="inline-flex w-fit items-center rounded-sm bg-accent-soft px-2.5 py-1 text-xs font-medium text-accent">
          Phase 1 · Step 0
        </span>
        <h1 className="max-w-2xl text-4xl font-semibold tracking-tight sm:text-5xl">
          Book trusted local services, without the guesswork.
        </h1>
        <p className="max-w-xl text-muted-foreground">
          Provido is a two-sided marketplace: providers list what they do,
          customers browse, book, and pay. This page exists to prove the
          design system holds up before we build anything real on top of it.
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
        <article className="flex flex-col gap-3 rounded-lg border border-border bg-surface p-5 shadow-md transition-shadow hover:shadow-lg">
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

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-medium text-muted-foreground">Palette</h2>
        <div className="flex flex-wrap gap-4">
          {swatches.map((swatch) => (
            <div key={swatch.name} className="flex flex-col items-center gap-2">
              <div className={`h-12 w-12 rounded-md ${swatch.className}`} />
              <span className="text-xs text-muted-foreground">{swatch.name}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
