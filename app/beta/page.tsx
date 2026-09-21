"use client";

import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { useLanguageContext } from "@/contexts/LanguageContext";
import {
  ArrowRight,
  CheckCircle,
  Megaphone,
  FileText,
  Wallet,
  Mail,
  Users,
} from "lucide-react";

const OFFER_KEYS = ["offer1", "offer2", "offer3", "offer4"] as const;
const PROFILE_KEYS = ["profile1", "profile2", "profile3"] as const;
const INCLUDE_KEYS = [
  { key: "includesSyndication", icon: Megaphone },
  { key: "includesApplications", icon: FileText },
  { key: "includesLease", icon: FileText },
  { key: "includesRent", icon: Wallet },
] as const;

export default function BetaPage() {
  const { t } = useLanguageContext();
  const founderEmail = "nadaabbassi.0012@gmail.com";
  const mailto = `mailto:${founderEmail}?subject=${encodeURIComponent(t("beta.emailSubject"))}`;

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-white">
        <section className="wood-pattern py-20 md:py-28">
          <div className="container mx-auto px-6 text-center">
            <span className="inline-block bg-white/20 text-white text-sm font-light tracking-wide px-4 py-1.5 rounded-full mb-6 border border-white/30">
              {t("beta.badge")} · {t("beta.spotsLeft")}
            </span>
            <h1 className="text-4xl md:text-6xl font-light text-white tracking-tight mb-6 drop-shadow-lg max-w-3xl mx-auto">
              {t("beta.title")}
            </h1>
            <p className="text-xl text-white/90 font-light max-w-2xl mx-auto mb-10 leading-relaxed">
              {t("beta.subtitle")}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/auth/signup?role=LANDLORD"
                className="inline-flex items-center justify-center gap-2 bg-white text-neutral-900 hover:bg-neutral-100 font-light text-lg py-4 px-8 rounded-2xl transition-all shadow-xl"
              >
                {t("beta.ctaSignup")}
                <ArrowRight className="h-5 w-5" />
              </Link>
              <a
                href={mailto}
                className="inline-flex items-center justify-center gap-2 text-white font-light text-lg py-4 px-8 rounded-2xl border border-white/40 hover:border-white/70 transition-all"
              >
                <Mail className="h-5 w-5" />
                {t("beta.ctaEmail")}
              </a>
            </div>
          </div>
        </section>

        <section className="py-16 md:py-20">
          <div className="container mx-auto px-6 max-w-5xl">
            <div className="grid md:grid-cols-2 gap-12">
              <div>
                <h2 className="text-2xl md:text-3xl font-light text-neutral-900 mb-6 flex items-center gap-3">
                  <CheckCircle className="h-7 w-7 text-neutral-800" />
                  {t("beta.offerTitle")}
                </h2>
                <ul className="space-y-4">
                  {OFFER_KEYS.map((key) => (
                    <li key={key} className="flex items-start gap-3 text-neutral-700 font-light">
                      <CheckCircle className="h-5 w-5 text-neutral-900 flex-shrink-0 mt-0.5" />
                      {t(`beta.${key}`)}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h2 className="text-2xl md:text-3xl font-light text-neutral-900 mb-6 flex items-center gap-3">
                  <Users className="h-7 w-7 text-neutral-800" />
                  {t("beta.profileTitle")}
                </h2>
                <ul className="space-y-4">
                  {PROFILE_KEYS.map((key) => (
                    <li key={key} className="flex items-start gap-3 text-neutral-700 font-light">
                      <span className="w-6 h-6 rounded-full bg-neutral-100 flex items-center justify-center text-xs text-neutral-600 flex-shrink-0">
                        ✓
                      </span>
                      {t(`beta.${key}`)}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section className="py-12 bg-neutral-50 border-y border-neutral-200">
          <div className="container mx-auto px-6 max-w-4xl">
            <h2 className="text-xl font-light text-neutral-900 mb-8 text-center">
              {t("beta.includesTitle")}
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {INCLUDE_KEYS.map(({ key, icon: Icon }) => (
                <div
                  key={key}
                  className="flex items-center gap-3 bg-white rounded-xl p-4 border border-neutral-100"
                >
                  <Icon className="h-5 w-5 text-neutral-600 flex-shrink-0" />
                  <span className="text-neutral-700 font-light">{t(`beta.${key}`)}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 text-center">
          <div className="container mx-auto px-6">
            <Link
              href="/auth/signup?role=LANDLORD"
              className="inline-flex items-center gap-2 bg-neutral-900 hover:bg-neutral-800 text-white font-light text-lg py-4 px-10 rounded-xl transition-all"
            >
              {t("beta.ctaSignup")}
              <ArrowRight className="h-5 w-5" />
            </Link>
            <p className="mt-6 text-neutral-500 font-light text-sm">
              {founderEmail}
            </p>
          </div>
        </section>
      </main>
    </>
  );
}
