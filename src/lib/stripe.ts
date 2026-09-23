import Stripe from "stripe";

// New Stripe(...) validates its API key argument immediately, so
// constructing this eagerly at module scope would throw the instant this
// file is imported — including during `next build`'s page-data collection,
// which loads every route module just to inspect it, long before any
// request actually runs. Deferring construction until first real use means
// a missing key only breaks the one request that needed Stripe, with a
// clear message, instead of breaking the entire build.
let cached: Stripe | undefined;

export function getStripe() {
  if (!cached) {
    const apiKey = process.env.STRIPE_SECRET_KEY;
    if (!apiKey) {
      throw new Error(
        "STRIPE_SECRET_KEY is not set. Add it to .env.local (see .env.example).",
      );
    }
    cached = new Stripe(apiKey);
  }
  return cached;
}
