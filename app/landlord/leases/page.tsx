"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { ArrowLeft, FileText, Calendar, DollarSign } from "lucide-react";

interface Lease {
  id: string;
  startDate: string;
  endDate: string;
  monthlyRent: number;
  deposit: number;
  status: string;
  signedAt: string | null;
  tenantSignature: {
    id: string;
    signedAt: string;
    signerName: string | null;
  } | null;
  ownerSignature: {
    id: string;
    signedAt: string;
    signerName: string | null;
  } | null;
  stripeSubscriptionId: string | null;
  application: {
    listing: {
      id: string;
      title: string;
      address: string | null;
      city: string | null;
      area: string | null;
    };
    tenant: {
      user: {
        id: string;
        name: string | null;
        email: string;
      };
    };
  };
  payments?: Array<{
    id: string;
    amount: number;
    type: string;
    status: string;
    paidAt: string | null;
    dueDate: string | null;
    createdAt: string;
  }>;
}

export default function LandlordLeasesPage() {
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
      const response = await fetch("/api/landlord/leases", {
        cache: 'no-store',
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || "Erreur lors du chargement des contrats");
      }

      const data = await response.json();
      setLeases(data.leases || []);
    } catch (err: any) {
      setError(err.message || "Erreur lors du chargement des contrats");
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
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <Link
              href="/landlord/dashboard"
              className="inline-flex items-center gap-2 text-gray-600 hover:text-violet-600 mb-6 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Retour au tableau de bord
            </Link>

            <div className="flex items-center justify-between mb-8">
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <FileText className="h-8 w-8 text-violet-600" />
                Contrats
              </h1>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
                {error}
              </div>
            )}

            {leases.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 mb-4">Aucun contrat pour le moment.</p>
                  <p className="text-sm text-gray-400">
                    Les contrats seront affichés ici une fois qu'une candidature aura été approuvée.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {leases.map((lease) => (
                  <Card key={lease.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-xl font-semibold text-gray-900">
                              {lease.application.listing.title}
                            </h3>
                            {lease.status === 'FINALIZED' ? (
                              <Badge className="bg-green-500">Finalisé</Badge>
                            ) : lease.status === 'TENANT_SIGNED' ? (
                              <Badge className="bg-yellow-500">En attente de votre signature</Badge>
                            ) : lease.status === 'OWNER_SIGNED' ? (
                              <Badge className="bg-yellow-500">En attente de signature du locataire</Badge>
                            ) : (
                              <Badge className="bg-gray-500">Brouillon</Badge>
                            )}
                            {lease.stripeSubscriptionId && (
                              <Badge className="bg-blue-500">Paiement configuré</Badge>
                            )}
                          </div>
                          <p className="text-gray-600 mb-2">
                            <strong>Locataire:</strong> {lease.application.tenant.user.name || lease.application.tenant.user.email}
                          </p>
                          <p className="text-gray-600 mb-2">
                            <strong>Adresse:</strong>{" "}
                            {lease.application.listing.address || 
                             `${lease.application.listing.area ? lease.application.listing.area + ', ' : ''}${lease.application.listing.city || 'N/A'}`}
                          </p>
                          <div className="grid md:grid-cols-2 gap-4 mt-4">
                            <div className="flex items-center gap-2 text-gray-700">
                              <Calendar className="h-4 w-4 text-violet-600" />
                              <span>
                                <strong>Début:</strong> {new Date(lease.startDate).toLocaleDateString('fr-FR')}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-700">
                              <Calendar className="h-4 w-4 text-violet-600" />
                              <span>
                                <strong>Fin:</strong> {new Date(lease.endDate).toLocaleDateString('fr-FR')}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-700">
                              <DollarSign className="h-4 w-4 text-violet-600" />
                              <span>
                                <strong>Loyer mensuel:</strong> {lease.monthlyRent.toLocaleString('fr-CA')} $
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-700">
                              <DollarSign className="h-4 w-4 text-violet-600" />
                              <span>
                                <strong>Dépôt:</strong> {lease.deposit.toLocaleString('fr-CA')} $
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="ml-4 flex flex-col gap-2">
                          <Link href={`/landlord/leases/${lease.id}`}>
                            <Button variant="default" size="sm">
                              Voir le contrat
                            </Button>
                          </Link>
                          <Link href={`/listings/${lease.application.listing.id}`}>
                            <Button variant="outline" size="sm">
                              Voir l'annonce
                            </Button>
                          </Link>
                          {lease.payments && lease.payments.length > 0 && (
                            <div className="mt-2 p-3 bg-gray-50 rounded-lg min-w-[200px]">
                              <p className="text-xs font-semibold text-gray-700 mb-2">
                                Derniers paiements:
                              </p>
                              <div className="space-y-1">
                                {lease.payments.slice(0, 3).map((payment) => (
                                  <div key={payment.id} className="text-xs text-gray-600 flex items-center justify-between">
                                    <span>
                                      {payment.type === 'rent' ? 'Loyer' : payment.type}: {payment.amount.toLocaleString('fr-CA')} $
                                    </span>
                                    <span className={`ml-2 font-medium ${
                                      payment.status === 'paid' ? 'text-green-600' :
                                      payment.status === 'failed' ? 'text-red-600' :
                                      'text-yellow-600'
                                    }`}>
                                      {payment.status === 'paid' ? '✓ Payé' :
                                       payment.status === 'failed' ? '✗ Échoué' :
                                       '⏳ En attente'}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
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

