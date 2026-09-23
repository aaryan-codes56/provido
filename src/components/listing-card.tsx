import { ImageOff } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { formatPrice } from "@/lib/format";

export function ListingCard({
  id,
  title,
  category,
  priceCents,
  imageUrl,
}: {
  id: string;
  title: string;
  category: string;
  priceCents: number;
  imageUrl: string | null;
}) {
  return (
    <Link
      href={`/listings/${id}`}
      className="group flex flex-col overflow-hidden rounded-lg border border-border bg-surface shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="relative aspect-[4/3] w-full bg-muted">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={title}
            fill
            className="object-cover transition-transform group-hover:scale-[1.02]"
            sizes="(min-width: 768px) 33vw, 100vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            <ImageOff className="h-6 w-6" />
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <span className="inline-flex w-fit items-center rounded-sm bg-muted px-2 py-1 text-xs font-medium text-muted-foreground">
          {category}
        </span>
        <h3 className="font-medium leading-snug">{title}</h3>
        <span className="mt-auto pt-2 text-lg font-semibold">
          {formatPrice(priceCents)}
        </span>
      </div>
    </Link>
  );
}
