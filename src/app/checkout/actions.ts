"use server";

import { redirect } from "next/navigation";

import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getStripe } from "@/lib/stripe";

export type CheckoutState = { error?: string };

// Called from the listing detail page when a customer clicks "Book & pay".
// We never collect a card number ourselves — Stripe hosts the actual
// payment page (Checkout). Our job is only to describe what's being bought
// and where to send the browser next; Stripe does the rest and tells us
// the outcome afterward (via the webhook in
// src/app/api/webhooks/stripe/route.ts, which is the part that actually
// matters for security — see that file's comment for why).
export async function startCheckout(
  listingId: string,
  _prevState: CheckoutState,
  _formData: FormData,
): Promise<CheckoutState> {
  const user = await requireRole("CUSTOMER");

  const listing = await prisma.listing.findUnique({
    where: { id: listingId },
  });
  if (!listing) {
    return { error: "This listing no longer exists." };
  }

  const origin = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  const session = await getStripe().checkout.sessions.create({
    mode: "payment",
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "usd",
          unit_amount: listing.priceCents,
          product_data: {
            name: listing.title,
            description: listing.description.slice(0, 200),
          },
        },
      },
    ],
    // Stripe substitutes {CHECKOUT_SESSION_ID} with the real session id
    // before redirecting, so both pages can look up which order this was.
    success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/checkout/cancel?session_id={CHECKOUT_SESSION_ID}`,
    metadata: { listingId: listing.id, customerId: user.id },
  });

  if (!session.url) {
    return { error: "Could not start checkout. Please try again." };
  }

  // Recorded as PENDING now, before the customer has paid anything. This
  // gives us a row to flip to PAID/CANCELLED later, and means an abandoned
  // checkout is visible (as "pending") rather than invisible.
  await prisma.order.create({
    data: {
      listingId: listing.id,
      customerId: user.id,
      amountCents: listing.priceCents,
      status: "PENDING",
      stripeCheckoutSessionId: session.id,
    },
  });

  redirect(session.url);
}
