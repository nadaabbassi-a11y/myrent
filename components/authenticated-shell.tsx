"use client";

import { Navbar } from "@/components/navbar";

export function AuthenticatedShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-neutral-50">{children}</main>
    </>
  );
}
