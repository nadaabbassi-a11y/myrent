import { PublicShell } from "@/components/public-shell";

export default function ListingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <PublicShell footer={false}>{children}</PublicShell>;
}
