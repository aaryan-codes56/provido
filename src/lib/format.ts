// Every price in the database is an integer count of cents (see the comment
// in prisma/schema.prisma on why). This is the one place that turns cents
// back into a human-readable dollar string for display.
export function formatPrice(cents: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}
