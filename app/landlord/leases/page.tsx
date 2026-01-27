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
  signedAt: string | null;
  application: {
    listing: {
      id: string;
      title: string;
      address: string | null;
    };
    tenant: {
      user: {
        name: string | null;
        email: string;
      };
    };
  };
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
      // TODO: Créer une API route pour récupérer les contrats du landlord
      // Pour l'instant, on affiche un message
      setLeases([]);
    } catch (err) {
      setError("Erreur lors du chargement des contrats");
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
                            {lease.signedAt ? (
                              <Badge className="bg-green-500">Signé</Badge>
                            ) : (
                              <Badge className="bg-yellow-500">En attente de signature</Badge>
                            )}
                          </div>
                          <p className="text-gray-600 mb-2">
                            <strong>Locataire:</strong> {lease.application.tenant.user.name || lease.application.tenant.user.email}
                          </p>
                          {lease.application.listing.address && (
                            <p className="text-gray-600 mb-2">
                              <strong>Adresse:</strong> {lease.application.listing.address}
                            </p>
                          )}
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
                        <div className="ml-4">
                          <Link href={`/listings/${lease.application.listing.id}`}>
                            <Button variant="outline">
                              Voir l'annonce
                            </Button>
                          </Link>
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

