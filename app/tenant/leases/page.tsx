"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { ArrowLeft, FileText, Calendar, DollarSign, CheckCircle, AlertCircle, Clock } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface Lease {
  id: string;
  startDate: string;
  endDate: string;
  monthlyRent: number;
  deposit: number;
  status: string;
  pdfUrl: string | null;
  finalizedAt: string | null;
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

export default function TenantLeasesPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [leases, setLeases] = useState<Lease[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && (!user || user.role !== "TENANT")) {
      router.push("/auth/signin");
    } else if (user && user.role === "TENANT") {
      fetchLeases();
    }
  }, [user, authLoading, router]);

  const fetchLeases = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/tenant/leases", {
        cache: 'no-store',
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || "Erreur lors du chargement des baux");
      }

      const data = await response.json();
      setLeases(data.leases || []);
    } catch (err: any) {
      setError(err.message || "Erreur lors du chargement des baux");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'FINALIZED':
        return (
          <Badge className="bg-green-100 text-green-800 border-green-200">
            <CheckCircle className="h-3 w-3 mr-1" />
            Finalisé
          </Badge>
        );
      case 'OWNER_SIGNED':
        return (
          <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
            <Clock className="h-3 w-3 mr-1" />
            En attente de votre signature
          </Badge>
        );
      case 'TENANT_SIGNED':
        return (
          <Badge className="bg-blue-100 text-blue-800 border-blue-200">
            <Clock className="h-3 w-3 mr-1" />
            En attente de signature du propriétaire
          </Badge>
        );
      case 'DRAFT':
        return (
          <Badge className="bg-gray-100 text-gray-800 border-gray-200">
            <AlertCircle className="h-3 w-3 mr-1" />
            Brouillon
          </Badge>
        );
      default:
        return (
          <Badge className="bg-gray-100 text-gray-800 border-gray-200">
            {status}
          </Badge>
        );
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

  if (!user || user.role !== "TENANT") {
    return null;
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="mb-8">
            <Link href="/tenant/dashboard" className="inline-flex items-center text-neutral-600 hover:text-neutral-900 mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour au tableau de bord
            </Link>
            <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
              <FileText className="h-8 w-8 text-neutral-900" />
              Suivi des baux
            </h1>
            <p className="text-gray-600">
              Gérez et suivez tous vos baux de location
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
                <p className="text-gray-600 text-lg mb-2">Aucun bail trouvé</p>
                <p className="text-gray-500 text-sm">
                  Vous n'avez pas encore de baux. Les baux apparaîtront ici une fois qu'une candidature sera acceptée.
                </p>
              </CardContent>
            </Card>
          )}

          <div className="grid gap-6">
            {leases.map((lease) => (
              <Card key={lease.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-xl mb-2">
                        {lease.application.listing.title}
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
                      {getStatusBadge(lease.status)}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6 mb-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <span className="text-gray-600">Début du bail :</span>
                        <span className="font-semibold text-gray-900">
                          {format(new Date(lease.startDate), "d MMMM yyyy", { locale: fr })}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <span className="text-gray-600">Fin du bail :</span>
                        <span className="font-semibold text-gray-900">
                          {format(new Date(lease.endDate), "d MMMM yyyy", { locale: fr })}
                        </span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <DollarSign className="h-4 w-4 text-gray-500" />
                        <span className="text-gray-600">Loyer mensuel :</span>
                        <span className="font-semibold text-gray-900">
                          {lease.monthlyRent.toLocaleString('fr-CA', { style: 'currency', currency: 'CAD' })}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <DollarSign className="h-4 w-4 text-gray-500" />
                        <span className="text-gray-600">Dépôt de garantie :</span>
                        <span className="font-semibold text-gray-900">
                          {lease.deposit.toLocaleString('fr-CA', { style: 'currency', currency: 'CAD' })}
                        </span>
                      </div>
                    </div>
                  </div>

                  {lease.tenantSignature && (
                    <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-sm text-green-800">
                        <strong>Vous avez signé le :</strong> {format(new Date(lease.tenantSignature.signedAt), "d MMMM yyyy à HH:mm", { locale: fr })}
                      </p>
                    </div>
                  )}

                  {lease.ownerSignature && (
                    <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm text-blue-800">
                        <strong>Propriétaire a signé le :</strong> {format(new Date(lease.ownerSignature.signedAt), "d MMMM yyyy à HH:mm", { locale: fr })}
                      </p>
                    </div>
                  )}

                  {lease.status === 'FINALIZED' && lease.finalizedAt && (
                    <div className="mb-4 p-3 bg-neutral-50 border border-neutral-200 rounded-lg">
                      <p className="text-sm text-neutral-800">
                        <strong>Bail finalisé le :</strong> {format(new Date(lease.finalizedAt), "d MMMM yyyy à HH:mm", { locale: fr })}
                      </p>
                    </div>
                  )}

                  <div className="flex items-center gap-3 pt-4 border-t">
                    <Button
                      asChild
                      variant="outline"
                      className="flex-1"
                    >
                      <Link href={`/tenant/leases/${lease.id}`}>
                        <FileText className="h-4 w-4 mr-2" />
                        Voir le contrat
                      </Link>
                    </Button>
                    {lease.status === 'FINALIZED' && (
                      <Button
                        asChild
                        variant="default"
                        className="flex-1 bg-neutral-900 hover:bg-neutral-800"
                      >
                        <Link href={`/tenant/rent-management/${lease.id}`}>
                          <DollarSign className="h-4 w-4 mr-2" />
                          Gestion de loyer
                        </Link>
                      </Button>
                    )}
                    {lease.pdfUrl && (
                      <Button
                        asChild
                        variant="outline"
                        className="flex-1"
                      >
                        <a href={lease.pdfUrl} target="_blank" rel="noopener noreferrer">
                          <FileText className="h-4 w-4 mr-2" />
                          Télécharger le PDF
                        </a>
                      </Button>
                    )}
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

