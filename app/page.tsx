"use client";

import Link from "next/link";
import { PublicShell } from "@/components/public-shell";
import { HeroPreview } from "@/components/home/hero-preview";
import { ScrollReveal } from "@/components/home/scroll-reveal";
import { useLanguageContext } from "@/contexts/LanguageContext";
import { ArrowRight, Check } from "lucide-react";

const PLATFORMS = ["Kijiji", "Facebook", "LesPAC", "Stripe", "TAL"];

const PIPELINE_STAGES = [
  "pipeline.stages.published",
  "pipeline.stages.leads",
  "pipeline.stages.application",
  "pipeline.stages.lease",
  "pipeline.stages.renting",
] as const;

const PILLARS = [
  {
    titleKey: "home.pillarAdvertiseTitle",
    descKey: "home.pillarAdvertiseDesc",
    items: ["home.pillarAdvertise1", "home.pillarAdvertise2", "home.pillarAdvertise3"],
  },
  {
    titleKey: "home.pillarPaperworkTitle",
    descKey: "home.pillarPaperworkDesc",
    items: ["home.pillarPaperwork1", "home.pillarPaperwork2", "home.pillarPaperwork3"],
  },
  {
    titleKey: "home.pillarManagementTitle",
    descKey: "home.pillarManagementDesc",
    items: ["home.pillarManagement1", "home.pillarManagement2", "home.pillarManagement3"],
  },
] as const;

const STEPS = ["step1", "step2", "step3", "step4", "step5"] as const;

export default function Home() {
  const { t } = useLanguageContext();

  return (
    <PublicShell>
      {/* ── Hero ── */}
      <section className="relative overflow-hidden border-b border-neutral-200">
        <div className="absolute inset-0 hero-grid-bg pointer-events-none" />
        <div className="relative max-w-6xl mx-auto px-6 pt-16 pb-20 md:pt-24 md:pb-28">
          <div className="grid lg:grid-cols-[1fr_420px] gap-12 lg:gap-16 items-center">
            <div>
              <Link
                href="/beta"
                className="inline-flex items-center gap-2 text-xs font-medium text-ink-muted border border-neutral-200 rounded-full px-3 py-1 mb-8 hover:border-neutral-300 hover:text-ink transition-colors"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                {t("home.heroBadge")}
              </Link>

              <h1 className="text-[2.75rem] sm:text-5xl lg:text-[3.5rem] font-semibold tracking-[-0.03em] text-ink leading-[1.08]">
                {t("home.heroTitle")}
                <br />
                <span className="text-neutral-400">{t("home.heroTitleAccent")}</span>
              </h1>

              <p className="mt-6 text-lg text-ink-muted leading-relaxed max-w-lg">
                {t("home.heroSubtitle")}
              </p>

              <div className="mt-9 flex flex-wrap gap-3">
                <Link href="/auth/signup?role=LANDLORD" className="btn-primary-lg">
                  {t("home.heroCta")}
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link href="/listings" className="btn-secondary px-6 py-3 text-[15px]">
                  {t("home.heroSecondary")}
                </Link>
              </div>

              <div className="mt-12 pt-8 border-t border-neutral-200">
                <p className="text-[11px] font-medium uppercase tracking-wider text-ink-subtle mb-3">
                  {t("home.platformsLabel")}
                </p>
                <div className="flex flex-wrap gap-x-6 gap-y-2">
                  {PLATFORMS.map((name) => (
                    <span key={name} className="text-sm font-medium text-ink-muted">
                      {name}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <HeroPreview />
          </div>
        </div>
      </section>

      {/* ── Pipeline ── */}
      <section className="bg-neutral-950 text-white">
        <div className="max-w-6xl mx-auto px-6 py-16 md:py-20">
          <ScrollReveal>
            <div className="md:flex md:items-end md:justify-between gap-8 mb-12">
              <div>
                <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">
                  {t("home.pipelineTitle")}
                </h2>
                <p className="mt-2 text-neutral-400 max-w-md text-sm leading-relaxed">
                  {t("home.pipelineSubtitle")}
                </p>
              </div>
              <Link
                href="/auth/signup?role=LANDLORD"
                className="hidden md:inline-flex items-center gap-1.5 text-sm text-neutral-300 hover:text-white transition-colors mt-4 md:mt-0"
              >
                {t("home.pillarCta")}
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={100}>
            <div className="relative">
              <div className="hidden md:block absolute top-[18px] left-[10%] right-[10%] h-px bg-neutral-700" />
              <div className="grid grid-cols-2 md:grid-cols-5 gap-6 md:gap-4">
                {PIPELINE_STAGES.map((stageKey, i) => (
                  <div key={stageKey} className="relative flex flex-col items-start md:items-center">
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold mb-3 relative z-10 ${
                        i === 0 ? "bg-white text-ink" : "bg-neutral-800 text-neutral-300 ring-1 ring-neutral-700"
                      }`}
                    >
                      {i + 1}
                    </div>
                    <p className="text-sm font-medium text-white md:text-center">{t(stageKey)}</p>
                    {i < PIPELINE_STAGES.length - 1 && (
                      <ArrowRight className="md:hidden h-4 w-4 text-neutral-600 mt-2" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ── Piliers ── */}
      <section id="piliers" className="border-b border-neutral-200">
        <div className="max-w-6xl mx-auto px-6 py-20 md:py-24">
          <ScrollReveal>
            <h2 className="text-2xl md:text-3xl font-semibold text-ink tracking-tight">
              {t("home.pillarsTitle")}
            </h2>
            <p className="mt-2 text-ink-muted max-w-lg">{t("home.pillarsSubtitle")}</p>
          </ScrollReveal>

          <div className="mt-12 grid md:grid-cols-3 gap-6">
            {PILLARS.map(({ titleKey, descKey, items }, idx) => (
              <ScrollReveal key={titleKey} delay={idx * 80}>
                <div className="group h-full rounded-xl border border-neutral-200 p-6 hover:border-neutral-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-300">
                  <div className="w-8 h-1 rounded-full bg-ink mb-5 group-hover:w-12 transition-all duration-300" />
                  <h3 className="text-lg font-semibold text-ink">{t(titleKey)}</h3>
                  <p className="mt-2 text-sm text-ink-muted leading-relaxed">{t(descKey)}</p>
                  <ul className="mt-5 space-y-2.5">
                    {items.map((itemKey) => (
                      <li key={itemKey} className="flex items-start gap-2 text-sm text-ink-muted">
                        <Check className="h-4 w-4 text-ink flex-shrink-0 mt-0.5" strokeWidth={2} />
                        {t(itemKey)}
                      </li>
                    ))}
                  </ul>
                  <Link
                    href="/auth/signup?role=LANDLORD"
                    className="inline-flex items-center gap-1 mt-6 text-sm font-medium text-ink opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    {t("home.pillarCta")}
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pourquoi — bande compacte ── */}
      <section className="bg-neutral-50 border-b border-neutral-200">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <ScrollReveal>
            <h2 className="text-xl font-semibold text-ink mb-8">{t("home.whyTitle")}</h2>
          </ScrollReveal>
          <div className="grid sm:grid-cols-3 gap-8">
            {[
              { title: "home.whySyndicationTitle", desc: "home.whySyndicationDesc" },
              { title: "home.whyTalTitle", desc: "home.whyTalDesc" },
              { title: "home.whyStripeTitle", desc: "home.whyStripeDesc" },
            ].map(({ title, desc }, idx) => (
              <ScrollReveal key={title} delay={idx * 60}>
                <div>
                  <h3 className="text-sm font-semibold text-ink">{t(title)}</h3>
                  <p className="mt-1.5 text-sm text-ink-muted leading-relaxed">{t(desc)}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Étapes ── */}
      <section className="border-b border-neutral-200">
        <div className="max-w-6xl mx-auto px-6 py-20 md:py-24">
          <ScrollReveal>
            <h2 className="text-2xl font-semibold text-ink">{t("home.stepsTitle")}</h2>
            <p className="mt-2 text-ink-muted max-w-lg">{t("home.stepsSubtitle")}</p>
          </ScrollReveal>

          <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {STEPS.map((key, i) => (
              <ScrollReveal key={key} delay={i * 50}>
                <div className="relative p-5 rounded-xl bg-white border border-neutral-200 h-full">
                  <span className="text-3xl font-semibold text-neutral-200 leading-none">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="mt-3 text-sm font-semibold text-ink">{t(`home.${key}Title`)}</h3>
                  <p className="mt-1.5 text-xs text-ink-muted leading-relaxed">
                    {t(`home.${key}Desc`)}
                  </p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Locataires ── */}
      <section className="border-b border-neutral-200 bg-white">
        <div className="max-w-6xl mx-auto px-6 py-12 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
          <div>
            <h3 className="text-base font-semibold text-ink">{t("home.tenantBannerTitle")}</h3>
            <p className="text-sm text-ink-muted mt-1">{t("home.tenantBannerDesc")}</p>
          </div>
          <Link href="/listings" className="btn-secondary whitespace-nowrap shrink-0">
            {t("home.tenantBannerCta")}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="relative overflow-hidden bg-ink">
        <div className="absolute inset-0 hero-grid-bg opacity-[0.07] invert pointer-events-none" />
        <div className="relative max-w-6xl mx-auto px-6 py-20 md:py-24">
          <ScrollReveal>
            <div className="max-w-xl">
              <h2 className="text-2xl md:text-4xl font-semibold text-white tracking-tight leading-tight">
                {t("home.ctaTitle")}
              </h2>
              <p className="mt-4 text-neutral-400 leading-relaxed">{t("home.ctaSubtitle")}</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/auth/signup?role=LANDLORD"
                  className="inline-flex items-center gap-2 bg-white text-ink text-sm font-medium px-6 py-3 rounded-md hover:bg-neutral-100 transition-colors"
                >
                  {t("home.ctaPrimary")}
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/beta"
                  className="inline-flex items-center gap-2 text-neutral-300 hover:text-white text-sm font-medium px-6 py-3 rounded-md border border-neutral-600 hover:border-neutral-400 transition-colors"
                >
                  {t("home.ctaSecondary")}
                </Link>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </PublicShell>
  );
}
