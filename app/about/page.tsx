"use client";

import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { PageHero, MARKETING_IMAGES } from "@/components/marketing/page-hero";
import { SiteFooter } from "@/components/marketing/site-footer";
import { Shield, FileCheck, UserCheck, ArrowLeft, Home } from "lucide-react";

const SECTIONS = [
  {
    icon: Shield,
    title: "Vérification des propriétaires",
    text: "Chaque propriétaire qui publie une annonce sur MyRent doit passer par un processus de vérification rigoureux. Nous vérifions leur identité, leur statut de propriétaire, et leur historique sur la plateforme.",
  },
  {
    icon: FileCheck,
    title: "Vérification des logements",
    text: "Tous les logements sont inspectés pour s'assurer qu'ils correspondent à la description, que les photos sont authentiques, et que les informations (prix, caractéristiques, localisation) sont exactes.",
  },
  {
    icon: UserCheck,
    title: "Système de notation",
    text: "Après chaque location, les locataires peuvent noter et commenter leur expérience. Ces avis authentiques aident à maintenir la qualité de notre plateforme et à protéger tous les utilisateurs.",
  },
];

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-white">
        <PageHero image={MARKETING_IMAGES.home} size="compact">
          <Link
            href="/"
            className="inline-flex items-center text-neutral-600 hover:text-neutral-900 mb-6 text-sm transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour à l&apos;accueil
          </Link>
          <h1 className="text-3xl md:text-4xl font-light text-neutral-900 tracking-tight mb-3">
            Annonces vérifiées
          </h1>
          <p className="text-neutral-600 font-light max-w-lg">
            Notre engagement pour votre sécurité et votre tranquillité d&apos;esprit
          </p>
        </PageHero>

        <section className="py-14 md:py-16 bg-stone-50">
          <div className="container mx-auto px-6 max-w-3xl space-y-5">
            {SECTIONS.map(({ icon: Icon, title, text }) => (
              <div
                key={title}
                className="rounded-xl border border-neutral-200 bg-white p-6 md:p-7"
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-neutral-100">
                    <Icon className="h-5 w-5 text-neutral-700" />
                  </div>
                  <div>
                    <h2 className="text-lg font-medium text-neutral-900 mb-2">{title}</h2>
                    <p className="text-neutral-600 text-sm leading-relaxed">{text}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="py-14 text-center border-t border-neutral-100">
          <Link
            href="/listings"
            className="inline-flex items-center gap-2 bg-neutral-900 hover:bg-neutral-800 text-white font-medium py-3.5 px-8 rounded-xl transition-colors text-sm"
          >
            <Home className="h-4 w-4" />
            Voir les annonces
          </Link>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
