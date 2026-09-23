"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import type { CheckoutState } from "@/app/checkout/actions";

export function BookButton({
  action,
  priceLabel,
}: {
  action: (
    prevState: CheckoutState,
    formData: FormData,
  ) => Promise<CheckoutState>;
  priceLabel: string;
}) {
  const [state, formAction, isPending] = useActionState(action, {});

  return (
    <form action={formAction} className="flex flex-col gap-2">
      {state.error && (
        <p
          role="alert"
          className="rounded-sm bg-danger-bg px-3 py-2 text-sm text-danger"
        >
          {state.error}
        </p>
      )}
      <Button type="submit" size="lg" disabled={isPending} className="w-full">
        {isPending ? "Redirecting to checkout…" : `Book & pay ${priceLabel}`}
      </Button>
    </form>
  );
}
