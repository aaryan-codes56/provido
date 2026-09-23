"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { CATEGORIES } from "@/lib/categories";
import type { ListingFormState } from "@/app/provider/listings/actions";

type ListingFormValues = {
  title: string;
  description: string;
  category: string;
  price: string;
  imageUrl: string;
};

// Shared by both the "create listing" and "edit listing" pages — the only
// difference between them is which server action gets passed in.
//
// useActionState(action, initialState) is a React 19 hook purpose-built for
// exactly this: it wires a <form> up to a Server Action and gives back
// [state, formAction, isPending]. `state` is whatever the action last
// returned (here, {error?: string}); `isPending` flips to true the instant
// the form submits and back to false once the action finishes — no manual
// useState/onSubmit/fetch wiring required.
export function ListingForm({
  action,
  submitLabel,
  initialValues,
}: {
  action: (
    prevState: ListingFormState,
    formData: FormData,
  ) => Promise<ListingFormState>;
  submitLabel: string;
  initialValues?: ListingFormValues;
}) {
  const [state, formAction, isPending] = useActionState(action, {});

  return (
    <form action={formAction} className="flex flex-col gap-5">
      {state.error && (
        <p
          role="alert"
          className="rounded-sm bg-danger-bg px-3 py-2 text-sm text-danger"
        >
          {state.error}
        </p>
      )}

      <div className="flex flex-col gap-1.5">
        <label htmlFor="title" className="text-sm font-medium">
          Title
        </label>
        <input
          id="title"
          name="title"
          required
          defaultValue={initialValues?.title}
          disabled={isPending}
          className="h-10 rounded-md border border-border bg-surface px-3 text-sm disabled:opacity-50"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="description" className="text-sm font-medium">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          required
          rows={4}
          defaultValue={initialValues?.description}
          disabled={isPending}
          className="rounded-md border border-border bg-surface px-3 py-2 text-sm disabled:opacity-50"
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="category" className="text-sm font-medium">
            Category
          </label>
          <select
            id="category"
            name="category"
            required
            defaultValue={initialValues?.category ?? ""}
            disabled={isPending}
            className="h-10 rounded-md border border-border bg-surface px-3 text-sm disabled:opacity-50"
          >
            <option value="" disabled>
              Select a category
            </option>
            {CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="price" className="text-sm font-medium">
            Price (USD)
          </label>
          <input
            id="price"
            name="price"
            type="number"
            min="1"
            step="0.01"
            required
            defaultValue={initialValues?.price}
            disabled={isPending}
            className="h-10 rounded-md border border-border bg-surface px-3 text-sm disabled:opacity-50"
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="imageUrl" className="text-sm font-medium">
          Image URL <span className="text-muted-foreground">(optional)</span>
        </label>
        <input
          id="imageUrl"
          name="imageUrl"
          type="url"
          placeholder="https://..."
          defaultValue={initialValues?.imageUrl}
          disabled={isPending}
          className="h-10 rounded-md border border-border bg-surface px-3 text-sm disabled:opacity-50"
        />
      </div>

      <Button type="submit" disabled={isPending} className="w-fit">
        {isPending ? "Saving…" : submitLabel}
      </Button>
    </form>
  );
}
