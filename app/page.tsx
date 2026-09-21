"use client";

import Link from "next/link";
import Image from "next/image";
import { Navbar } from "@/components/navbar";
import { PageHero, MARKETING_IMAGES } from "@/components/marketing/page-hero";
import { SiteFooter } from "@/components/marketing/site-footer";
import { useLanguageContext } from "@/contexts/LanguageContext";
import {
  ArrowRight,
  Megaphone,
  FileText,
  Wallet,
  CheckCircle,
  Share2,
  Shield,
  CreditCard,
  Plus,
  Users,
  PenTool,
  DollarSign,
  Search,
} from "lucide-react";
import { useEffect, useRef } from "react";

const PIPELINE_STAGES = [
  "pipeline.stages.published",
  "pipeline.stages.leads",
  "pipeline.stages.application",
  "pipeline.stages.lease",
  "pipeline.stages.renting",
] as const;

const STEPS = [
  { key: "step1", icon: Plus },
  { key: "step2", icon: Share2 },
  { key: "step3", icon: Users },
  { key: "step4", icon: PenTool },
  { key: "step5", icon: DollarSign },
] as const;

const PILLARS = [
  {
    key: "Advertise",
    icon: Megaphone,
    titleKey: "home.pillarAdvertiseTitle",
    descKey: "home.pillarAdvertiseDesc",
    bullets: ["home.pillarAdvertise1", "home.pillarAdvertise2", "home.pillarAdvertise3"],
    href: "/auth/signup?role=LANDLORD",
  },
  {
    key: "Paperwork",
    icon: FileText,
    titleKey: "home.pillarPaperworkTitle",
    descKey: "home.pillarPaperworkDesc",
    bullets: ["home.pillarPaperwork1", "home.pillarPaperwork2", "home.pillarPaperwork3"],
    href: "/auth/signup?role=LANDLORD",
  },
  {
    key: "Management",
    icon: Wallet,
    titleKey: "home.pillarManagementTitle",
    descKey: "home.pillarManagementDesc",
    bullets: ["home.pillarManagement1", "home.pillarManagement2", "home.pillarManagement3"],
    href: "/auth/signup?role=LANDLORD",
  },
] as const;

export default function Home() {
  const { t } = useLanguageContext();
  const sectionRefs = useRef<(HTMLElement | null)[]>([]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.intersectionRatio > 0.1) {
            entry.target.classList.add("revealed");
            entry.target.querySelectorAll(".reveal:not(.active)").forEach((el, i) => {
              setTimeout(() => el.classList.add("active"), i * 80);
            });
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -80px 0px" }
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
        <PageHero image={MARKETING_IMAGES.home}>
          <p className="text-neutral-500 text-sm font-medium tracking-wide mb-4 reveal active">
            {t("home.forLandlords")} · Québec
          </p>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-light text-neutral-900 leading-[1.08] tracking-tight mb-6">
            {t("home.heroTitle")}{" "}
            <span className="font-normal text-neutral-600">{t("home.heroTitleAccent")}</span>
          </h1>
          <p className="text-lg md:text-xl text-neutral-600 font-light leading-relaxed mb-10 max-w-lg">
            {t("home.heroSubtitle")}
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href="/auth/signup?role=LANDLORD"
              className="inline-flex items-center justify-center gap-2 bg-neutral-900 text-white hover:bg-neutral-800 font-medium text-base py-3.5 px-7 rounded-xl transition-colors shadow-lg shadow-neutral-900/10"
            >
              {t("home.heroCta")}
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/listings"
              className="inline-flex items-center justify-center gap-2 text-neutral-700 hover:text-neutral-900 font-medium text-base py-3.5 px-7 rounded-xl border border-neutral-300 bg-white/70 backdrop-blur-sm hover:bg-white transition-colors"
            >
              <Search className="h-4 w-4" />
              {t("home.heroSecondary")}
            </Link>
          </div>
        </PageHero>

        {/* Pipeline visuel */}
        <section
          ref={(el) => {
            sectionRefs.current[0] = el;
          }}
          className="py-16 md:py-20 bg-stone-900 text-white relative z-20"
        >
          <div className="container mx-auto px-6">
            <div className="text-center mb-12 scroll-reveal-fade">
              <h2 className="text-3xl md:text-4xl font-light tracking-tight mb-3">
                {t("home.pipelineTitle")}
              </h2>
              <p className="text-neutral-400 font-light text-lg max-w-xl mx-auto">
                {t("home.pipelineSubtitle")}
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-2 md:gap-0 md:flex-nowrap max-w-4xl mx-auto scroll-reveal-stagger">
              {PIPELINE_STAGES.map((stageKey, i) => (
                <div key={stageKey} className="flex items-center reveal">
                  <div className="flex flex-col items-center min-w-[100px] md:min-w-0 md:flex-1">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium border-2 ${
                        i === 0
                          ? "bg-white text-neutral-900 border-white"
                          : "border-neutral-600 text-neutral-300"
                      }`}
                    >
                      {i + 1}
                    </div>
                    <span className="text-xs md:text-sm text-neutral-300 mt-2 text-center font-light">
                      {t(stageKey)}
                    </span>
                  </div>
                  {i < PIPELINE_STAGES.length - 1 && (
                    <ArrowRight className="hidden md:block h-4 w-4 text-neutral-600 mx-1 flex-shrink-0" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 3 piliers */}
        <section
          id="piliers"
          ref={(el) => {
            sectionRefs.current[1] = el;
          }}
          className="py-24 md:py-32 bg-white"
        >
          <div className="container mx-auto px-6">
            <div className="text-center mb-16 scroll-reveal-fade">
              <h2 className="text-4xl md:text-6xl font-light text-neutral-900 tracking-tight mb-4">
                {t("home.pillarsTitle")}
              </h2>
              <p className="text-xl text-neutral-600 font-light max-w-2xl mx-auto">
                {t("home.pillarsSubtitle")}
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto scroll-reveal-stagger">
              {PILLARS.map(({ key, icon: Icon, titleKey, descKey, bullets, href }) => (
                <div key={key} className="reveal group">
                  <div className="border border-neutral-200 rounded-2xl p-8 h-full flex flex-col bg-white hover:shadow-md hover:border-neutral-300 transition-all duration-300">
                    <div className="w-12 h-12 bg-stone-100 rounded-xl flex items-center justify-center mb-6">
                      <Icon className="h-6 w-6 text-neutral-800" />
                    </div>
                    <h3 className="text-xl md:text-2xl font-medium text-neutral-900 mb-3">
                      {t(titleKey)}
                    </h3>
                    <p className="text-neutral-600 font-light leading-relaxed mb-6 flex-grow">
                      {t(descKey)}
                    </p>
                    <ul className="space-y-3 mb-8">
                      {bullets.map((bulletKey) => (
                        <li key={bulletKey} className="flex items-start gap-3 text-neutral-700 font-light">
                          <CheckCircle className="h-5 w-5 text-neutral-900 flex-shrink-0 mt-0.5" />
                          {t(bulletKey)}
                        </li>
                      ))}
                    </ul>
                    <Link
                      href={href}
                      className="inline-flex items-center gap-2 text-neutral-900 font-light hover:gap-3 transition-all"
                    >
                      {t("home.pillarCta")}
                      <ArrowRight className="h-5 w-5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pourquoi MyRent */}
        <section
          ref={(el) => {
            sectionRefs.current[2] = el;
          }}
          className="py-24 bg-stone-50"
        >
          <div className="container mx-auto px-6">
            <div className="text-center mb-16 scroll-reveal-fade">
              <h2 className="text-4xl md:text-5xl font-light text-neutral-900 tracking-tight mb-4">
                {t("home.whyTitle")}
              </h2>
              <p className="text-xl text-neutral-600 font-light">{t("home.whySubtitle")}</p>
            </div>
            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto scroll-reveal-stagger">
              {[
                { icon: Share2, title: "home.whySyndicationTitle", desc: "home.whySyndicationDesc" },
                { icon: Shield, title: "home.whyTalTitle", desc: "home.whyTalDesc" },
                { icon: CreditCard, title: "home.whyStripeTitle", desc: "home.whyStripeDesc" },
              ].map(({ icon: Icon, title, desc }) => (
                <div key={title} className="reveal text-center md:text-left bg-white rounded-2xl p-8 shadow-sm">
                  <div className="w-12 h-12 bg-neutral-100 rounded-xl flex items-center justify-center mb-4 mx-auto md:mx-0">
                    <Icon className="h-6 w-6 text-neutral-800" />
                  </div>
                  <h3 className="text-xl font-light text-neutral-900 mb-2">{t(title)}</h3>
                  <p className="text-neutral-600 font-light leading-relaxed">{t(desc)}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Comment ça marche — proprio uniquement */}
        <section
          ref={(el) => {
            sectionRefs.current[3] = el;
          }}
          className="py-24 md:py-32 bg-white"
        >
          <div className="container mx-auto px-6">
            <div className="text-center mb-16 scroll-reveal-fade">
              <h2 className="text-4xl md:text-5xl font-light text-neutral-900 tracking-tight mb-4">
                {t("home.stepsTitle")}
              </h2>
              <p className="text-xl text-neutral-600 font-light max-w-2xl mx-auto">
                {t("home.stepsSubtitle")}
              </p>
            </div>
            <div className="max-w-2xl mx-auto space-y-6 scroll-reveal-stagger">
              {STEPS.map(({ key, icon: Icon }, i) => (
                <div
                  key={key}
                  className="reveal flex gap-5 p-6 rounded-2xl border border-neutral-100 hover:border-neutral-200 hover:shadow-md transition-all"
                >
                  <div className="flex-shrink-0 w-12 h-12 bg-neutral-900 rounded-xl flex items-center justify-center text-white font-light text-lg">
                    {i + 1}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Icon className="h-4 w-4 text-neutral-400" />
                      <h3 className="text-lg font-medium text-neutral-900">
                        {t(`home.${key}Title`)}
                      </h3>
                    </div>
                    <p className="text-neutral-600 font-light leading-relaxed">
                      {t(`home.${key}Desc`)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Bandeau locataire secondaire */}
        <section className="py-12 bg-neutral-100 border-y border-neutral-200">
          <div className="container mx-auto px-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 max-w-4xl mx-auto">
              <div>
                <h3 className="text-xl font-light text-neutral-900 mb-1">
                  {t("home.tenantBannerTitle")}
                </h3>
                <p className="text-neutral-600 font-light">{t("home.tenantBannerDesc")}</p>
              </div>
              <Link
                href="/listings"
                className="inline-flex items-center gap-2 text-neutral-900 font-light border border-neutral-300 hover:border-neutral-900 py-3 px-6 rounded-xl transition-colors whitespace-nowrap"
              >
                {t("home.tenantBannerCta")}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* CTA final */}
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
            className="object-cover object-center"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-white/90 md:bg-white/85" />
          <div className="container mx-auto px-6 text-center relative z-10">
            <h2 className="text-3xl md:text-5xl font-light text-neutral-900 mb-4 tracking-tight">
              {t("home.ctaTitle")}
            </h2>
            <p className="text-lg text-neutral-600 mb-10 max-w-2xl mx-auto font-light leading-relaxed">
              {t("home.ctaSubtitle")}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/auth/signup?role=LANDLORD"
                className="inline-flex items-center justify-center gap-2 bg-neutral-900 hover:bg-neutral-800 text-white font-medium text-base py-3.5 px-8 rounded-xl transition-colors"
              >
                {t("home.ctaPrimary")}
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/beta"
                className="inline-flex items-center justify-center gap-2 text-neutral-800 font-medium text-base py-3.5 px-8 rounded-xl border border-neutral-300 bg-white hover:bg-stone-50 transition-colors"
              >
                {t("home.ctaSecondary")}
              </Link>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
