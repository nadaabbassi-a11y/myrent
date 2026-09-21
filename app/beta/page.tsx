"use client";

import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { PageHero, MARKETING_IMAGES } from "@/components/marketing/page-hero";
import { SiteFooter } from "@/components/marketing/site-footer";
import { useLanguageContext } from "@/contexts/LanguageContext";
import { ArrowRight, Mail, CheckCircle } from "lucide-react";

const OFFER_KEYS = ["offer1", "offer2", "offer3", "offer4"] as const;
const PROFILE_KEYS = ["profile1", "profile2", "profile3"] as const;
const INCLUDE_KEYS = [
  "includesSyndication",
  "includesApplications",
  "includesLease",
  "includesRent",
] as const;

export default function BetaPage() {
  const { t } = useLanguageContext();
  const founderEmail = "nadaabbassi.0012@gmail.com";
  const mailto = `mailto:${founderEmail}?subject=${encodeURIComponent(t("beta.emailSubject"))}`;

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-white">
        <PageHero image={MARKETING_IMAGES.beta} align="center" size="compact">
          <span className="inline-block bg-white/20 text-white text-sm font-medium px-4 py-1.5 rounded-full mb-5 border border-white/30 backdrop-blur-sm">
            {t("beta.badge")} · {t("beta.spotsLeft")}
          </span>
          <h1 className="text-3xl md:text-5xl font-light text-white tracking-tight mb-4">
            {t("beta.title")}
          </h1>
          <p className="text-lg text-white/90 font-light max-w-2xl mx-auto mb-8 leading-relaxed">
            {t("beta.subtitle")}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/auth/signup?role=LANDLORD"
              className="inline-flex items-center justify-center gap-2 bg-white text-neutral-900 hover:bg-neutral-100 font-medium py-3.5 px-7 rounded-xl transition-colors"
            >
              {t("beta.ctaSignup")}
              <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href={mailto}
              className="inline-flex items-center justify-center gap-2 text-white font-medium py-3.5 px-7 rounded-xl border border-white/40 hover:bg-white/10 transition-colors"
            >
              <Mail className="h-4 w-4" />
              {t("beta.ctaEmail")}
            </a>
          </div>
        </PageHero>

        <section className="py-16 md:py-20 bg-stone-50">
          <div className="container mx-auto px-6 max-w-5xl grid md:grid-cols-2 gap-12">
            <div>
              <h2 className="text-xl font-medium text-neutral-900 mb-5">{t("beta.offerTitle")}</h2>
              <ul className="space-y-3">
                {OFFER_KEYS.map((key) => (
                  <li key={key} className="flex gap-2.5 text-neutral-600 text-sm">
                    <CheckCircle className="h-4 w-4 text-neutral-800 flex-shrink-0 mt-0.5" />
                    {t(`beta.${key}`)}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h2 className="text-xl font-medium text-neutral-900 mb-5">{t("beta.profileTitle")}</h2>
              <ul className="space-y-3">
                {PROFILE_KEYS.map((key) => (
                  <li key={key} className="flex gap-2.5 text-neutral-600 text-sm">
                    <CheckCircle className="h-4 w-4 text-neutral-400 flex-shrink-0 mt-0.5" />
                    {t(`beta.${key}`)}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section className="py-14 border-t border-neutral-100">
          <div className="container mx-auto px-6 max-w-4xl">
            <h2 className="text-lg font-medium text-neutral-900 mb-6 text-center">
              {t("beta.includesTitle")}
            </h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {INCLUDE_KEYS.map((key) => (
                <div
                  key={key}
                  className="rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-600"
                >
                  {t(`beta.${key}`)}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-14 text-center border-t border-neutral-100">
          <Link
            href="/auth/signup?role=LANDLORD"
            className="inline-flex items-center gap-2 bg-neutral-900 text-white hover:bg-neutral-800 font-medium py-3.5 px-8 rounded-xl transition-colors"
          >
            {t("beta.ctaSignup")}
            <ArrowRight className="h-4 w-4" />
          </Link>
          <p className="mt-4 text-sm text-neutral-400">{founderEmail}</p>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
