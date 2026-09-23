import { Skeleton } from "@/components/ui/skeleton";

// Next.js convention: loading.tsx renders immediately while the page.tsx in
// the same folder (an async Server Component) is still awaiting data —
// here, the Prisma query in page.tsx. No spinner logic to wire up by hand.
export default function HomeLoading() {
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 px-6 py-12">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-9 w-80" />
        <Skeleton className="h-5 w-64" />
      </div>
      <Skeleton className="h-10 w-full" />
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="flex flex-col gap-3 rounded-lg border border-border p-4"
          >
            <Skeleton className="aspect-[4/3] w-full" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-6 w-16" />
          </div>
        ))}
      </div>
    </div>
  );
}
