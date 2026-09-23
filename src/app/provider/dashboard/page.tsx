import { Plus, Wrench } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

import { DeleteListingButton } from "@/components/delete-listing-button";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { getCurrentUser } from "@/lib/auth";
import { formatPrice } from "@/lib/format";
import { prisma } from "@/lib/prisma";

export default async function ProviderDashboardPage() {
  // ProviderLayout (one level up) already checks this — but Next.js doesn't
  // guarantee a layout's own async work finishes before its nested page's
  // body starts running, so a page that renders real data repeats the
  // check itself rather than trusting an ancestor's timing. Redirecting
  // here (instead of calling requireRole, which throws) also means an
  // unauthenticated hit renders a clean redirect instead of our generic
  // error boundary.
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");
  if (user.role !== "PROVIDER") redirect("/customer/dashboard");

  const [listings, earnings] = await Promise.all([
    prisma.listing.findMany({
      where: { providerId: user.id },
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { orders: true } } },
    }),
    // Earnings only count PAID orders — a PENDING order (checkout started
    // but not finished) or CANCELLED one shouldn't show up as money earned.
    prisma.order.aggregate({
      where: { status: "PAID", listing: { providerId: user.id } },
      _sum: { amountCents: true },
    }),
  ]);

  const earningsCents = earnings._sum.amountCents ?? 0;

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-8 px-6 py-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Your listings
          </h1>
          <p className="text-sm text-muted-foreground">
            {listings.length} listing{listings.length === 1 ? "" : "s"} ·{" "}
            {formatPrice(earningsCents)} earned
          </p>
        </div>
        <Button asChild size="sm">
          <Link href="/provider/listings/new">
            <Plus className="h-4 w-4" />
            New listing
          </Link>
        </Button>
      </div>

      {listings.length === 0 ? (
        <EmptyState
          icon={Wrench}
          title="No listings yet"
          description="Create your first listing so customers can find and book it."
          action={
            <Button asChild size="sm">
              <Link href="/provider/listings/new">Create a listing</Link>
            </Button>
          }
        />
      ) : (
        <div className="flex flex-col gap-3">
          {listings.map((listing) => (
            <div
              key={listing.id}
              className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-border bg-surface p-4 shadow-sm"
            >
              <div className="flex flex-col gap-1">
                <Link
                  href={`/listings/${listing.id}`}
                  className="font-medium hover:underline"
                >
                  {listing.title}
                </Link>
                <span className="text-sm text-muted-foreground">
                  {listing.category} · {formatPrice(listing.priceCents)} ·{" "}
                  {listing._count.orders} booking
                  {listing._count.orders === 1 ? "" : "s"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Button asChild variant="secondary" size="sm">
                  <Link href={`/provider/listings/${listing.id}/edit`}>
                    Edit
                  </Link>
                </Button>
                <DeleteListingButton
                  listingId={listing.id}
                  title={listing.title}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
