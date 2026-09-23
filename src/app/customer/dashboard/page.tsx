import { ShoppingBag } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

import { OrderStatusBadge } from "@/components/order-status-badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { getCurrentUser } from "@/lib/auth";
import { formatPrice } from "@/lib/format";
import { prisma } from "@/lib/prisma";

export default async function CustomerDashboardPage() {
  // Same reasoning as provider/dashboard/page.tsx: don't rely solely on the
  // parent layout's timing — check again here, and redirect instead of
  // throwing.
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");
  if (user.role !== "CUSTOMER") redirect("/provider/dashboard");

  const orders = await prisma.order.findMany({
    where: { customerId: user.id },
    orderBy: { createdAt: "desc" },
    include: { listing: true },
  });

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-8 px-6 py-12">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Your orders
        </h1>
        <p className="text-sm text-muted-foreground">
          {orders.length} order{orders.length === 1 ? "" : "s"}
        </p>
      </div>

      {orders.length === 0 ? (
        <EmptyState
          icon={ShoppingBag}
          title="No bookings yet"
          description="Once you book and pay for a service, it'll show up here."
          action={
            <Button asChild size="sm">
              <Link href="/">Browse services</Link>
            </Button>
          }
        />
      ) : (
        <div className="flex flex-col gap-3">
          {orders.map((order) => (
            <div
              key={order.id}
              className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-border bg-surface p-4 shadow-sm"
            >
              <div className="flex flex-col gap-1">
                <Link
                  href={`/listings/${order.listingId}`}
                  className="font-medium hover:underline"
                >
                  {order.listing.title}
                </Link>
                <span className="text-sm text-muted-foreground">
                  {formatPrice(order.amountCents)} ·{" "}
                  {new Date(order.createdAt).toLocaleDateString()}
                </span>
              </div>
              <OrderStatusBadge status={order.status} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
