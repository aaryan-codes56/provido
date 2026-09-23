import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/auth";

// Mirrors src/app/provider/layout.tsx — same server-side pattern, opposite role.
export default async function CustomerLayout({
  children,
}: LayoutProps<"/customer">) {
  const user = await getCurrentUser();

  if (!user) redirect("/sign-in");
  if (!user.role) redirect("/onboarding");
  if (user.role !== "CUSTOMER") redirect("/provider/dashboard");

  return <>{children}</>;
}
