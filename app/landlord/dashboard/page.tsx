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
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600 mb-4"></div>
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
      <main className="min-h-screen bg-gradient-to-br from-gray-50 via-violet-50/30 to-purple-50/30 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            {/* Header avec gradient */}
            <div className="mb-10">
              <div className="inline-block mb-4">
                <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                  Bienvenue, {user.name || user.email?.split('@')[0] || 'Propriétaire'} !
                </h1>
              </div>
              <p className="text-gray-600 text-lg">Gérez vos annonces et vos locataires en toute simplicité</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Link href="/landlord/listings/new">
                <Card className="group relative overflow-hidden hover:shadow-2xl transition-all duration-500 cursor-pointer border-2 border-dashed border-violet-300 hover:border-violet-500 bg-gradient-to-br from-white to-violet-50/50 hover:scale-105">
                  <div className="absolute inset-0 bg-gradient-to-br from-violet-500/0 to-purple-500/0 group-hover:from-violet-500/10 group-hover:to-purple-500/10 transition-all duration-500"></div>
                  <CardHeader className="relative z-10">
                    <CardTitle className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-lg group-hover:scale-110 transition-transform duration-300">
                        <Plus className="h-5 w-5" />
                      </div>
                      <span className="text-xl font-bold text-gray-900 group-hover:text-violet-600 transition-colors">Créer une annonce</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="relative z-10">
                    <p className="text-gray-600 group-hover:text-gray-700 transition-colors">
                      Publiez une nouvelle annonce pour votre logement.
                    </p>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/landlord/listings">
                <Card className="group relative overflow-hidden hover:shadow-2xl transition-all duration-500 cursor-pointer bg-gradient-to-br from-white to-indigo-50/50 hover:scale-105">
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/0 to-blue-500/0 group-hover:from-indigo-500/10 group-hover:to-blue-500/10 transition-all duration-500"></div>
                  <CardHeader className="relative z-10">
                    <CardTitle className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 text-white shadow-lg group-hover:scale-110 transition-transform duration-300">
                        <Home className="h-5 w-5" />
                      </div>
                      <span className="text-xl font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">Mes annonces</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="relative z-10">
                    <p className="text-gray-600 group-hover:text-gray-700 transition-colors">
                      Gérez vos annonces de location.
                    </p>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/landlord/applications">
                <Card className="group relative overflow-hidden hover:shadow-2xl transition-all duration-500 cursor-pointer bg-gradient-to-br from-white to-emerald-50/50 hover:scale-105">
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/0 to-teal-500/0 group-hover:from-emerald-500/10 group-hover:to-teal-500/10 transition-all duration-500"></div>
                  <CardHeader className="relative z-10">
                    <CardTitle className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg group-hover:scale-110 transition-transform duration-300">
                        <Users className="h-5 w-5" />
                      </div>
                      <span className="text-xl font-bold text-gray-900 group-hover:text-emerald-600 transition-colors flex-1">Candidatures</span>
                      {notifications.applications > 0 && (
                        <span className="ml-auto bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center min-w-[24px] shadow-lg notification-badge">
                          {notifications.applications > 99 ? '99+' : notifications.applications}
                        </span>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="relative z-10">
                    <p className="text-gray-600 group-hover:text-gray-700 transition-colors">
                      Consultez et gérez les candidatures des locataires.
                    </p>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/landlord/messages">
                <Card className="group relative overflow-hidden hover:shadow-2xl transition-all duration-500 cursor-pointer bg-gradient-to-br from-white to-cyan-50/50 hover:scale-105">
                  <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/0 to-blue-500/0 group-hover:from-cyan-500/10 group-hover:to-blue-500/10 transition-all duration-500"></div>
                  <CardHeader className="relative z-10">
                    <CardTitle className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-lg group-hover:scale-110 transition-transform duration-300">
                        <MessageSquare className="h-5 w-5" />
                      </div>
                      <span className="text-xl font-bold text-gray-900 group-hover:text-cyan-600 transition-colors flex-1">Messages</span>
                      {notifications.messages > 0 && (
                        <span className="ml-auto bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center min-w-[24px] shadow-lg notification-badge">
                          {notifications.messages > 99 ? '99+' : notifications.messages}
                        </span>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="relative z-10">
                    <p className="text-gray-600 group-hover:text-gray-700 transition-colors">
                      Communiquez avec les locataires.
                    </p>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/landlord/leases">
                <Card className="group relative overflow-hidden hover:shadow-2xl transition-all duration-500 cursor-pointer bg-gradient-to-br from-white to-amber-50/50 hover:scale-105">
                  <div className="absolute inset-0 bg-gradient-to-br from-amber-500/0 to-orange-500/0 group-hover:from-amber-500/10 group-hover:to-orange-500/10 transition-all duration-500"></div>
                  <CardHeader className="relative z-10">
                    <CardTitle className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-lg group-hover:scale-110 transition-transform duration-300">
                        <FileText className="h-5 w-5" />
                      </div>
                      <span className="text-xl font-bold text-gray-900 group-hover:text-amber-600 transition-colors">Contrats</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="relative z-10">
                    <p className="text-gray-600 group-hover:text-gray-700 transition-colors">
                      Gérez les contrats de location.
                    </p>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/landlord/visits">
                <Card className="group relative overflow-hidden hover:shadow-2xl transition-all duration-500 cursor-pointer bg-gradient-to-br from-white to-rose-50/50 hover:scale-105">
                  <div className="absolute inset-0 bg-gradient-to-br from-rose-500/0 to-pink-500/0 group-hover:from-rose-500/10 group-hover:to-pink-500/10 transition-all duration-500"></div>
                  <CardHeader className="relative z-10">
                    <CardTitle className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 text-white shadow-lg group-hover:scale-110 transition-transform duration-300">
                        <CalendarCheck className="h-5 w-5" />
                      </div>
                      <span className="text-xl font-bold text-gray-900 group-hover:text-rose-600 transition-colors flex-1">Demandes de visite</span>
                      {notifications.visitRequests > 0 && (
                        <span className="ml-auto bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center min-w-[24px] shadow-lg notification-badge">
                          {notifications.visitRequests > 99 ? '99+' : notifications.visitRequests}
                        </span>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="relative z-10">
                    <p className="text-gray-600 group-hover:text-gray-700 transition-colors">
                      Gérez les demandes de visite pour vos annonces.
                    </p>
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


