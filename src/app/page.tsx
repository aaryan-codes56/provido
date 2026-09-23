import { Search } from "lucide-react";

import { ListingCard } from "@/components/listing-card";
import { EmptyState } from "@/components/ui/empty-state";
import { CATEGORIES } from "@/lib/categories";
import { prisma } from "@/lib/prisma";

// This page reads `searchParams` (the ?q=...&category=... part of the URL)
// and uses it to filter directly in the Prisma query — there's no client
// JS involved in searching at all. The <form method="GET"> below just
// submits a normal browser navigation to a new URL; this Server Component
// re-runs on the server for that URL and renders the filtered results.
export default async function HomePage({ searchParams }: PageProps<"/">) {
  const params = await searchParams;
  const query = typeof params.q === "string" ? params.q.trim() : "";
  const selectedCategory =
    typeof params.category === "string" ? params.category : "";

  const listings = await prisma.listing.findMany({
    where: {
      ...(query
        ? {
            OR: [
              { title: { contains: query, mode: "insensitive" as const } },
              {
                description: {
                  contains: query,
                  mode: "insensitive" as const,
                },
              },
            ],
          }
        : {}),
      ...(selectedCategory ? { category: selectedCategory } : {}),
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 px-6 py-12">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold tracking-tight">
          Book trusted local services
        </h1>
        <p className="text-muted-foreground">
          Browse listings from providers ready to help.
        </p>
      </div>

      <form method="GET" className="flex flex-wrap gap-3">
        <div className="relative min-w-[200px] flex-1">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <input
            type="search"
            name="q"
            defaultValue={query}
            placeholder="Search services…"
            aria-label="Search services"
            className="h-10 w-full rounded-md border border-border bg-surface pl-9 pr-3 text-sm"
          />
        </div>
        <select
          name="category"
          defaultValue={selectedCategory}
          aria-label="Filter by category"
          className="h-10 rounded-md border border-border bg-surface px-3 text-sm"
        >
          <option value="">All categories</option>
          {CATEGORIES.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="h-10 rounded-md bg-accent px-4 text-sm font-medium text-accent-foreground transition-colors hover:bg-accent-hover"
        >
          Search
        </button>
      </form>

      {listings.length === 0 ? (
        <EmptyState
          icon={Search}
          title="No services found"
          description={
            query || selectedCategory
              ? "Try a different search term or category."
              : "No listings have been published yet — check back soon."
          }
        />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {listings.map((listing) => (
            <ListingCard key={listing.id} {...listing} />
          ))}
        </div>
      )}
    </div>
  );
}
