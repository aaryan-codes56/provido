import { XCircle } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";

export default async function CheckoutCancelPage({
  searchParams,
}: PageProps<"/checkout/cancel">) {
  const params = await searchParams;
  const sessionId =
    typeof params.session_id === "string" ? params.session_id : undefined;

  if (sessionId) {
    await prisma.order.updateMany({
      where: { stripeCheckoutSessionId: sessionId, status: "PENDING" },
      data: { status: "CANCELLED" },
    });
  }

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center gap-4 px-6 py-16 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-danger-bg text-danger">
        <XCircle className="h-7 w-7" />
      </span>
      <h1 className="text-2xl font-semibold tracking-tight">
        Payment cancelled
      </h1>
      <p className="text-muted-foreground">
        No charge was made. You can try again anytime.
      </p>
      <Button asChild variant="secondary">
        <Link href="/">Back to browsing</Link>
      </Button>
    </div>
  );
}
