import { ShoppingBag, Wrench } from "lucide-react";
import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/auth";

import { setRole } from "./actions";

export default async function OnboardingPage() {
  const user = await getCurrentUser();

  // Now that route protection isn't handled by middleware path-matching
  // (see src/proxy.ts), this page enforces its own "must be signed in" —
  // same pattern as provider/layout.tsx and customer/layout.tsx.
  if (!user) redirect("/sign-in");

  // Already onboarded? Don't show this page again — send them where they belong.
  if (user.role === "PROVIDER") redirect("/provider/dashboard");
  if (user.role === "CUSTOMER") redirect("/customer/dashboard");

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-6 py-16">
      <div className="flex flex-col gap-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">
          How will you use Provido?
        </h1>
        <p className="text-muted-foreground">
          This decides what you&apos;ll see next. You can&apos;t switch
          later in this demo — a real product would let support change it
          manually.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <form action={setRole.bind(null, "CUSTOMER")}>
          <button
            type="submit"
            className="flex h-full w-full flex-col items-start gap-3 rounded-lg border border-border bg-surface p-6 text-left shadow-sm transition-colors hover:bg-surface-hover"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-md bg-accent-soft text-accent">
              <ShoppingBag className="h-5 w-5" />
            </span>
            <span className="font-medium">I&apos;m a customer</span>
            <span className="text-sm text-muted-foreground">
              Browse services, book, and pay providers.
            </span>
            <span className="mt-2 inline-flex h-8 items-center rounded-md bg-accent px-3 text-sm font-medium text-accent-foreground">
              Continue as customer
            </span>
          </button>
        </form>

        <form action={setRole.bind(null, "PROVIDER")}>
          <button
            type="submit"
            className="flex h-full w-full flex-col items-start gap-3 rounded-lg border border-border bg-surface p-6 text-left shadow-sm transition-colors hover:bg-surface-hover"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-md bg-accent-soft text-accent">
              <Wrench className="h-5 w-5" />
            </span>
            <span className="font-medium">I&apos;m a provider</span>
            <span className="text-sm text-muted-foreground">
              List services you offer and earn from bookings.
            </span>
            <span className="mt-2 inline-flex h-8 items-center rounded-md bg-accent px-3 text-sm font-medium text-accent-foreground">
              Continue as provider
            </span>
          </button>
        </form>
      </div>
    </div>
  );
}
