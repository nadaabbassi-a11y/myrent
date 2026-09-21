"use client";

import { Navbar } from "@/components/navbar";
import { SiteFooter } from "@/components/site-footer";

interface PublicShellProps {
  children: React.ReactNode;
  footer?: boolean;
}

export function PublicShell({ children, footer = true }: PublicShellProps) {
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-white">{children}</div>
      {footer && <SiteFooter />}
    </>
  );
}
