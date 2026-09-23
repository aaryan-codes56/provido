"use client";

import { Trash2 } from "lucide-react";
import { useTransition } from "react";
import { toast } from "sonner";

import { deleteListing } from "@/app/provider/listings/actions";
import { Button } from "@/components/ui/button";

// deleteListing is a Server Action but it doesn't have to be attached to a
// <form> — it's just an async function marked "use server", so a Client
// Component can call it directly like any other async function. useTransition
// gives us a pending flag for that call without a separate useState.
export function DeleteListingButton({
  listingId,
  title,
}: {
  listingId: string;
  title: string;
}) {
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    if (!window.confirm(`Delete "${title}"? This can't be undone.`)) return;

    startTransition(async () => {
      try {
        await deleteListing(listingId);
        toast.success("Listing deleted.");
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Failed to delete listing.",
        );
      }
    });
  }

  return (
    <Button
      type="button"
      variant="danger"
      size="sm"
      disabled={isPending}
      onClick={handleDelete}
      aria-label={`Delete ${title}`}
    >
      <Trash2 className="h-4 w-4" />
      {isPending ? "Deleting…" : "Delete"}
    </Button>
  );
}
