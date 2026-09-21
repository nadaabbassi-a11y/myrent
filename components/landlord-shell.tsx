"use client";

import { usePathname } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { LandlordNav } from "@/components/landlord-nav";
import { shouldShowLandlordNav } from "@/lib/landlord-nav";

export function LandlordShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const showNav = shouldShowLandlordNav(pathname);

  return (
    <>
      <Navbar />
      {showNav && <LandlordNav />}
      {children}
    </>
  );
}
