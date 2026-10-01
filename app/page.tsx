"use client";

import Link from "next/link";
import Image from "next/image";
import { Navbar } from "@/components/navbar";
import { PageHero, MARKETING_IMAGES } from "@/components/marketing/page-hero";
import { SiteFooter } from "@/components/marketing/site-footer";
import { useLanguageContext } from "@/contexts/LanguageContext";
import {
  IconCard,
  IconChevron,
  IconClipboard,
  IconIdCard,
  IconKey,
  IconScreen,
  IconTick,
} from "@/components/marketing/icons";
import { useEffect, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";

const PIPELINE_STAGES = [
  "home.stageDossier",
  "home.stageCredit",
  "home.stageLease",
  "home.stageFollow",
] as const;

const STEPS = ["step1", "step2", "step3", "step4", "step5"] as const;

const PILLARS = [
  {
    key: "Dossier",
    icon: IconClipboard,
    titleKey: "home.pillarAdvertiseTitle",
    descKey: "home.pillarAdvertiseDesc",
    bullets: ["home.pillarAdvertise1", "home.pillarAdvertise2", "home.pillarAdvertise3"],
    href: "/auth/signup?role=LANDLORD",
  },
  {
    key: "Credit",
    icon: IconIdCard,
    titleKey: "home.pillarPaperworkTitle",
    descKey: "home.pillarPaperworkDesc",
    bullets: ["home.pillarPaperwork1", "home.pillarPaperwork2", "home.pillarPaperwork3"],
    href: "/auth/signup?role=LANDLORD",
  },
  {
    key: "Suivi",
    icon: IconKey,
    titleKey: "home.pillarManagementTitle",
    descKey: "home.pillarManagementDesc",
    bullets: ["home.pillarManagement1", "home.pillarManagement2", "home.pillarManagement3"],
    href: "/auth/signup?role=LANDLORD",
  },
] as const;

export default function Home() {
  const { t } = useLanguageContext();
  const { user } = useAuth();
  const sectionRefs = useRef<(HTMLElement | null)[]>([]);
  const startHref = user
    ? user.role === "LANDLORD"
      ? "/landlord"
      : "/tenant"
    : "/auth/signup?role=LANDLORD";
  const tenantHref = user?.role === "TENANT" ? "/tenant" : "/auth/signup?role=TENANT";

  useEffect(() => {
    if (typeof window === "undefined") return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("revealed");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2, rootMargin: "0px 0px -12% 0px" }
    );

    document.querySelectorAll(".scroll-reveal-fade, .scroll-reveal-stagger").forEach((el) => {
      observer.observe(el);
    });
    sectionRefs.current.forEach((ref) => ref && observer.observe(ref));

    return () => observer.disconnect();
  }, []);

  return (
    <>
      <Navbar />
      <main className="min-h-screen">
        <PageHero images={MARKETING_IMAGES.homeCarousel} slideInterval={8000}>
          <p className="text-white/80 text-base md:text-lg font-medium tracking-wide mb-4">
            {t("home.eyebrow")}
          </p>
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-light text-white leading-[1.05] tracking-tight mb-6">
            {t("home.heroTitle")}{" "}
            <span className="font-normal text-white/85">{t("home.heroTitleAccent")}</span>
          </h1>
          <p className="text-xl md:text-2xl text-white/90 font-light leading-snug mb-10 max-w-3xl">
            {t("home.heroSubtitle")}
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href={startHref}
              className="inline-flex items-center justify-center gap-2 bg-white text-neutral-900 hover:bg-neutral-100 font-medium text-lg py-4 px-8 rounded-xl transition-colors"
            >
              {user ? t("home.myLocations") : t("home.heroCta")}
              <IconChevron className="h-5 w-5" />
            </Link>
            {!user || user.role === "TENANT" ? (
              <Link
                href={tenantHref}
                className="inline-flex items-center justify-center gap-2 text-white font-medium text-lg py-4 px-8 rounded-xl border border-white/70 hover:bg-white/10 transition-colors"
              >
                {user ? t("home.myLocation") : t("home.heroSecondary")}
              </Link>
            ) : null}
          </div>
        </PageHero>

        <section
          ref={(el) => {
            sectionRefs.current[0] = el;
          }}
          className="py-16 md:py-20 bg-stone-900 text-white relative z-20"
        >
          <div className="container mx-auto px-6">
            <div className="text-center mb-12 scroll-reveal-fade">
              <h2 className="text-4xl md:text-5xl font-light tracking-tight mb-3">
                {t("home.pipelineTitle")}
              </h2>
              <p className="text-neutral-400 font-light text-xl md:text-2xl max-w-2xl mx-auto">
                {t("home.pipelineSubtitle")}
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-2 md:gap-0 md:flex-nowrap max-w-5xl mx-auto scroll-reveal-stagger">
              {PIPELINE_STAGES.map((stageKey, i) => (
                <div key={stageKey} className="flex items-center">
                  <div className="flex flex-col items-center min-w-[120px] md:min-w-0 md:flex-1">
                    <div
                      className={`w-14 h-14 rounded-full flex items-center justify-center text-lg font-medium border-2 ${
                        i === 0
                          ? "bg-white text-neutral-900 border-white"
                          : "border-neutral-600 text-neutral-300"
                      }`}
                    >
                      {i + 1}
                    </div>
                    <span className="text-base md:text-lg text-neutral-200 mt-3 text-center font-light">
                      {t(stageKey)}
                    </span>
                  </div>
                  {i < PIPELINE_STAGES.length - 1 && (
                    <IconChevron className="hidden md:block h-5 w-5 text-neutral-500 mx-2 flex-shrink-0" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section
          id="piliers"
          ref={(el) => {
            sectionRefs.current[1] = el;
          }}
          className="py-24 md:py-32 bg-white"
        >
          <div className="container mx-auto px-6">
            <div className="text-center mb-16 scroll-reveal-fade">
              <h2 className="text-5xl md:text-7xl font-light text-neutral-900 tracking-tight mb-4">
                {t("home.pillarsTitle")}
              </h2>
              <p className="text-2xl text-neutral-600 font-light max-w-2xl mx-auto">
                {t("home.pillarsSubtitle")}
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto scroll-reveal-stagger">
              {PILLARS.map(({ key, icon: Icon, titleKey, descKey, bullets, href }) => (
                <div key={key} className="group">
                  <div className="border border-neutral-200 rounded-2xl p-8 md:p-10 h-full flex flex-col bg-white hover:shadow-md hover:border-neutral-300 transition-all duration-300">
                    <Icon className="h-8 w-8 text-neutral-900 mb-6" />
                    <h3 className="text-2xl md:text-3xl font-medium text-neutral-900 mb-3">
                      {t(titleKey)}
                    </h3>
                    <p className="text-lg text-neutral-600 font-light leading-relaxed mb-6 flex-grow">
                      {t(descKey)}
                    </p>
                    <ul className="space-y-3 mb-8">
                      {bullets.map((bulletKey) => (
                        <li key={bulletKey} className="flex items-start gap-3 text-base md:text-lg text-neutral-700 font-light">
                          <IconTick className="h-5 w-5 text-neutral-900 flex-shrink-0 mt-1" />
                          {t(bulletKey)}
                        </li>
                      ))}
                    </ul>
                    <Link
                      href={user ? startHref : href}
                      className="inline-flex items-center gap-2 text-lg text-neutral-900 font-light hover:gap-3 transition-all"
                    >
                      {t("home.pillarCta")}
                      <IconChevron className="h-5 w-5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section
          ref={(el) => {
            sectionRefs.current[2] = el;
          }}
          className="py-24 bg-stone-50"
        >
          <div className="container mx-auto px-6">
            <div className="text-center mb-16 scroll-reveal-fade">
              <h2 className="text-5xl md:text-6xl font-light text-neutral-900 tracking-tight mb-4">
                {t("home.whyTitle")}
              </h2>
              <p className="text-2xl text-neutral-600 font-light">{t("home.whySubtitle")}</p>
            </div>
            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto scroll-reveal-stagger">
              {[
                { icon: IconScreen, title: "home.whySyndicationTitle", desc: "home.whySyndicationDesc" },
                { icon: IconIdCard, title: "home.whyTalTitle", desc: "home.whyTalDesc" },
                { icon: IconCard, title: "home.whyStripeTitle", desc: "home.whyStripeDesc" },
              ].map(({ icon: Icon, title, desc }) => (
                <div key={title} className="text-center md:text-left bg-white rounded-2xl p-8 md:p-10 shadow-sm">
                  <Icon className="h-8 w-8 text-neutral-900 mb-5 mx-auto md:mx-0" />
                  <h3 className="text-2xl font-light text-neutral-900 mb-2">{t(title)}</h3>
                  <p className="text-lg text-neutral-600 font-light leading-relaxed">{t(desc)}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section
          id="etapes"
          ref={(el) => {
            sectionRefs.current[3] = el;
          }}
          className="py-24 md:py-32 bg-white"
        >
          <div className="container mx-auto px-6">
            <div className="text-center mb-16 scroll-reveal-fade">
              <h2 className="text-5xl md:text-6xl font-light text-neutral-900 tracking-tight mb-4">
                {t("home.stepsTitle")}
              </h2>
              <p className="text-2xl text-neutral-600 font-light max-w-2xl mx-auto">
                {t("home.stepsSubtitle")}
              </p>
            </div>
            <div className="max-w-3xl mx-auto space-y-6 scroll-reveal-stagger">
              {STEPS.map((key, i) => (
                <div
                  key={key}
                  className="flex gap-5 p-6 md:p-8 rounded-2xl border border-neutral-100 hover:border-neutral-200 hover:shadow-md transition-all"
                >
                  <div className="flex-shrink-0 w-14 h-14 bg-neutral-900 rounded-xl flex items-center justify-center text-white font-light text-xl">
                    {i + 1}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-xl md:text-2xl font-medium text-neutral-900">
                        {t(`home.${key}Title`)}
                      </h3>
                    </div>
                    <p className="text-lg text-neutral-600 font-light leading-relaxed">
                      {t(`home.${key}Desc`)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-12 bg-neutral-100 border-y border-neutral-200">
          <div className="container mx-auto px-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 max-w-4xl mx-auto">
              <div>
                <h3 className="text-2xl md:text-3xl font-light text-neutral-900 mb-1">
                  {t("home.tenantBannerTitle")}
                </h3>
                <p className="text-lg text-neutral-600 font-light">{t("home.tenantBannerDesc")}</p>
              </div>
              <Link
                href={tenantHref}
                className="inline-flex items-center gap-2 text-lg text-neutral-900 font-light border border-neutral-300 hover:border-neutral-900 py-3.5 px-7 rounded-xl transition-colors whitespace-nowrap"
              >
                {t("home.tenantBannerCta")}
                <IconChevron className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>

        <section
          ref={(el) => {
            sectionRefs.current[4] = el;
          }}
          className="relative py-24 md:py-32 overflow-hidden scroll-reveal-fade"
        >
          <Image
            src={MARKETING_IMAGES.cta}
            alt=""
            fill
            className="object-cover object-center hero-kenburns"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-black/55" />
          <div className="container mx-auto px-6 text-center relative z-10">
            <h2 className="text-5xl md:text-7xl font-light text-white mb-4 tracking-tight">
              {t("home.ctaTitle")}
            </h2>
            <p className="text-xl md:text-2xl text-white/85 mb-10 max-w-2xl mx-auto font-light leading-snug">
              {t("home.ctaSubtitle")}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href={startHref}
                className="inline-flex items-center justify-center gap-2 bg-white hover:bg-neutral-100 text-neutral-900 font-medium text-lg py-4 px-8 rounded-xl transition-colors"
              >
                {user ? t("home.myLocations") : t("home.ctaPrimary")}
                <IconChevron className="h-5 w-5" />
              </Link>
              {(!user || user.role === "TENANT") && (
                <Link
                  href={tenantHref}
                  className="inline-flex items-center justify-center gap-2 text-white font-medium text-lg py-4 px-8 rounded-xl border border-white/70 hover:bg-white/10 transition-colors"
                >
                  {user ? t("home.myLocation") : t("home.ctaSecondary")}
                </Link>
              )}
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
