"use client";

import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Shield, FileCheck, UserCheck, ArrowLeft, Home } from "lucide-react";

export default function AboutPage() {
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
              <div className="w-24 h-24 bg-gradient-to-br from-violet-500 to-indigo-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl">
                <CheckCircle className="h-14 w-14 text-white" />
              </div>
              <h1 className="text-4xl md:text-5xl font-extrabold mb-4 text-gray-900">
                Annonces <span className="text-shimmer">vérifiées</span>
              </h1>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Notre engagement pour votre sécurité et votre tranquillité d'esprit
              </p>
            </div>

            <div className="space-y-6 mb-12">
              <Card className="border-2 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-violet-50 to-indigo-50">
                  <CardTitle className="flex items-center gap-3">
                    <Shield className="h-6 w-6 text-violet-600" />
                    Vérification des propriétaires
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <p className="text-gray-700 leading-relaxed">
                    Chaque propriétaire qui publie une annonce sur MyRent doit passer par un processus de vérification rigoureux. Nous vérifions leur identité, leur statut de propriétaire, et leur historique sur la plateforme.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-indigo-50 to-blue-50">
                  <CardTitle className="flex items-center gap-3">
                    <FileCheck className="h-6 w-6 text-indigo-600" />
                    Vérification des logements
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <p className="text-gray-700 leading-relaxed">
                    Tous les logements sont inspectés pour s'assurer qu'ils correspondent à la description, que les photos sont authentiques, et que les informations (prix, caractéristiques, localisation) sont exactes.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50">
                  <CardTitle className="flex items-center gap-3">
                    <UserCheck className="h-6 w-6 text-purple-600" />
                    Système de notation
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <p className="text-gray-700 leading-relaxed">
                    Après chaque location, les locataires peuvent noter et commenter leur expérience. Ces avis authentiques aident à maintenir la qualité de notre plateforme et à protéger tous les utilisateurs.
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="text-center">
              <Link href="/listings">
                <Button size="lg" className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white">
                  <Home className="h-5 w-5 mr-2" />
                  Voir les logements vérifiés
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}


