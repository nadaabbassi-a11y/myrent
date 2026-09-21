"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { Gift, Mail, Copy, Check, ArrowLeft, Share2 } from "lucide-react";
import Link from "next/link";

export default function InvitePage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const inviteLink = user
    ? `${typeof window !== "undefined" ? window.location.origin : ""}/auth/signup?ref=${user.id}`
    : "";

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth/signin");
    }
  }, [user, authLoading, router]);

  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setIsSending(true);

    try {
      // TODO: Implémenter l'API pour envoyer l'invitation
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      setSuccess(true);
      setEmail("");
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError("Erreur lors de l'envoi de l'invitation");
      console.error(err);
    } finally {
      setIsSending(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(inviteLink);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  if (authLoading) {
    return (
      <>
        <div className="py-10">
          <div className="container mx-auto px-4">
            <div className="text-center">Chargement...</div>
          </div>
        </div>
      </>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <>
      <div className="py-10">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-ink-muted hover:text-ink mb-6 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Retour à l'accueil
            </Link>

            <h1 className="text-3xl font-bold mb-8 text-ink flex items-center gap-3">
              <Gift className="h-8 w-8 text-ink" />
              Inviter un ami
            </h1>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
                {error}
              </div>
            )}

            {success && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl text-green-700">
                Invitation envoyée avec succès !
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-6">
              {/* Envoyer par email */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="h-5 w-5 text-ink" />
                    Envoyer par email
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSendInvite} className="space-y-4">
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-ink-muted mb-2">
                        Adresse email de votre ami
                      </label>
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="ami@example.com"
                        required
                      />
                    </div>
                    <Button
                      type="submit"
                      disabled={isSending}
                      className="w-full bg-ink hover:bg-ink/90 text-white"
                    >
                      {isSending ? "Envoi..." : "Envoyer l'invitation"}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Partager le lien */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Share2 className="h-5 w-5 text-ink" />
                    Partager le lien
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-ink-muted mb-2">
                      Votre lien d'invitation
                    </label>
                    <div className="flex gap-2">
                      <Input
                        value={inviteLink}
                        readOnly
                        className="bg-gray-100"
                      />
                      <Button
                        type="button"
                        onClick={handleCopyLink}
                        variant="outline"
                        className="flex-shrink-0"
                      >
                        {isCopied ? (
                          <>
                            <Check className="h-4 w-4 mr-2 text-green-600" />
                            Copié
                          </>
                        ) : (
                          <>
                            <Copy className="h-4 w-4 mr-2" />
                            Copier
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500">
                    Partagez ce lien avec vos amis pour qu'ils puissent s'inscrire sur MyRent.
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Avantages */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Pourquoi inviter vos amis ?</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-ink-muted">
                  <li className="flex items-start gap-3">
                    <Gift className="h-5 w-5 text-ink flex-shrink-0 mt-0.5" />
                    <div>
                      <strong>Avantages pour vos amis :</strong> Ils bénéficient d'une expérience simplifiée pour trouver leur logement idéal.
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <Gift className="h-5 w-5 text-ink flex-shrink-0 mt-0.5" />
                    <div>
                      <strong>Avantages pour vous :</strong> Plus d'utilisateurs signifie plus de choix et une meilleure communauté.
                    </div>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}



