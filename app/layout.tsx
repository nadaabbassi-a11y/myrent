import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { HtmlLang } from "@/components/html-lang";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "MyRent - Location à long terme",
  description: "Trouvez votre logement idéal pour une location à long terme",
  manifest: "/manifest.json",
  themeColor: "#334155",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "MyRent",
  },
  icons: {
    icon: [
      { url: "/icon.svg", sizes: "32x32", type: "image/svg+xml" },
      { url: "/icon-192x192.svg", sizes: "192x192", type: "image/svg+xml" },
      { url: "/icon-512x512.svg", sizes: "512x512", type: "image/svg+xml" },
    ],
    apple: [
      { url: "/apple-touch-icon.svg", sizes: "180x180", type: "image/svg+xml" },
    ],
    shortcut: [
      { url: "/icon.svg", sizes: "32x32", type: "image/svg+xml" },
    ],
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
    viewportFit: "cover",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <head>
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="icon" href="/icon-192x192.svg" type="image/svg+xml" sizes="192x192" />
        <link rel="icon" href="/icon-512x512.svg" type="image/svg+xml" sizes="512x512" />
        <link rel="shortcut icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#334155" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="MyRent" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.svg" />
      </head>
      <body className={inter.className}>
        <Providers>
          {children}
          <HtmlLang />
        </Providers>
      </body>
    </html>
  );
}

