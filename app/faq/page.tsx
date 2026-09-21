"use client";

import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { PageHero, MARKETING_IMAGES } from "@/components/marketing/page-hero";
import { SiteFooter } from "@/components/marketing/site-footer";
import { ArrowLeft } from "lucide-react";

const faqs = [
  {
    question: "Comment fonctionne MyRent ?",
    answer:
      "MyRent est une plateforme de location à long terme qui connecte les locataires et les propriétaires. Les locataires peuvent rechercher des logements, créer un dossier complet, demander des visites et échanger des messages avec les propriétaires. Les propriétaires peuvent publier leurs logements et examiner les candidatures.",
  },
  {
    question: "Les annonces sont-elles vérifiées ?",
    answer:
      "Oui, toutes les annonces sont vérifiées. Nous vérifions l'identité des propriétaires, l'authenticité des photos, et l'exactitude des informations publiées.",
  },
  {
    question: "Comment puis-je postuler à un logement ?",
    answer:
      "Créez d'abord votre compte et complétez votre dossier locataire. Ensuite, demandez une visite pour les logements qui vous intéressent. Après une visite confirmée, vous pourrez compléter une candidature structurée pour ce logement.",
  },
  {
    question: "Quels documents dois-je fournir ?",
    answer:
      "Vous devez fournir une pièce d'identité, des justificatifs de revenus, et des références. Tous les documents sont stockés de manière sécurisée dans votre dossier.",
  },
  {
    question: "Combien coûte l'utilisation de MyRent ?",
    answer:
      "L'inscription et la recherche de logements sont gratuites. Des frais peuvent s'appliquer lors de la finalisation d'une location, selon les conditions spécifiques de chaque annonce.",
  },
];

export default function FAQPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-white">
        <PageHero image={MARKETING_IMAGES.cta} size="compact">
          <Link
            href="/"
            className="inline-flex items-center text-neutral-600 hover:text-neutral-900 mb-6 text-sm transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour à l&apos;accueil
          </Link>
          <h1 className="text-3xl md:text-4xl font-light text-neutral-900 tracking-tight mb-3">
            Questions fréquentes
          </h1>
          <p className="text-neutral-600 font-light max-w-lg">
            Trouvez rapidement les réponses à vos questions
          </p>
        </PageHero>

        <section className="py-14 md:py-16">
          <div className="container mx-auto px-6 max-w-3xl space-y-4">
            {faqs.map((faq, index) => (
              <details
                key={index}
                className="group rounded-xl border border-neutral-200 bg-white open:shadow-sm"
              >
                <summary className="cursor-pointer list-none px-5 py-4 font-medium text-neutral-900 flex items-center justify-between gap-4">
                  {faq.question}
                  <span className="text-neutral-400 group-open:rotate-45 transition-transform text-xl leading-none">
                    +
                  </span>
                </summary>
                <div className="px-5 pb-5 text-neutral-600 text-sm leading-relaxed border-t border-neutral-100 pt-4">
                  {faq.answer}
                </div>
              </details>
            ))}

            <div className="pt-8 text-center">
              <p className="text-neutral-500 text-sm mb-4">
                Vous ne trouvez pas la réponse à votre question ?
              </p>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center bg-neutral-900 hover:bg-neutral-800 text-white font-medium py-3 px-7 rounded-xl transition-colors text-sm"
              >
                Contactez-nous
              </Link>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
