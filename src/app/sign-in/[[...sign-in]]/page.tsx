import { SignIn } from "@clerk/nextjs";

// The [[...sign-in]] folder name is a Next.js "optional catch-all" route:
// it matches /sign-in, /sign-in/factor-one, /sign-in/anything — because
// Clerk's <SignIn /> component internally navigates between sub-steps
// (password, verification code, etc.) and needs those nested paths to exist.
export default function SignInPage() {
  return (
    <div className="flex flex-1 items-center justify-center py-16">
      <SignIn />
    </div>
  );
}
