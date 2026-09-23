import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

// Prisma 7 dropped its built-in Rust query engine binary; the client now
// talks to Postgres through a "driver adapter" — a thin wrapper around the
// plain `pg` (node-postgres) library — that we construct and hand it
// ourselves. That's why DATABASE_URL is passed here, not read automatically.
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });

// Next.js hot-reloads modules in dev, which would otherwise create a fresh
// PrismaClient (and a fresh pool of DB connections) on every file save. We
// stash the client on the global object so dev reloads reuse the same one.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
