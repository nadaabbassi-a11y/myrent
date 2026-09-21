import { LandlordShell } from "@/components/landlord-shell";

export default function LandlordLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <LandlordShell>{children}</LandlordShell>;
}
