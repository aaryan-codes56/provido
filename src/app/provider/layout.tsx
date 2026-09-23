import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/auth";

// Every route under /provider is nested inside this layout, so in principle
// this check should run before any of them render. In practice, testing
// this surfaced a real gotcha: Next.js does NOT guarantee a layout's async
// work finishes before its nested page's own async body starts — they can
// run concurrently. A page that only relied on this layout briefly rendered
// its real content (an empty form, in one case we hit) for a signed-out
// request, because the page's own render won the race.
//
// So this layout is defense-in-depth — a safety net for any future route
// added under /provider that forgets its own check — not the sole guard.
// Every page here (dashboard, listings/new, listings/[id]/edit) repeats
// this exact check itself. Mutations (the Server Actions in actions.ts)
// are unaffected by this either way — they run on user action, never race
// a page render, and enforce ownership at the database level regardless.
export default async function ProviderLayout({
  children,
}: LayoutProps<"/provider">) {
  const user = await getCurrentUser();

  if (!user) redirect("/sign-in");
  if (!user.role) redirect("/onboarding");
  if (user.role !== "PROVIDER") redirect("/customer/dashboard");

  return <>{children}</>;
}
