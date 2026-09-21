import { PublicShell } from "@/components/public-shell";

export default function CoApplicantLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <PublicShell footer={false}>{children}</PublicShell>;
}
