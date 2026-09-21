"use client";

import Link from "next/link";
import { PublicShell } from "@/components/public-shell";
import { ArrowLeft } from "lucide-react";

const sections = [
  {
    title: "Vérification des propriétaires",
    body: "Chaque propriétaire passe par un processus de vérification : identité, statut et historique sur la plateforme.",
  },
  {
    title: "Vérification des logements",
    body: "Nous nous assurons que les photos, prix, caractéristiques et localisation correspondent à la réalité.",
  },
  {
    title: "Système de notation",
    body: "Après chaque location, les locataires peuvent évaluer leur expérience pour maintenir la qualité de la plateforme.",
  },
];

export default function AboutPage() {
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

        <h1 className="text-2xl font-semibold text-ink mb-2">Annonces vérifiées</h1>
        <p className="text-sm text-ink-muted mb-10">
          Notre engagement pour la sécurité et la transparence.
        </p>

        <div className="space-y-8">
          {sections.map((s) => (
            <div key={s.title}>
              <h2 className="text-sm font-semibold text-ink mb-2">{s.title}</h2>
              <p className="text-sm text-ink-muted leading-relaxed">{s.body}</p>
            </div>
          ))}
        </div>

        <div className="mt-10">
          <Link href="/listings" className="btn-primary">
            Voir les annonces
          </Link>
        </div>
      </div>
    </PublicShell>
  );
}
