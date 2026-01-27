"use client";

import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, HelpCircle } from "lucide-react";

const faqs = [
  {
    question: "Comment fonctionne MyRent ?",
    answer: "MyRent est une plateforme de location à long terme qui connecte les locataires et les propriétaires. Les locataires peuvent rechercher des logements, créer un dossier complet, et postuler aux annonces. Les propriétaires peuvent publier leurs logements et examiner les candidatures."
  },
  {
    question: "Les annonces sont-elles vérifiées ?",
    answer: "Oui, toutes les annonces sont vérifiées. Nous vérifions l'identité des propriétaires, l'authenticité des photos, et l'exactitude des informations publiées."
  },
  {
    question: "Comment puis-je postuler à un logement ?",
    answer: "Créez d'abord votre compte et complétez votre dossier locataire. Ensuite, parcourez les listings disponibles et cliquez sur 'Postuler' pour soumettre votre candidature au propriétaire."
  },
  {
    question: "Quels documents dois-je fournir ?",
    answer: "Vous devez fournir une pièce d'identité, des justificatifs de revenus, et des références. Tous les documents sont stockés de manière sécurisée dans votre dossier."
  },
  {
    question: "Combien coûte l'utilisation de MyRent ?",
    answer: "L'inscription et la recherche de logements sont gratuites. Des frais peuvent s'appliquer lors de la finalisation d'une location, selon les conditions spécifiques de chaque annonce."
  }
];

export default function FAQPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4 py-12">
          <Link href="/" className="inline-flex items-center text-gray-700 hover:text-violet-600 mb-8 text-sm font-medium transition-colors">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour à l'accueil
          </Link>

          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-blue-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl">
                <HelpCircle className="h-14 w-14 text-white" />
              </div>
              <h1 className="text-4xl md:text-5xl font-extrabold mb-4 text-gray-900">
                Questions <span className="text-shimmer">fréquentes</span>
              </h1>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Trouvez rapidement les réponses à vos questions
              </p>
            </div>

            <div className="space-y-6">
              {faqs.map((faq, index) => (
                <Card key={index} className="border-2 shadow-lg">
                  <CardHeader className="bg-gradient-to-r from-violet-50 to-indigo-50">
                    <CardTitle className="text-lg">{faq.question}</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <p className="text-gray-700 leading-relaxed">{faq.answer}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="mt-12 text-center">
              <p className="text-gray-600 mb-4">Vous ne trouvez pas la réponse à votre question ?</p>
              <Link href="/contact">
                <button className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-semibold py-3 px-8 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl">
                  Contactez-nous
                </button>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}


