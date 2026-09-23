import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Geist } from "next/font/google";
import { Toaster } from "sonner";

import { SiteHeader } from "@/components/site-header";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Provido — Book trusted local services",
  description:
    "A two-sided marketplace where providers list services and customers book and pay for them.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <ClerkProvider
      appearance={{
        variables: {
          colorPrimary: "#5b4fe9",
          colorForeground: "#18181b",
          colorBackground: "#ffffff",
          borderRadius: "0.625rem",
        },
      }}
    >
      <html lang="en" className={`${geistSans.variable} h-full antialiased`}>
        <body className="min-h-full flex flex-col">
          <SiteHeader />
          {children}
          <Toaster
            position="bottom-right"
            toastOptions={{
              classNames: {
                toast: "!bg-surface !border-border !text-foreground",
                error: "!text-danger",
                success: "!text-success",
              },
            }}
          />
        </body>
      </html>
    </ClerkProvider>
  );
}
