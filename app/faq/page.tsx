"use client";

import Link from "next/link";
import { PublicShell } from "@/components/public-shell";
import { ArrowLeft } from "lucide-react";

const faqs = [
  {
    question: "Comment fonctionne MyRent ?",
    answer:
      "MyRent connecte propriétaires et locataires au Québec. Les locataires cherchent un logement, complètent un dossier et postulent. Les propriétaires publient, gèrent les visites et examinent les candidatures.",
  },
  {
    question: "Les annonces sont-elles vérifiées ?",
    answer:
      "Nous vérifions l'identité des propriétaires, l'authenticité des photos et l'exactitude des informations publiées.",
  },
  {
    question: "Comment postuler à un logement ?",
    answer:
      "Créez un compte, complétez votre dossier, demandez une visite, puis soumettez votre candidature après la visite.",
  },
  {
    question: "Quels documents fournir ?",
    answer:
      "Pièce d'identité, justificatifs de revenus et références. Tout est stocké de façon sécurisée dans votre dossier.",
  },
  {
    question: "Combien coûte MyRent ?",
    answer:
      "L'inscription et la recherche sont gratuites. Des frais peuvent s'appliquer selon les conditions de chaque location.",
  },
];

export default function FAQPage() {
  return (
    <PublicShell>
      <div className="max-w-3xl mx-auto px-6 py-12">
        <Link
          href="/"
          className="inline-flex items-center text-sm text-ink-muted hover:text-ink mb-8"
        >
          <ArrowLeft className="h-4 w-4 mr-1.5" />
          Retour à l&apos;accueil
        </Link>

        <h1 className="text-2xl font-semibold text-ink mb-2">Questions fréquentes</h1>
        <p className="text-sm text-ink-muted mb-10">
          Réponses aux questions les plus courantes.
        </p>

        <div className="divide-y divide-neutral-200 border-t border-neutral-200">
          {faqs.map((faq) => (
            <div key={faq.question} className="py-6">
              <h2 className="text-sm font-semibold text-ink mb-2">{faq.question}</h2>
              <p className="text-sm text-ink-muted leading-relaxed">{faq.answer}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 pt-8 border-t border-neutral-200">
          <p className="text-sm text-ink-muted mb-3">Pas trouvé votre réponse ?</p>
          <Link href="/contact" className="btn-primary">
            Contactez-nous
          </Link>
        </div>
      </div>
    </PublicShell>
  );
}
