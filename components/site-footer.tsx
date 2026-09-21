"use client";

import Link from "next/link";
import { Logo } from "@/components/logo";
import { useLanguageContext } from "@/contexts/LanguageContext";

export function SiteFooter() {
  const { t } = useLanguageContext();
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-neutral-200 bg-white">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid sm:grid-cols-4 gap-8">
          <div className="sm:col-span-2">
            <Logo size="sm" />
            <p className="mt-3 text-sm text-ink-muted max-w-xs leading-relaxed">
              {t("home.heroSubtitle")}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-ink mb-3">Produit</p>
            <ul className="space-y-2 text-sm text-ink-muted">
              <li><Link href="/#piliers" className="hover:text-ink">{t("home.forLandlords")}</Link></li>
              <li><Link href="/listings" className="hover:text-ink">{t("home.heroSecondary")}</Link></li>
              <li><Link href="/beta" className="hover:text-ink">{t("home.ctaSecondary")}</Link></li>
            </ul>
          </div>
          <div>
            <p className="text-xs font-medium text-ink mb-3">Aide</p>
            <ul className="space-y-2 text-sm text-ink-muted">
              <li><Link href="/faq" className="hover:text-ink">{t("navbar.helpCenter")}</Link></li>
              <li><Link href="/contact" className="hover:text-ink">Contact</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-10 pt-6 border-t border-neutral-200 flex flex-col sm:flex-row justify-between gap-2 text-xs text-ink-subtle">
          <span>© {year} MyRent</span>
          <span>Québec, Canada</span>
        </div>
      </div>
    </footer>
  );
}
