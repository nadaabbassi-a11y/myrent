"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, CheckCircle, Loader2 } from "lucide-react";
import Link from "next/link";

export default function CoApplicantPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = params.token as string;
  const applicationId = searchParams.get("applicationId");

  const [isLoading, setIsLoading] = useState(true);
  const [isValid, setIsValid] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [coApplicant, setCoApplicant] = useState<any>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (token) {
      verifyInvitation();
    }
  }, [token]);

  useEffect(() => {
    // Si l'utilisateur est connecté et que l'invitation est valide, utiliser l'invitation
    if (user && isValid && coApplicant) {
      useInvitation();
    }
  }, [user, isValid, coApplicant]);

  const verifyInvitation = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/co-applicants/${token}/verify`);

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Invitation invalide");
      }

      const data = await response.json();
      setIsValid(true);
      setCoApplicant(data.coApplicant);
    } catch (err: any) {
      setError(err.message || "Erreur lors de la vérification de l'invitation");
      setIsValid(false);
    } finally {
      setIsLoading(false);
    }
  };

  const useInvitation = async () => {
    try {
      const response = await fetch(`/api/co-applicants/${token}/use`, {
        method: "POST",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Erreur lors de l'utilisation de l'invitation");
      }

      const data = await response.json();
      
      // Rediriger vers la page de l'application pour remplir les infos
      router.push(`/tenant/applications/${data.applicationId}?coApplicantId=${data.coApplicantId}`);
    } catch (err: any) {
      setError(err.message || "Erreur lors de l'utilisation de l'invitation");
    }
  };

  if (isLoading) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-white flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-neutral-600 mx-auto mb-4" />
            <p className="text-lg text-neutral-600 font-light">Vérification de l'invitation...</p>
          </div>
        </main>
      </>
    );
  }

  if (!isValid || error) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-white flex items-center justify-center py-12">
          <Card className="max-w-md w-full border-2 border-neutral-100">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-2xl font-light">
                <AlertCircle className="h-6 w-6 text-red-600" />
                Invitation invalide
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-neutral-600 mb-6 font-light">{error}</p>
              <Link href="/">
                <Button className="w-full bg-neutral-900 hover:bg-neutral-800 text-white font-light">
                  Retour à l'accueil
                </Button>
              </Link>
            </CardContent>
          </Card>
        </main>
      </>
    );
  }

  // Si les infos ont été remplies par le principal, afficher un message de vérification
  if (coApplicant.filledByPrimary && coApplicant.status === "FILLED_BY_PRIMARY") {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-white py-12">
          <div className="container mx-auto px-6 max-w-2xl">
            <Card className="border-2 border-neutral-100">
              <CardHeader>
                <CardTitle className="text-3xl font-light text-neutral-900 mb-2">
                  Vérification de vos informations
                </CardTitle>
                <CardDescription className="text-base font-light text-neutral-600">
                  {coApplicant.application.tenant.user.name} a rempli vos informations pour la candidature : <strong>{coApplicant.application.listing.title}</strong>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                    <p className="text-sm text-blue-800 font-light">
                      Les informations ont été remplies en votre nom. Veuillez les vérifier et les valider si elles sont correctes.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <p className="text-neutral-600 font-light">
                      Pour vérifier et compléter vos informations, vous devez créer un compte ou vous connecter.
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <Link href={`/auth/signup?email=${encodeURIComponent(coApplicant.email || '')}&redirect=/co-applicant/${token}?applicationId=${applicationId}`} className="flex-1">
                      <Button className="w-full bg-neutral-900 hover:bg-neutral-800 text-white font-light">
                        Créer un compte
                      </Button>
                    </Link>
                    <Link href={`/auth/signin?email=${encodeURIComponent(coApplicant.email || '')}&redirect=/co-applicant/${token}?applicationId=${applicationId}`} className="flex-1">
                      <Button variant="outline" className="w-full border-2 border-neutral-900 text-neutral-900 hover:bg-neutral-50 font-light">
                        Se connecter
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </>
    );
  }

  // Sinon, invitation normale pour remplir les infos
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-white py-12">
        <div className="container mx-auto px-6 max-w-2xl">
          <Card className="border-2 border-neutral-100">
            <CardHeader>
              <CardTitle className="text-3xl font-light text-neutral-900 mb-2">
                Compléter votre candidature
              </CardTitle>
              <CardDescription className="text-base font-light text-neutral-600">
                Vous avez été invité à compléter votre candidature pour : <strong>{coApplicant.application.listing.title}</strong>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <p className="text-neutral-600 font-light">
                  Pour compléter votre candidature, vous devez créer un compte ou vous connecter.
                </p>

                <div className="flex gap-3">
                  <Link href={`/auth/signup?email=${encodeURIComponent(coApplicant.email || '')}&redirect=/co-applicant/${token}?applicationId=${applicationId}`} className="flex-1">
                    <Button className="w-full bg-neutral-900 hover:bg-neutral-800 text-white font-light">
                      Créer un compte
                    </Button>
                  </Link>
                  <Link href={`/auth/signin?email=${encodeURIComponent(coApplicant.email || '')}&redirect=/co-applicant/${token}?applicationId=${applicationId}`} className="flex-1">
                    <Button variant="outline" className="w-full border-2 border-neutral-900 text-neutral-900 hover:bg-neutral-50 font-light">
                      Se connecter
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}

