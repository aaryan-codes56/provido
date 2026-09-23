"use server";

import type { Role } from "@prisma/client";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";

// A Server Action: a function marked "use server" that a <form> can POST to
// directly. No API route, no client-side fetch call, no JSON serialization
// code to write — Next.js handles all of that. It still runs on the server,
// with full access to secrets and the database, exactly like a route handler.
export async function setRole(role: Role) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("You must be signed in to do that.");
  }

  const client = await clerkClient();

  // The role lives in two places on purpose: Clerk's publicMetadata (so it's
  // available instantly wherever we already have a Clerk session, like the
  // proxy/middleware, without a DB round trip) and our own User row (so it
  // can participate in relations/foreign keys with Listing and Order).
  await client.users.updateUser(userId, { publicMetadata: { role } });

  const clerkUser = await client.users.getUser(userId);
  const email = clerkUser.emailAddresses[0]?.emailAddress ?? "";

  await prisma.user.upsert({
    where: { clerkId: userId },
    update: { role, email },
    create: { clerkId: userId, role, email },
  });

  redirect(role === "PROVIDER" ? "/provider/dashboard" : "/customer/dashboard");
}
