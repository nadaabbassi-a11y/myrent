"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useNotifications } from "@/hooks/useNotifications";
import { Home, Plus, FileText, MessageSquare, Users, CalendarCheck } from "lucide-react";
import Link from "next/link";

export default function LandlordDashboard() {
  const { user, isLoading } = useAuth();
  const { notifications } = useNotifications();
  const router = useRouter();

  useEffect(() => {
    // Attendre un peu avant de rediriger pour éviter les redirections trop rapides
    if (!isLoading && !user) {
      const timer = setTimeout(() => {
        router.push("/auth/signin");
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-gray-50 py-12">
          <div className="container mx-auto px-4">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-neutral-900 mb-4"></div>
              <p className="text-gray-600">Chargement...</p>
            </div>
          </div>
        </main>
      </>
    );
  }

  if (!user) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-gray-50 py-12">
          <div className="container mx-auto px-4">
            <div className="text-center">
              <p className="text-gray-600">Redirection vers la page de connexion...</p>
            </div>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-white py-16">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            <div className="mb-12">
              <h1 className="text-4xl font-medium text-neutral-900 mb-3 tracking-tight">
                Bienvenue, {user.name || user.email?.split('@')[0] || 'Propriétaire'} !
              </h1>
              <p className="text-lg text-neutral-600">Gérez vos annonces et vos locataires en toute simplicité</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Link href="/landlord/listings/new">
                <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer border-2 border-dashed border-neutral-300 hover:border-neutral-900 rounded-xl bg-white hover:bg-neutral-50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-neutral-900 rounded-lg flex items-center justify-center">
                        <Plus className="h-5 w-5 text-white" />
                      </div>
                      <span className="text-lg font-medium text-neutral-900">Créer une annonce</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-neutral-600 text-sm leading-relaxed mb-3">
                      Créez une annonce complète avec photos, description, prix et caractéristiques. Les locataires pourront postuler directement en ligne.
                    </p>
                    <div className="text-xs text-neutral-500 space-y-1">
                      <p>• Ajoutez jusqu'à 10 photos</p>
                      <p>• Définissez vos critères de sélection</p>
                      <p>• Gérez les visites via le calendrier</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/landlord/listings">
                <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer border border-neutral-200 hover:border-neutral-300 rounded-xl">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-neutral-900 rounded-lg flex items-center justify-center">
                        <Home className="h-5 w-5 text-white" />
                      </div>
                      <span className="text-lg font-medium text-neutral-900">Mes annonces</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-neutral-600 text-sm leading-relaxed mb-3">
                      Consultez toutes vos annonces actives, modifiez-les, mettez-les en pause ou archivez-les. Suivez les statistiques de chaque annonce.
                    </p>
                    <div className="text-xs text-neutral-500 space-y-1">
                      <p>• Voir le nombre de vues et candidatures</p>
                      <p>• Modifier les informations à tout moment</p>
                      <p>• Activer/désactiver une annonce</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/landlord/applications">
                <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer border border-neutral-200 hover:border-neutral-300 rounded-xl relative">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-neutral-900 rounded-lg flex items-center justify-center">
                        <Users className="h-5 w-5 text-white" />
                      </div>
                      <span className="text-lg font-medium text-neutral-900 flex-1">Candidatures</span>
                      {notifications.applications > 0 && (
                        <span className="bg-red-500 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center min-w-[24px]">
                          {notifications.applications > 99 ? '99+' : notifications.applications}
                        </span>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-neutral-600 text-sm leading-relaxed mb-3">
                      Examinez les dossiers complets des candidats : revenus, références, historique de location. Acceptez ou refusez les candidatures et générez le bail directement.
                    </p>
                    <div className="text-xs text-neutral-500 space-y-1">
                      <p>• Dossiers complets avec documents</p>
                      <p>• Filtrer par critères (revenus, garanties)</p>
                      <p>• Accepter/refuser en un clic</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/landlord/messages">
                <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer border border-neutral-200 hover:border-neutral-300 rounded-xl relative">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-neutral-900 rounded-lg flex items-center justify-center">
                        <MessageSquare className="h-5 w-5 text-white" />
                      </div>
                      <span className="text-lg font-medium text-neutral-900 flex-1">Messages</span>
                      {notifications.messages > 0 && (
                        <span className="bg-red-500 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center min-w-[24px]">
                          {notifications.messages > 99 ? '99+' : notifications.messages}
                        </span>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-neutral-600 text-sm leading-relaxed mb-3">
                      Échangez avec vos locataires via la messagerie intégrée. Tous vos échanges sont centralisés et traçables pour chaque location.
                    </p>
                    <div className="text-xs text-neutral-500 space-y-1">
                      <p>• Messages en temps réel</p>
                      <p>• Historique complet des conversations</p>
                      <p>• Notifications pour nouveaux messages</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/landlord/leases">
                <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer border border-neutral-200 hover:border-neutral-300 rounded-xl">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-neutral-900 rounded-lg flex items-center justify-center">
                        <FileText className="h-5 w-5 text-white" />
                      </div>
                      <span className="text-lg font-medium text-neutral-900">Contrats</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-neutral-600 text-sm leading-relaxed mb-3">
                      Générez des baux conformes, signez-les électroniquement avec vos locataires, et stockez tous vos documents en sécurité. Gérez les renouvellements.
                    </p>
                    <div className="text-xs text-neutral-500 space-y-1">
                      <p>• Baux générés automatiquement</p>
                      <p>• Signature électronique sécurisée</p>
                      <p>• Rappels pour renouvellements</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/landlord/visits">
                <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer border border-neutral-200 hover:border-neutral-300 rounded-xl relative">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-neutral-900 rounded-lg flex items-center justify-center">
                        <CalendarCheck className="h-5 w-5 text-white" />
                      </div>
                      <span className="text-lg font-medium text-neutral-900 flex-1">Demandes de visite</span>
                      {notifications.visitRequests > 0 && (
                        <span className="bg-red-500 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center min-w-[24px]">
                          {notifications.visitRequests > 99 ? '99+' : notifications.visitRequests}
                        </span>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-neutral-600 text-sm leading-relaxed mb-3">
                      Organisez les visites de vos logements. Les locataires peuvent réserver des créneaux disponibles ou demander un rendez-vous personnalisé.
                    </p>
                    <div className="text-xs text-neutral-500 space-y-1">
                      <p>• Calendrier de disponibilités</p>
                      <p>• Créneaux réservables en ligne</p>
                      <p>• Confirmations automatiques</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}


