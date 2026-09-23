# Provido

A two-sided service marketplace — providers list services, customers browse,
book, and pay for them. Built as a from-scratch portfolio project with a real
auth/role model, a real payment flow (Stripe, test mode), and a design system
built on intentional tokens rather than defaults.

## Tech stack

| Layer          | Choice                                                                          |
| -------------- | -------------------------------------------------------------------------------- |
| Framework      | Next.js 16 (App Router, Turbopack)                                              |
| Language       | TypeScript                                                                       |
| Styling        | Tailwind CSS v4 (CSS-based theme, no `tailwind.config.js`)                       |
| UI primitives  | Hand-rolled components with `class-variance-authority` + `@radix-ui/react-slot` |
| Icons          | lucide-react                                                                     |
| Toasts         | sonner                                                                           |
| Auth           | Clerk (role-based: provider / customer)                                         |
| Database       | PostgreSQL + Prisma ORM (v7, driver-adapter based)                              |
| Payments       | Stripe Checkout (test mode) + webhook                                           |
| Deployment     | Vercel + Neon/Railway Postgres                                                   |

## Why these choices

- **Next.js App Router** — Server Components by default, so listing data is
  fetched on the server and never ships unnecessary JS to the browser; Client
  Components are used only where interactivity is actually needed (forms,
  buttons that call Server Actions).
- **Prisma + PostgreSQL** — a relational schema fits a marketplace naturally:
  `User → Listing → Order` are linked records with real foreign keys, not
  documents. Ownership (`Listing.providerId`, `Order.customerId`) is enforced
  directly in query `WHERE` clauses, not just checked in application code.
- **Clerk** — handles the hard, security-sensitive parts of auth (password
  storage, sessions, sign-up/sign-in UI, bot protection on sign-up) so the
  project can focus on the part that's actually interesting: role-based
  authorization enforced on the server. The role itself (`provider` /
  `customer`) is *our* concept, not Clerk's — it's stored in Clerk's
  `publicMetadata` and mirrored into our own `User` table.
- **Stripe Checkout (test mode)** — the app never touches raw card data.
  Stripe hosts the payment page; a webhook (`/api/webhooks/stripe`) is the
  only thing that actually marks an order PAID — never the success-page
  redirect, which is just a URL and proves nothing on its own.

## Design system

Every color, radius, and shadow the app uses is a CSS variable defined once in
[`src/app/globals.css`](src/app/globals.css) and wired into Tailwind via
`@theme inline`. Components reference tokens (`bg-surface`, `text-accent`,
`rounded-lg`) instead of raw hex values or one-off Tailwind colors — so the
entire visual identity can change from one file. Clerk's own hosted
components (sign-in, sign-up, user menu) are themed to match via
`ClerkProvider`'s `appearance` prop in `src/app/layout.tsx`.

- **Neutrals**: warm off-white background, near-black (not pure black) text.
- **One accent**: a confident indigo-violet (`#5B4FE9`), used sparingly for
  primary actions, links, and active states.
- **Status colors**: distinct success / warning / danger tokens, each paired
  with a soft background for banners and toasts.

## Project structure

```
src/
  app/
    (public)         "/" (browse+search), "/listings/[id]"
    sign-in/, sign-up/   Clerk's hosted auth UI
    onboarding/       Role selection after first sign-up
    provider/         Role-gated: dashboard, listing CRUD
    customer/         Role-gated: dashboard (orders)
    checkout/         Stripe Checkout Server Actions + success/cancel pages
    api/webhooks/     Stripe webhook handler
  components/
    ui/               Generic, reusable primitives (Button, EmptyState,
                      Skeleton) with no business logic.
    (feature files)   Components that DO know about the domain
                      (ListingCard, ListingForm, BookButton, ...).
  lib/                Non-visual code: the Prisma client, the Stripe client,
                      auth helpers (getCurrentUser/requireRole), formatters.
  proxy.ts            Next.js 16's renamed middleware — just attaches Clerk's
                      auth context to requests; real authorization happens
                      per-page (see below).
prisma/
  schema.prisma       User / Listing / Order models
  seed.ts             Demo data (see "Seed data" below)
```

### A real gap this surfaced, worth knowing for interviews

Every role-gated area (`/provider/*`, `/customer/*`) has a `layout.tsx` that
checks the signed-in user's role and redirects if it doesn't match. That
looked like enough — until testing against a live browser showed a nested
page's own data-fetching could render *before* its parent layout's redirect
resolved, because Next.js doesn't guarantee a layout finishes before its
child page's async body starts. The practical effect: a signed-out visitor
briefly saw the "New Listing" form. The fix — every sensitive page repeats
the same check itself, not just its layout — is in `src/app/provider/layout.tsx`'s
comment and each page under it.

## Getting started

```bash
npm install
```

Copy `.env.example` to `.env.local` and fill in:

- **Clerk** — create a free app at [dashboard.clerk.com](https://dashboard.clerk.com), copy the publishable + secret keys.
- **`DATABASE_URL`** — a Postgres connection string (local Homebrew Postgres works fine for dev; see below).
- **Stripe** — a test-mode secret key from [dashboard.stripe.com/test/apikeys](https://dashboard.stripe.com/test/apikeys). The webhook secret comes from running the Stripe CLI locally (optional for basic testing — see "Payments" below).

Then:

```bash
npx prisma migrate dev   # create the database schema
npm run db:seed          # optional: populate 5 demo listings + a provider/customer/order
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Local Postgres (if you don't already have one)

```bash
brew install postgresql@16
brew services start postgresql@16
createdb provido_dev
# DATABASE_URL=postgresql://<your-macos-username>@localhost:5432/provido_dev
```

## Payments (Stripe test mode)

Checkout works immediately with just `STRIPE_SECRET_KEY` set — no card
data ever touches this app; Stripe hosts the actual payment page.

The webhook (`STRIPE_WEBHOOK_SECRET`) is what durably marks an order PAID in
production. For local testing, install the
[Stripe CLI](https://docs.stripe.com/stripe-cli) and run:

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

which prints a `whsec_...` value to put in `.env.local`. If you skip this,
the checkout success page still works — it double-checks the session
directly with Stripe as a display-only fallback — but that fallback is not
what a deployed app relies on; the webhook is.

Use [Stripe's test card numbers](https://docs.stripe.com/testing) (e.g.
`4242 4242 4242 4242`, any future expiry, any CVC) to complete a checkout.

## Seed data

`npm run db:seed` populates the database with 5 listings across different
categories, a provider account, a customer account, and one paid order —
so the browse page, search/filter, and dashboards have real data to show
without manually creating it through the UI first. It's safe to re-run
(upserts by a deterministic id).

## Authorization model

- **UI hiding is never the security boundary.** The header only *shows*
  provider-only links to providers — that's a courtesy, not a lock.
- **Every mutation re-checks on the server.** `updateListing`/`deleteListing`
  (in `src/app/provider/listings/actions.ts`) scope their `WHERE` clause to
  `{ id, providerId: user.id }` — it's not "check ownership, then update,"
  it's a single query that simply can't match a row you don't own.
- **Every sensitive page checks itself**, not just its parent layout (see
  above).

## Known limitations / honest scope cuts

- Listing images are a plain URL field — no upload pipeline (S3/Cloudinary).
  A real product would add one.
- No email verification beyond what Clerk's hosted UI provides by default.
- No provider public profile page (name/rating aggregate) — out of scope for
  the core lesson (roles + payments) this project is built around.
- Cloudflare Turnstile (Clerk's bot-detection widget on sign-up) blocks
  *headless* browser automation, including this project's own end-to-end
  test script — which is the intended behavior, not a bug. A real browser
  sails through it normally.

## Roadmap

- [x] **Phase 1** — Clerk auth with provider/customer roles; providers
      create/edit/delete listings; customers browse and search. Authorization
      enforced on the server, not just hidden in the UI.
- [x] **Phase 2** — Stripe Checkout (test mode); successful payments recorded
      as `Order`s via webhook.
- [ ] **Phase 3** — Provider dashboard (listings + earnings) and customer
      dashboard (orders) are built; final polish + production deployment
      still pending.

## License

Personal portfolio project — not licensed for reuse.
