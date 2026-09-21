"use client";

import Link from "next/link";
import { PublicShell } from "@/components/public-shell";
import { useLanguageContext } from "@/contexts/LanguageContext";
import { ArrowRight, Mail } from "lucide-react";

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
    <PublicShell>
      <section className="border-b border-neutral-200">
        <div className="max-w-3xl mx-auto px-6 py-16 md:py-20 text-center">
          <p className="text-sm text-ink-muted mb-3">
            {t("beta.badge")} · {t("beta.spotsLeft")}
          </p>
          <h1 className="text-3xl md:text-4xl font-semibold text-ink tracking-tight mb-4">
            {t("beta.title")}
          </h1>
          <p className="text-ink-muted leading-relaxed mb-8">{t("beta.subtitle")}</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/auth/signup?role=LANDLORD" className="btn-primary">
              {t("beta.ctaSignup")}
              <ArrowRight className="h-4 w-4" />
            </Link>
            <a href={mailto} className="btn-secondary">
              <Mail className="h-4 w-4" />
              {t("beta.ctaEmail")}
            </a>
          </div>
        </div>
      </section>

      <section className="border-b border-neutral-200 bg-neutral-50">
        <div className="max-w-5xl mx-auto px-6 py-14 grid md:grid-cols-2 gap-12">
          <div>
            <h2 className="text-base font-semibold text-ink mb-4">{t("beta.offerTitle")}</h2>
            <ul className="space-y-3">
              {OFFER_KEYS.map((key) => (
                <li key={key} className="text-sm text-ink-muted">{t(`beta.${key}`)}</li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="text-base font-semibold text-ink mb-4">{t("beta.profileTitle")}</h2>
            <ul className="space-y-3">
              {PROFILE_KEYS.map((key) => (
                <li key={key} className="text-sm text-ink-muted">{t(`beta.${key}`)}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="border-b border-neutral-200">
        <div className="max-w-5xl mx-auto px-6 py-14">
          <h2 className="text-base font-semibold text-ink mb-6">{t("beta.includesTitle")}</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {INCLUDE_KEYS.map((key) => (
              <div key={key} className="surface-card px-4 py-3 text-sm text-ink-muted">
                {t(`beta.${key}`)}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-14 text-center">
        <Link href="/auth/signup?role=LANDLORD" className="btn-primary">
          {t("beta.ctaSignup")}
          <ArrowRight className="h-4 w-4" />
        </Link>
        <p className="mt-4 text-sm text-ink-subtle">{founderEmail}</p>
      </section>
    </PublicShell>
  );
}
