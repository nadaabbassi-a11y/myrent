"use client";

import Link from "next/link";
import { Logo } from "@/components/logo";
import { useLanguageContext } from "@/contexts/LanguageContext";

export function SiteFooter() {
  const { t } = useLanguageContext();
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-neutral-200 bg-white">
      <div className="container mx-auto px-6 py-12">
        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-8">
          <div className="sm:col-span-2">
            <Logo size="sm" />
            <p className="mt-3 text-sm text-neutral-500 max-w-xs leading-relaxed">
              {t("home.heroSubtitle")}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-neutral-900 uppercase tracking-wide mb-3">
              Produit
            </p>
            <ul className="space-y-2 text-sm text-neutral-600">
              <li>
                <Link href="/#piliers" className="hover:text-neutral-900">
                  {t("home.forLandlords")}
                </Link>
              </li>
              <li>
                <Link href="/listings" className="hover:text-neutral-900">
                  {t("home.heroSecondary")}
                </Link>
              </li>
              <li>
                <Link href="/beta" className="hover:text-neutral-900">
                  {t("home.ctaSecondary")}
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <p className="text-xs font-medium text-neutral-900 uppercase tracking-wide mb-3">
              Aide
            </p>
            <ul className="space-y-2 text-sm text-neutral-600">
              <li>
                <Link href="/faq" className="hover:text-neutral-900">
                  {t("navbar.helpCenter")}
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-neutral-900">
                  Contact
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <p className="mt-10 pt-6 border-t border-neutral-100 text-xs text-neutral-400">
          © {year} MyRent · Québec
        </p>
      </div>
    </footer>
  );
}
