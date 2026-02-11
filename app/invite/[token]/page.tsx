"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, CheckCircle, Loader2, Home } from "lucide-react";
import Link from "next/link";

export default function InvitationPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = params.token as string;
  const applicationId = searchParams.get("applicationId");

  const [isLoading, setIsLoading] = useState(true);
  const [isValid, setIsValid] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [invitation, setInvitation] = useState<any>(null);
  
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  useEffect(() => {
    if (token) {
      verifyInvitation();
    }
  }, [token]);

  const verifyInvitation = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/invitations/${token}/verify`);

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Invitation invalide");
      }

      const data = await response.json();
      setIsValid(true);
      setInvitation(data.invitation);
    } catch (err: any) {
      setError(err.message || "Erreur lors de la vérification de l'invitation");
      setIsValid(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError(null);

    if (password !== confirmPassword) {
      setCreateError("Les mots de passe ne correspondent pas");
      return;
    }

    if (password.length < 6) {
      setCreateError("Le mot de passe doit contenir au moins 6 caractères");
      return;
    }

    setIsCreating(true);

    try {
      // Créer le compte
      const signupResponse = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email: invitation.email,
          password,
          role: "TENANT",
        }),
      });

      if (!signupResponse.ok) {
        const data = await signupResponse.json();
        throw new Error(data.error || "Erreur lors de la création du compte");
      }

      // Se connecter automatiquement
      const signinResponse = await fetch("/api/auth/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: invitation.email,
          password,
        }),
      });

      // Utiliser l'invitation et créer l'application si nécessaire (même si la connexion échoue)
      const useInvitationResponse = await fetch(`/api/invitations/${token}/use`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          applicationId: applicationId || null,
        }),
      });

      const useData = await useInvitationResponse.ok 
        ? await useInvitationResponse.json()
        : { applicationId: null };

      // Rediriger vers l'application ou la page de connexion
      if (signinResponse.ok && useData.applicationId) {
        // Connexion réussie et application créée - rediriger directement
        router.push(`/tenant/applications/${useData.applicationId}`);
      } else if (signinResponse.ok) {
        // Connexion réussie mais pas d'application - rediriger vers les applications
        router.push(`/tenant/applications`);
      } else {
        // Connexion échouée - rediriger vers la page de connexion avec l'email pré-rempli
        router.push(`/auth/signin?email=${encodeURIComponent(invitation.email)}&redirect=${useData.applicationId ? `/tenant/applications/${useData.applicationId}` : '/tenant/applications'}`);
      }
    } catch (err: any) {
      setCreateError(err.message || "Erreur lors de la création du compte");
    } finally {
      setIsCreating(false);
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

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-white py-12">
        <div className="container mx-auto px-6 max-w-2xl">
          <Card className="border-2 border-neutral-100">
            <CardHeader>
              <CardTitle className="text-3xl font-light text-neutral-900 mb-2">
                Créer votre compte
              </CardTitle>
              <CardDescription className="text-base font-light text-neutral-600">
                Vous avez été invité à postuler pour : <strong>{invitation.listing.title}</strong>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateAccount} className="space-y-6">
                <div>
                  <Label htmlFor="email" className="text-base font-light">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={invitation.email}
                    disabled
                    className="mt-2 font-light bg-neutral-50"
                  />
                  <p className="text-sm text-neutral-500 mt-1 font-light">
                    Cet email a été utilisé pour votre invitation
                  </p>
                </div>

                <div>
                  <Label htmlFor="name" className="text-base font-light">
                    Nom complet
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    placeholder="Votre nom"
                    className="mt-2 font-light"
                  />
                </div>

                <div>
                  <Label htmlFor="password" className="text-base font-light">
                    Mot de passe
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    placeholder="Minimum 6 caractères"
                    className="mt-2 font-light"
                  />
                </div>

                <div>
                  <Label htmlFor="confirmPassword" className="text-base font-light">
                    Confirmer le mot de passe
                  </Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={6}
                    placeholder="Répétez le mot de passe"
                    className="mt-2 font-light"
                  />
                </div>

                {createError && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-700">{createError}</p>
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={isCreating}
                  className="w-full bg-neutral-900 hover:bg-neutral-800 text-white font-light"
                >
                  {isCreating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Création du compte...
                    </>
                  ) : (
                    "Créer mon compte et accéder à la candidature"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}

