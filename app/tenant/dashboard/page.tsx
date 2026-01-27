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
      <main className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-3xl font-bold mb-8 text-gray-900">
              {t("dashboard.welcome")}, {user.name || user.email} !
            </h1>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Link href="/listings">
                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Home className="h-5 w-5 text-violet-600" />
                      {t("dashboard.tenant.searchListing")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">
                      {t("dashboard.tenant.searchListingDesc")}
                    </p>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/tenant/profile">
                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5 text-violet-600" />
                      {t("dashboard.tenant.myProfile")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">
                      {t("dashboard.tenant.myProfileDesc")}
                    </p>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/tenant/applications">
                <Card className="hover:shadow-lg transition-shadow cursor-pointer relative">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-violet-600" />
                      {t("dashboard.tenant.myApplications")}
                      {notifications.applications > 0 && (
                        <span className="ml-auto bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center min-w-[20px]">
                          {notifications.applications > 99 ? '99+' : notifications.applications}
                        </span>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">
                      {t("dashboard.tenant.myApplicationsDesc")}
                    </p>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/tenant/messages">
                <Card className="hover:shadow-lg transition-shadow cursor-pointer relative">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MessageSquare className="h-5 w-5 text-violet-600" />
                      {t("dashboard.tenant.messages")}
                      {notifications.messages > 0 && (
                        <span className="ml-auto bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center min-w-[20px]">
                          {notifications.messages > 99 ? '99+' : notifications.messages}
                        </span>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">
                      {t("dashboard.tenant.messagesDesc")}
                    </p>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/tenant/payments">
                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CreditCard className="h-5 w-5 text-violet-600" />
                      {t("dashboard.tenant.payments")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">
                      {t("dashboard.tenant.paymentsDesc")}
                    </p>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/tenant/visits">
                <Card className="hover:shadow-lg transition-shadow cursor-pointer relative">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CalendarCheck className="h-5 w-5 text-violet-600" />
                      Mes visites
                      {notifications.visitRequests > 0 && (
                        <span className="ml-auto bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center min-w-[20px]">
                          {notifications.visitRequests > 99 ? '99+' : notifications.visitRequests}
                        </span>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">
                      Consultez vos demandes de visite.
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

