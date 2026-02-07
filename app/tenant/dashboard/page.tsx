"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useLanguageContext } from "@/contexts/LanguageContext";
import { useNotifications } from "@/hooks/useNotifications";
import { Home, FileText, MessageSquare, CreditCard, User, CalendarCheck } from "lucide-react";
import Link from "next/link";

export default function TenantDashboard() {
  const { user, isLoading } = useAuth();
  const { t } = useLanguageContext();
  const { notifications } = useNotifications();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !isLoading && !user) {
      router.push("/auth/signin");
    }
  }, [user, isLoading, router, mounted]);

  // Timeout de sécurité pour éviter le blocage infini
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (isLoading) {
        console.warn('[Tenant Dashboard] Auth loading timeout, forcing render');
      }
    }, 5000); // 5 secondes max
    return () => clearTimeout(timeout);
  }, [isLoading]);

  if (!mounted || isLoading) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-gray-50 py-12">
          <div className="container mx-auto px-4">
            <div className="text-center">Chargement...</div>
          </div>
        </main>
      </>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-white py-16">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            <div className="mb-12">
              <h1 className="text-4xl font-medium text-neutral-900 mb-3 tracking-tight">
                {t("dashboard.welcome")}, {user.name || user.email} !
              </h1>
              <p className="text-lg text-neutral-600">
                Gérez vos candidatures, vos contrats et vos paiements en un seul endroit
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Link href="/listings">
                <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer border border-neutral-200 hover:border-neutral-300 rounded-xl">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-neutral-900 rounded-lg flex items-center justify-center">
                        <Home className="h-5 w-5 text-white" />
                      </div>
                      <span className="text-lg font-medium text-neutral-900">{t("dashboard.tenant.searchListing")}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-neutral-600 text-sm leading-relaxed mb-3">
                      Parcourez des centaines d'annonces de location à long terme. Filtrez par prix, localisation, nombre de chambres et caractéristiques.
                    </p>
                    <div className="text-xs text-neutral-500 space-y-1">
                      <p>• Recherche avancée avec filtres</p>
                      <p>• Photos et descriptions détaillées</p>
                      <p>• Carte interactive pour localiser</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/tenant/profile">
                <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer border border-neutral-200 hover:border-neutral-300 rounded-xl">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-neutral-900 rounded-lg flex items-center justify-center">
                        <User className="h-5 w-5 text-white" />
                      </div>
                      <span className="text-lg font-medium text-neutral-900">{t("dashboard.tenant.myProfile")}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-neutral-600 text-sm leading-relaxed mb-3">
                      Complétez votre profil avec vos informations personnelles, revenus et préférences. Cela accélère vos candidatures.
                    </p>
                    <div className="text-xs text-neutral-500 space-y-1">
                      <p>• Informations de contact</p>
                      <p>• Budget et préférences</p>
                      <p>• Documents de vérification</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/tenant/applications">
                <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer border border-neutral-200 hover:border-neutral-300 rounded-xl relative">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-neutral-900 rounded-lg flex items-center justify-center">
                        <FileText className="h-5 w-5 text-white" />
                      </div>
                      <span className="text-lg font-medium text-neutral-900 flex-1">{t("dashboard.tenant.myApplications")}</span>
                      {notifications.applications > 0 && (
                        <span className="bg-red-500 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center min-w-[24px]">
                          {notifications.applications > 99 ? '99+' : notifications.applications}
                        </span>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-neutral-600 text-sm leading-relaxed mb-3">
                      Suivez l'état de toutes vos candidatures : en attente, acceptée ou refusée. Consultez les détails de chaque dossier et communiquez avec les propriétaires.
                    </p>
                    <div className="text-xs text-neutral-500 space-y-1">
                      <p>• Statut en temps réel</p>
                      <p>• Détails de chaque candidature</p>
                      <p>• Notifications de réponses</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/tenant/messages">
                <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer border border-neutral-200 hover:border-neutral-300 rounded-xl relative">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-neutral-900 rounded-lg flex items-center justify-center">
                        <MessageSquare className="h-5 w-5 text-white" />
                      </div>
                      <span className="text-lg font-medium text-neutral-900 flex-1">{t("dashboard.tenant.messages")}</span>
                      {notifications.messages > 0 && (
                        <span className="bg-red-500 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center min-w-[24px]">
                          {notifications.messages > 99 ? '99+' : notifications.messages}
                        </span>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-neutral-600 text-sm leading-relaxed mb-3">
                      Communiquez directement avec les propriétaires pour poser des questions, organiser des visites ou discuter des conditions de location.
                    </p>
                    <div className="text-xs text-neutral-500 space-y-1">
                      <p>• Messages en temps réel</p>
                      <p>• Historique des conversations</p>
                      <p>• Notifications instantanées</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/tenant/payments">
                <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer border border-neutral-200 hover:border-neutral-300 rounded-xl">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-neutral-900 rounded-lg flex items-center justify-center">
                        <CreditCard className="h-5 w-5 text-white" />
                      </div>
                      <span className="text-lg font-medium text-neutral-900">{t("dashboard.tenant.payments")}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-neutral-600 text-sm leading-relaxed mb-3">
                      Payez vos loyers en ligne de manière sécurisée. Consultez votre solde, l'historique des paiements et téléchargez vos reçus.
                    </p>
                    <div className="text-xs text-neutral-500 space-y-1">
                      <p>• Paiement par carte ou virement</p>
                      <p>• Suivi du solde en temps réel</p>
                      <p>• Reçus automatiques en PDF</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/tenant/visits">
                <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer border border-neutral-200 hover:border-neutral-300 rounded-xl relative">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-neutral-900 rounded-lg flex items-center justify-center">
                        <CalendarCheck className="h-5 w-5 text-white" />
                      </div>
                      <span className="text-lg font-medium text-neutral-900 flex-1">Mes visites</span>
                      {notifications.visitRequests > 0 && (
                        <span className="bg-red-500 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center min-w-[24px]">
                          {notifications.visitRequests > 99 ? '99+' : notifications.visitRequests}
                        </span>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-neutral-600 text-sm leading-relaxed mb-3">
                      Réservez des créneaux de visite pour les logements qui vous intéressent, ou demandez un rendez-vous personnalisé au propriétaire.
                    </p>
                    <div className="text-xs text-neutral-500 space-y-1">
                      <p>• Réservation de créneaux disponibles</p>
                      <p>• Demandes de visite personnalisées</p>
                      <p>• Confirmations et rappels</p>
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

