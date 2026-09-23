import type { OrderStatus } from "@prisma/client";

const STYLES: Record<OrderStatus, string> = {
  PAID: "bg-success-bg text-success",
  PENDING: "bg-warning-bg text-warning",
  CANCELLED: "bg-danger-bg text-danger",
};

const LABELS: Record<OrderStatus, string> = {
  PAID: "Paid",
  PENDING: "Pending",
  CANCELLED: "Cancelled",
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-sm px-2 py-1 text-xs font-medium ${STYLES[status]}`}
    >
      {LABELS[status]}
    </span>
  );
}
