import { headers } from "next/headers";
import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { getStripe } from "@/lib/stripe";

// Why a webhook, and not just the success_url redirect the customer's
// browser follows after paying?
//
// The redirect only tells OUR SERVER what the CUSTOMER'S BROWSER decided to
// do. Nothing stops someone from typing
// "provido.com/checkout/success?session_id=cs_test_123" into their address
// bar without ever paying a cent — the redirect URL is just a URL, not
// proof of anything. The browser could also crash, lose network, or the
// tab could get closed between "payment succeeded" and "redirect finishes"
// — Stripe already has your money at that point, but our server would
// never find out if this webhook didn't exist.
//
// A webhook is Stripe's OWN SERVERS calling ours directly, out of band from
// whatever the customer's browser is doing. We verify the signature Stripe
// attaches (using a secret only Stripe and we know) before trusting the
// payload — that's what stripe.webhooks.constructEvent does below. This is
// the only source of truth this app uses to actually mark an order PAID.
export async function POST(req: Request) {
  const body = await req.text();
  const signature = (await headers()).get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event;
  try {
    event = getStripe().webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET ?? "",
    );
  } catch (error) {
    console.error("Stripe webhook signature verification failed:", error);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object;
      await prisma.order.updateMany({
        where: { stripeCheckoutSessionId: session.id },
        data: {
          status: "PAID",
          stripePaymentIntentId:
            typeof session.payment_intent === "string"
              ? session.payment_intent
              : null,
        },
      });
      break;
    }
    case "checkout.session.expired": {
      const session = event.data.object;
      await prisma.order.updateMany({
        where: { stripeCheckoutSessionId: session.id, status: "PENDING" },
        data: { status: "CANCELLED" },
      });
      break;
    }
    default:
      break;
  }

  return NextResponse.json({ received: true });
}
