import { ImageOff } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { startCheckout } from "@/app/checkout/actions";
import { BookButton } from "@/components/book-button";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/auth";
import { formatPrice } from "@/lib/format";
import { prisma } from "@/lib/prisma";

export default async function ListingDetailPage({
  params,
}: PageProps<"/listings/[id]">) {
  const { id } = await params;

  const listing = await prisma.listing.findUnique({ where: { id } });
  if (!listing) notFound();

  const user = await getCurrentUser();
  const isOwner = user?.id === listing.providerId;

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-6 py-12">
      <div className="relative aspect-[16/9] w-full overflow-hidden rounded-lg bg-muted">
        {listing.imageUrl ? (
          <Image
            src={listing.imageUrl}
            alt={listing.title}
            fill
            className="object-cover"
            sizes="768px"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            <ImageOff className="h-8 w-8" />
          </div>
        )}
      </div>

      <div className="flex flex-col gap-3">
        <span className="inline-flex w-fit items-center rounded-sm bg-muted px-2 py-1 text-xs font-medium text-muted-foreground">
          {listing.category}
        </span>
        <h1 className="text-2xl font-semibold tracking-tight">
          {listing.title}
        </h1>
        <p className="whitespace-pre-line text-muted-foreground">
          {listing.description}
        </p>
      </div>

      <div className="flex flex-col gap-3 rounded-lg border border-border bg-surface p-5 shadow-md sm:max-w-xs">
        <span className="text-2xl font-semibold">
          {formatPrice(listing.priceCents)}
        </span>

        {isOwner ? (
          <Button asChild variant="secondary">
            <Link href={`/provider/listings/${listing.id}/edit`}>
              This is your listing — edit it
            </Link>
          </Button>
        ) : !user ? (
          <Button asChild>
            <Link href="/sign-in">Sign in to book</Link>
          </Button>
        ) : !user.role ? (
          <Button asChild>
            <Link href="/onboarding">Finish setup to book</Link>
          </Button>
        ) : user.role === "PROVIDER" ? (
          <p className="text-sm text-muted-foreground">
            Provider accounts can&apos;t book services.
          </p>
        ) : (
          <BookButton
            action={startCheckout.bind(null, listing.id)}
            priceLabel={formatPrice(listing.priceCents)}
          />
        )}
      </div>
    </div>
  );
}
