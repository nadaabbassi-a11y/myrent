import { AuthenticatedShell } from "@/components/authenticated-shell";

export default function InviteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthenticatedShell>{children}</AuthenticatedShell>;
}
