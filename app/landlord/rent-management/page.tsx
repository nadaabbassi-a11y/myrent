"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { ArrowLeft, FileText, Calendar, DollarSign, Mail, Phone, MessageSquare, AlertCircle, CheckCircle } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface Lease {
  id: string;
  startDate: string;
  endDate: string;
  monthlyRent: number;
  deposit: number;
  status: string;
  finalizedAt: string | null;
  application: {
    listing: {
      id: string;
      title: string;
      address: string | null;
      city: string | null;
      area: string | null;
    };
    tenant: {
      id: string;
      user: {
        id: string;
        name: string | null;
        email: string;
      };
      phone: string | null;
    };
    messageThreadId: string | null;
  };
  payments: Array<{
    id: string;
    amount: number;
    type: string;
    status: string;
    dueDate: string | null;
    paidAt: string | null;
    createdAt: string;
  }>;
  balance: {
    totalDue: number;
    totalPaid: number;
    balance: number;
    monthsDue: number;
  };
}

export default function RentManagementPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [leases, setLeases] = useState<Lease[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && (!user || user.role !== "LANDLORD")) {
      router.push("/auth/signin");
    } else if (user && user.role === "LANDLORD") {
      fetchLeases();
    }
  }, [user, authLoading, router]);

  const fetchLeases = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/landlord/rent-management", {
        cache: 'no-store',
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || "Erreur lors du chargement des données");
      }

      const data = await response.json();
      setLeases(data.leases || []);
    } catch (err: any) {
      setError(err.message || "Erreur lors du chargement des données");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading || isLoading) {
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

  if (!user || user.role !== "LANDLORD") {
    return null;
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="mb-8">
            <Link href="/landlord/dashboard" className="inline-flex items-center text-gray-600 hover:text-violet-600 mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour au tableau de bord
            </Link>
            <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
              <DollarSign className="h-8 w-8 text-violet-600" />
              Gestion de loyer
            </h1>
            <p className="text-gray-600">
              Gérez les paiements et contactez vos locataires pour les baux signés
            </p>
          </div>

          {error && (
            <Card className="border-2 border-red-200 bg-red-50 mb-6">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3 text-red-700">
                  <AlertCircle className="h-6 w-6 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-semibold mb-2">Erreur</p>
                    <p className="text-sm">{error}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {leases.length === 0 && !isLoading && (
            <Card>
              <CardContent className="pt-6 text-center py-12">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 text-lg mb-2">Aucun bail finalisé</p>
                <p className="text-gray-500 text-sm">
                  Les baux finalisés apparaîtront ici pour la gestion de loyer.
                </p>
              </CardContent>
            </Card>
          )}

          <div className="grid gap-4">
            {leases.map((lease) => (
              <Card 
                key={lease.id} 
                className="hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => router.push(`/landlord/rent-management/${lease.id}`)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-xl mb-2 flex items-center gap-2">
                        {lease.application.listing.title}
                        <Badge className="bg-green-100 text-green-800 border-green-200">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Finalisé
                        </Badge>
                      </CardTitle>
                      <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                        {lease.application.listing.address && (
                          <span>{lease.application.listing.address}</span>
                        )}
                        <span>{lease.application.listing.city}</span>
                        {lease.application.listing.area && (
                          <span className="text-gray-500">({lease.application.listing.area})</span>
                        )}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-4">
                    {/* Locataire */}
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Locataire</p>
                      <p className="font-semibold text-gray-900">
                        {lease.application.tenant.user.name || lease.application.tenant.user.email}
                      </p>
                    </div>
                    {/* Balance */}
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Solde restant</p>
                      <p className={`text-lg font-bold ${
                        lease.balance.balance > 0 ? 'text-red-600' : 'text-green-600'
                      }`}>
                        {lease.balance.balance.toLocaleString('fr-CA', { style: 'currency', currency: 'CAD' })}
                      </p>
                    </div>
                    {/* Loyer mensuel */}
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Loyer mensuel</p>
                      <p className="font-semibold text-gray-900">
                        {lease.monthlyRent.toLocaleString('fr-CA', { style: 'currency', currency: 'CAD' })}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t">
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/landlord/rent-management/${lease.id}`);
                      }}
                    >
                      Voir les détails
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}

