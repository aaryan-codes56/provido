import { clerkMiddleware } from "@clerk/nextjs/server";

// Next.js 16 renamed `middleware.ts` to `proxy.ts` (exported function named
// `proxy`, not `middleware`). clerkMiddleware() just returns a plain request
// handler — it doesn't care what file or export wraps it, so that rename is
// purely a Next.js convention, not a Clerk-specific one.
//
// This file's only job now is to let Clerk attach auth state to the
// request so `auth()`/`currentUser()` work anywhere in the app — it does
// NOT decide who's allowed where. Clerk's own middleware previously
// recommended path-matching (`createRouteMatcher` + `auth.protect()`) for
// that, but now recommends against it: middleware matches on the URL
// pattern, which can silently diverge from Next.js's actual routing (e.g. a
// rewrite could serve a "protected" path through a different route that
// the matcher never sees). We do the real protection check once per area,
// where the code has full context — see src/app/provider/layout.tsx and
// src/app/customer/layout.tsx.
export const proxy = clerkMiddleware();

export const config = {
  matcher: [
    // Skip Next.js internals and static files, unless they're in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
