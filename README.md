# Provido

A two-sided service marketplace — providers list services, customers browse,
book, and pay for them. Built as a from-scratch portfolio project with a real
auth/role model, a real payment flow (Stripe, test mode), and a design system
built on intentional tokens rather than defaults.

> Status: **Phase 1 in progress.** This README is updated as each phase lands.

## Tech stack

| Layer          | Choice                                   |
| -------------- | ----------------------------------------- |
| Framework      | Next.js 16 (App Router, Turbopack)        |
| Language       | TypeScript                                |
| Styling        | Tailwind CSS v4 (CSS-based theme, no `tailwind.config.js`) |
| UI primitives  | Hand-rolled components with `class-variance-authority` + `@radix-ui/react-slot` |
| Icons          | lucide-react                              |
| Auth           | Clerk (role-based: provider / customer)   |
| Database       | PostgreSQL + Prisma ORM                   |
| Payments       | Stripe Checkout (test mode)               |
| Deployment     | Vercel + Neon/Railway Postgres            |

## Why these choices

- **Next.js App Router** — Server Components by default, so listing data is
  fetched on the server and never ships unnecessary JS to the browser; Client
  Components are used only where interactivity is actually needed.
- **Prisma + PostgreSQL** — a relational schema fits a marketplace naturally:
  `User → Listing → Order` are linked records with real constraints, not
  documents.
- **Clerk** — handles the hard, security-sensitive parts of auth (password
  storage, sessions, sign-up/sign-in UI) so the project can focus on the part
  that's actually interesting: role-based authorization enforced on the
  server.
- **Stripe Checkout (test mode)** — the app never touches raw card data.
  Stripe hosts the payment page; Provido only ever sees a "this succeeded"
  signal and records an `Order`.

## Design system

Every color, radius, and shadow the app uses is a CSS variable defined once in
[`src/app/globals.css`](src/app/globals.css) and wired into Tailwind via
`@theme inline`. Components reference tokens (`bg-surface`, `text-accent`,
`rounded-lg`) instead of raw hex values or one-off Tailwind colors — so the
entire visual identity can change from one file.

- **Neutrals**: warm off-white background, near-black (not pure black) text.
- **One accent**: a confident indigo-violet (`#5B4FE9`), used sparingly for
  primary actions, links, and active states.
- **Status colors**: distinct success / warning / danger tokens, each paired
  with a soft background for banners and toasts.

## Project structure

```
src/
  app/               Routes (App Router). Each folder is a URL segment;
                      page.tsx is the page, layout.tsx is shared shell.
  components/
    ui/               Generic, reusable primitives (Button, Card, ...) with
                      no business logic — they don't know what a "Listing" is.
    (feature files)   Components that DO know about the domain (ListingCard,
                      BookingForm, etc.), added as each phase builds them.
  lib/                Non-visual code: the Prisma client, the Stripe client,
                      auth helpers, generic utilities (cn()).
```

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

An `.env.example` will be added once Clerk, Prisma, and Stripe are wired up
in later steps — none of that is required yet for the current phase.

## Roadmap

- [x] **Phase 1, Step 0** — Scaffold (Next.js + TypeScript + Tailwind),
      design tokens, base UI primitives.
- [ ] **Phase 1** — Clerk auth with provider/customer roles; providers
      create/edit/delete listings; customers browse and search. Authorization
      enforced on the server, not just hidden in the UI.
- [ ] **Phase 2** — Stripe Checkout (test mode); successful payments recorded
      as `Order`s.
- [ ] **Phase 3** — Provider dashboard (listings + earnings), customer
      dashboard (orders), final UI polish, deployment.

## License

Personal portfolio project — not licensed for reuse.
