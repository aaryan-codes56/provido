import { redirect } from "next/navigation";

import { ListingForm } from "@/components/listing-form";
import { getCurrentUser } from "@/lib/auth";

import { createListing } from "../actions";

export default async function NewListingPage() {
  // ProviderLayout checks this too, but — as provider/dashboard/page.tsx's
  // comment explains — a nested page's own async body can run before an
  // ancestor layout's redirect takes effect, so every page that renders
  // real (or, here, sensitive-to-show) content checks for itself too.
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");
  if (user.role !== "PROVIDER") redirect("/customer/dashboard");

  return (
    <div className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-6 px-6 py-12">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">New listing</h1>
        <p className="text-sm text-muted-foreground">
          This is what customers will see when they browse.
        </p>
      </div>
      <ListingForm action={createListing} submitLabel="Publish listing" />
    </div>
  );
}
