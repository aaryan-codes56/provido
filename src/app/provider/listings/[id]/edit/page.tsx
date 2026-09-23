import { notFound, redirect } from "next/navigation";

import { ListingForm } from "@/components/listing-form";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

import { updateListing } from "../../actions";

export default async function EditListingPage({
  params,
}: PageProps<"/provider/listings/[id]/edit">) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");

  const listing = await prisma.listing.findUnique({ where: { id } });

  // Ownership check for VIEWING the form, not just for submitting it — a
  // provider shouldn't be able to see another provider's listing data
  // pre-filled here at all, let alone save changes to it. notFound() gives
  // a plain 404 rather than a page that leaks "this id exists, you're just
  // not allowed to see it."
  if (!listing || listing.providerId !== user.id) {
    notFound();
  }

  const boundUpdateListing = updateListing.bind(null, listing.id);

  return (
    <div className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-6 px-6 py-12">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">Edit listing</h1>
      </div>
      <ListingForm
        action={boundUpdateListing}
        submitLabel="Save changes"
        initialValues={{
          title: listing.title,
          description: listing.description,
          category: listing.category,
          price: (listing.priceCents / 100).toString(),
          imageUrl: listing.imageUrl ?? "",
        }}
      />
    </div>
  );
}
