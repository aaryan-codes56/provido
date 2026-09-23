"use server";

import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireRole } from "@/lib/auth";
import { CATEGORIES } from "@/lib/categories";
import { prisma } from "@/lib/prisma";

export type ListingFormState = { error?: string };

function parseListingForm(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const category = String(formData.get("category") ?? "");
  const imageUrl = String(formData.get("imageUrl") ?? "").trim();
  const price = Number(formData.get("price"));

  if (!title) return { error: "Title is required." } as const;
  if (!description) return { error: "Description is required." } as const;
  if (!(CATEGORIES as readonly string[]).includes(category)) {
    return { error: "Choose a valid category." } as const;
  }
  if (!Number.isFinite(price) || price <= 0) {
    return { error: "Price must be a positive number." } as const;
  }

  return {
    data: {
      title,
      description,
      category,
      // Dollars in the form, cents in the database — see the schema comment.
      priceCents: Math.round(price * 100),
      imageUrl: imageUrl || null,
    },
  } as const;
}

export async function createListing(
  _prevState: ListingFormState,
  formData: FormData,
): Promise<ListingFormState> {
  const user = await requireRole("PROVIDER");

  const parsed = parseListingForm(formData);
  if ("error" in parsed) return { error: parsed.error };

  const listing = await prisma.listing.create({
    data: { ...parsed.data, providerId: user.id },
  });

  revalidatePath("/provider/dashboard");
  redirect(`/listings/${listing.id}`);
}

export async function updateListing(
  listingId: string,
  _prevState: ListingFormState,
  formData: FormData,
): Promise<ListingFormState> {
  const user = await requireRole("PROVIDER");

  const parsed = parseListingForm(formData);
  if ("error" in parsed) return { error: parsed.error };

  // THE authorization check. Not "is this a provider" (requireRole already
  // covered that) but "does THIS provider own THIS listing". Putting
  // providerId directly in the WHERE clause makes it impossible to update a
  // listing you don't own — there's no separate "check, then act" step for
  // a race condition to slip between, because the database itself won't
  // match the row unless both conditions hold.
  const { count } = await prisma.listing.updateMany({
    where: { id: listingId, providerId: user.id },
    data: parsed.data,
  });

  if (count === 0) {
    return { error: "Listing not found, or you don't own it." };
  }

  revalidatePath("/provider/dashboard");
  redirect(`/listings/${listingId}`);
}

export async function deleteListing(listingId: string) {
  const user = await requireRole("PROVIDER");

  try {
    const { count } = await prisma.listing.deleteMany({
      where: { id: listingId, providerId: user.id },
    });

    if (count === 0) {
      throw new Error("Listing not found, or you don't own it.");
    }
  } catch (error) {
    // P2003 = foreign key constraint violation. Order.listingId is required,
    // so Postgres refuses to delete a listing that still has orders
    // pointing at it — that's what stops a delete from silently orphaning
    // someone's order/payment history. We just turn the raw DB error into
    // something a customer-facing toast can actually say.
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2003"
    ) {
      throw new Error(
        "This listing has existing bookings and can't be deleted.",
      );
    }
    throw error;
  }

  revalidatePath("/provider/dashboard");
}
