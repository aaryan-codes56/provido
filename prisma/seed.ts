// Development-only seed data — real accounts always come through Clerk;
// this just gives a fresh database something to look at (browsing, search,
// dashboards) without manually signing up and creating listings by hand
// every time you reset the database. Uses fake clerkIds, so these rows
// never correspond to a real, signable-in Clerk user — that's fine, this
// script is never run in production.
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { config } from "dotenv";

// This script runs standalone via tsx, outside Next.js, so it has to load
// .env.local itself (Next.js normally does this for us) and set up its own
// client the same way src/lib/prisma.ts does — see that file's comment for
// why Prisma 7 needs an explicit adapter.
config({ path: ".env.local" });

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  const provider = await prisma.user.upsert({
    where: { clerkId: "seed_provider_1" },
    update: {},
    create: {
      clerkId: "seed_provider_1",
      email: "seed-provider@example.com",
      role: "PROVIDER",
    },
  });

  const customer = await prisma.user.upsert({
    where: { clerkId: "seed_customer_1" },
    update: {},
    create: {
      clerkId: "seed_customer_1",
      email: "seed-customer@example.com",
      role: "CUSTOMER",
    },
  });

  const listingData = [
    {
      title: "Deep House Cleaning",
      description:
        "A thorough top-to-bottom clean for your home, including kitchen, bathrooms, and all common areas. Bring your own supplies or ask about eco-friendly options.",
      category: "Cleaning",
      priceCents: 12000,
      imageUrl:
        "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800",
    },
    {
      title: "Leaky Faucet & Plumbing Repair",
      description:
        "Fast, reliable fixes for leaky faucets, running toilets, and minor plumbing issues. Licensed and insured.",
      category: "Home Repair",
      priceCents: 8500,
      imageUrl:
        "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800",
    },
    {
      title: "SAT Math Tutoring (1-on-1)",
      description:
        "One-on-one SAT math prep with a certified tutor. Practice tests, targeted review, and score tracking included.",
      category: "Tutoring",
      priceCents: 6000,
      imageUrl:
        "https://images.unsplash.com/photo-1509228468518-180dd4864904?w=800",
    },
    {
      title: "Portrait Photography Session",
      description:
        "A one-hour outdoor portrait session with 20 edited digital photos delivered within a week.",
      category: "Photography",
      priceCents: 15000,
      imageUrl:
        "https://images.unsplash.com/photo-1554048612-b6a482bc67e5?w=800",
    },
    {
      title: "Logo & Brand Identity Design",
      description:
        "A custom logo, color palette, and typography system for your business, delivered as a brand guide.",
      category: "Design",
      priceCents: 35000,
      imageUrl: null,
    },
  ];

  const listings = [];
  for (const data of listingData) {
    const listing = await prisma.listing.upsert({
      where: { id: `seed_${data.title.toLowerCase().replace(/[^a-z0-9]+/g, "_")}` },
      update: data,
      create: {
        id: `seed_${data.title.toLowerCase().replace(/[^a-z0-9]+/g, "_")}`,
        providerId: provider.id,
        ...data,
      },
    });
    listings.push(listing);
  }

  // One paid order so the customer dashboard and provider earnings aren't
  // both permanently stuck in their empty states.
  await prisma.order.upsert({
    where: { stripeCheckoutSessionId: "seed_session_1" },
    update: {},
    create: {
      listingId: listings[0].id,
      customerId: customer.id,
      amountCents: listings[0].priceCents,
      status: "PAID",
      stripeCheckoutSessionId: "seed_session_1",
    },
  });

  console.log(`Seeded ${listings.length} listings, 1 provider, 1 customer, 1 paid order.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
