"use client";

import { useEffect } from "react";

import { Button } from "@/components/ui/button";

// Next.js convention: a file named error.tsx becomes the error boundary for
// its route segment (this one, at the app root, catches anything not
// caught closer to where it happened). It must be a Client Component —
// error boundaries are a React feature that only exists on the client.
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center gap-4 px-6 py-16 text-center">
      <h1 className="text-2xl font-semibold tracking-tight">
        Something went wrong
      </h1>
      <p className="text-muted-foreground">
        {error.message || "An unexpected error occurred."}
      </p>
      <Button onClick={reset}>Try again</Button>
    </div>
  );
}
