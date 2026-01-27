import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { HtmlLang } from "@/components/html-lang";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "MyRent - Location à long terme",
  description: "Trouvez votre logement idéal pour une location à long terme",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className={inter.className}>
        <Providers>
          {children}
          <HtmlLang />
        </Providers>
      </body>
    </html>
  );
}

