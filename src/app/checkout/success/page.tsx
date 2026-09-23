import { CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getStripe } from "@/lib/stripe";

export default async function CheckoutSuccessPage({
  searchParams,
}: PageProps<"/checkout/success">) {
  const params = await searchParams;
  const sessionId =
    typeof params.session_id === "string" ? params.session_id : undefined;

  const viewer = await getCurrentUser();
  let paid = false;

  if (sessionId) {
    const order = await prisma.order.findUnique({
      where: { stripeCheckoutSessionId: sessionId },
    });

    // Session ids are hard to guess, but they're not secret the way a
    // password is — so we still check that whoever is looking at this page
    // is the same customer the order belongs to, rather than trusting the
    // URL to only ever be seen by its rightful owner.
    if (order && order.customerId !== viewer?.id) {
      notFound();
    }

    if (order?.status === "PAID") {
      paid = true;
    } else {
      // The webhook is the trusted source of truth (see its comment for
      // why) — but in local dev it only fires if the Stripe CLI is
      // forwarding events to localhost, which is easy to forget to run.
      // This is a display-only fallback: ask Stripe directly whether this
      // exact session paid, and self-heal the order if the webhook simply
      // hasn't arrived yet. It never trusts the URL alone.
      const session = await getStripe().checkout.sessions.retrieve(sessionId);
      if (session.payment_status === "paid") {
        await prisma.order.updateMany({
          where: { stripeCheckoutSessionId: sessionId, status: "PENDING" },
          data: {
            status: "PAID",
            stripePaymentIntentId:
              typeof session.payment_intent === "string"
                ? session.payment_intent
                : null,
          },
        });
        paid = true;
      }
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center gap-4 px-6 py-16 text-center">
      {paid ? (
        <>
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-success-bg text-success">
            <CheckCircle2 className="h-7 w-7" />
          </span>
          <h1 className="text-2xl font-semibold tracking-tight">
            Payment successful
          </h1>
          <p className="text-muted-foreground">
            Your booking is confirmed. You&apos;ll find it in your orders.
          </p>
          <Button asChild>
            <Link href="/customer/dashboard">View your orders</Link>
          </Button>
        </>
      ) : (
        <>
          <h1 className="text-2xl font-semibold tracking-tight">
            We&apos;re confirming your payment
          </h1>
          <p className="text-muted-foreground">
            This can take a few seconds. Refresh this page, or check your
            orders shortly.
          </p>
          <Button asChild variant="secondary">
            <Link href="/customer/dashboard">View your orders</Link>
          </Button>
        </>
      )}
    </div>
  );
}
