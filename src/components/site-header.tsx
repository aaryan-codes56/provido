import { UserButton } from "@clerk/nextjs";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/auth";

// A Server Component: it runs on the server, calls getCurrentUser() (which
// resolves Clerk's session AND hits Postgres for our role) directly, and
// ships none of that logic to the browser. Since we already have `user`
// (null if signed out), we don't need Clerk's own conditional-rendering
// components on top — a plain ternary does the same job with one less API
// to know.
export async function SiteHeader() {
  const user = await getCurrentUser();

  return (
    <header className="border-b border-border bg-surface">
      <div className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between px-6">
        <Link href="/" className="text-lg font-semibold tracking-tight">
          Provido
        </Link>

        <nav className="flex items-center gap-3">
          {!user ? (
            <>
              <Button asChild variant="ghost" size="sm">
                <Link href="/sign-in">Sign in</Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/sign-up">Get started</Link>
              </Button>
            </>
          ) : (
            <>
              {!user.role && (
                <Button asChild variant="secondary" size="sm">
                  <Link href="/onboarding">Complete setup</Link>
                </Button>
              )}
              {user.role === "PROVIDER" && (
                <>
                  <Button asChild variant="ghost" size="sm">
                    <Link href="/provider/listings/new">New listing</Link>
                  </Button>
                  <Button asChild variant="secondary" size="sm">
                    <Link href="/provider/dashboard">Dashboard</Link>
                  </Button>
                </>
              )}
              {user.role === "CUSTOMER" && (
                <Button asChild variant="secondary" size="sm">
                  <Link href="/customer/dashboard">My orders</Link>
                </Button>
              )}
              <UserButton />
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
