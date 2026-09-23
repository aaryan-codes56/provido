import type { Role } from "@prisma/client";
import { auth, currentUser } from "@clerk/nextjs/server";

import { prisma } from "@/lib/prisma";

/**
 * Clerk owns identity (who is this?). We own roles and relations (what can
 * they do, what do they own?) in our own Postgres `User` table, keyed by
 * Clerk's userId. There are two standard ways to keep that table in sync
 * with Clerk:
 *
 *   1. A webhook: Clerk pushes a `user.created` event to an endpoint we
 *      expose, and we insert the row then. Real-time, but needs a public
 *      URL Clerk can reach (annoying for local dev without a tunnel).
 *   2. Lazy sync (what we do here): every time we need "the current app
 *      user," we upsert — insert if missing, update if present. No webhook
 *      infrastructure needed, and it self-heals if a row ever falls out of
 *      sync with Clerk's copy of the email/role.
 *
 * `upsert` is idempotent on the unique `clerkId`, so calling this on every
 * request is safe and cheap (one indexed lookup).
 */
async function getOrCreateUser() {
  const { userId } = await auth();
  if (!userId) return null;

  const clerkUser = await currentUser();
  if (!clerkUser) return null;

  const email = clerkUser.emailAddresses[0]?.emailAddress ?? "";
  const role = (clerkUser.publicMetadata.role as Role | undefined) ?? null;

  return prisma.user.upsert({
    where: { clerkId: userId },
    update: { email, role },
    create: { clerkId: userId, email, role },
  });
}

/** The current app user, or null if signed out. Never throws. */
export async function getCurrentUser() {
  return getOrCreateUser();
}

/** The current app user. Throws if signed out — use in server actions/routes that require auth. */
export async function requireUser() {
  const user = await getOrCreateUser();
  if (!user) {
    throw new Error("You must be signed in to do that.");
  }
  return user;
}

/** The current app user, with a specific role. Throws otherwise — this is the actual authorization check. */
export async function requireRole(role: Role) {
  const user = await requireUser();
  if (user.role !== role) {
    throw new Error(`This action requires the ${role.toLowerCase()} role.`);
  }
  return user;
}
