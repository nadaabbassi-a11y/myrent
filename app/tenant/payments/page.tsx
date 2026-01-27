"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useLanguageContext } from "@/contexts/LanguageContext";
import { CreditCard, CheckCircle, Clock, XCircle, DollarSign, Home } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";

interface Payment {
  id: string;
  amount: number;
  type: string;
  status: string;
  paidAt: string | null;
  createdAt: string;
  lease: {
    id: string;
    monthlyRent: number;
    application: {
      listing: {
        id: string;
        title: string;
        city: string;
        area: string | null;
      };
    };
  };
}

export default function PaymentsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const { t } = useLanguageContext();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth/signin");
    } else if (user && user.role === "TENANT") {
      fetchPayments();
    }
  }, [user, authLoading, router]);

  const fetchPayments = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/tenant/payments");

      if (!response.ok) {
        throw new Error("Erreur lors du chargement des paiements");
      }

      const data = await response.json();
      setPayments(data.payments);
    } catch (err) {
      setError("Erreur lors du chargement des paiements");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">
            <Clock className="h-3 w-3 mr-1" />
            {t("payments.status.pending")}
          </Badge>
        );
      case "completed":
        return (
          <Badge className="bg-green-100 text-green-800 border-green-300">
            <CheckCircle className="h-3 w-3 mr-1" />
            {t("payments.status.completed")}
          </Badge>
        );
      case "failed":
        return (
          <Badge className="bg-red-100 text-red-800 border-red-300">
            <XCircle className="h-3 w-3 mr-1" />
            {t("payments.status.failed")}
          </Badge>
        );
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "rent":
        return "Loyer";
      case "deposit":
        return "Dépôt de garantie";
      case "fee":
        return "Frais";
      default:
        return type;
    }
  };

  const totalPaid = payments
    .filter((p) => p.status === "completed")
    .reduce((sum, p) => sum + p.amount, 0);

  const totalPending = payments
    .filter((p) => p.status === "pending")
    .reduce((sum, p) => sum + p.amount, 0);

  if (authLoading || isLoading) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-gray-50 py-12">
          <div className="container mx-auto px-4">
            <div className="text-center">{t("common.loading")}</div>
          </div>
        </main>
      </>
    );
  }

  if (!user || user.role !== "TENANT") {
    return null;
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <h1 className="text-3xl font-bold text-gray-900">{t("payments.title")}</h1>
              <Link href="/listings">
                <Button variant="outline">
                  <Home className="h-4 w-4 mr-2" />
                  {t("dashboard.tenant.searchListing")}
                </Button>
              </Link>
            </div>

            {/* Statistiques */}
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    {t("payments.totalPaid")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {totalPaid.toLocaleString('fr-CA')} $
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    {t("payments.pending")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-yellow-600">
                    {totalPending.toLocaleString('fr-CA')} $
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    {t("payments.totalPayments")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">
                    {payments.length}
                  </div>
                </CardContent>
              </Card>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
                {error}
              </div>
            )}

            {payments.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <CreditCard className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {t("payments.noPayments")}
                  </h3>
                  <p className="text-gray-600 mb-6">
                    {t("payments.noPaymentsDesc")}
                  </p>
                  <Link href="/listings">
                    <Button className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white">
                      {t("payments.browseListings")}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {payments.map((payment) => (
                  <Card key={payment.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-xl mb-2">
                            {payment.lease.application.listing.title}
                          </CardTitle>
                          <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                            <span>
                              {payment.lease.application.listing.city}
                              {payment.lease.application.listing.area
                                ? `, ${payment.lease.application.listing.area}`
                                : ""}
                            </span>
                            <span className="font-semibold">
                              {getTypeLabel(payment.type)}
                            </span>
                          </div>
                          <div className="flex items-center gap-3">
                            {getStatusBadge(payment.status)}
                            <span className="text-sm text-gray-500">
                              {payment.paidAt
                                ? `${t("payments.paidOn")} ${format(new Date(payment.paidAt), "d MMM yyyy")}`
                                : `${t("payments.createdOn")} ${format(new Date(payment.createdAt), "d MMM yyyy")}`}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-violet-600">
                            {payment.amount.toLocaleString('fr-CA')} $
                          </div>
                          {payment.status === "pending" && (
                            <Button
                              className="mt-2 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white"
                              size="sm"
                            >
                              <DollarSign className="h-4 w-4 mr-1" />
                              {t("payments.payNow")}
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
}

