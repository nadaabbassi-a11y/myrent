"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { ArrowLeft, FileText, Calendar, DollarSign, Mail, Phone, MessageSquare, AlertCircle, CheckCircle, Home, User, Download, Wifi, Droplet, Zap, Flame } from "lucide-react";
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
      wifiIncluded: boolean;
      heatingIncluded: boolean;
      hotWaterIncluded: boolean;
      electricityIncluded: boolean;
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

export default function RentManagementDetailsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const leaseId = params.id as string;
  const [lease, setLease] = useState<Lease | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && (!user || user.role !== "LANDLORD")) {
      router.push("/auth/signin");
    } else if (user && user.role === "LANDLORD" && leaseId) {
      fetchLease();
    }
  }, [user, authLoading, router, leaseId]);

  const fetchLease = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/landlord/rent-management/${leaseId}`, {
        cache: 'no-store',
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || "Erreur lors du chargement des données");
      }

      const data = await response.json();
      setLease(data.lease);
    } catch (err: any) {
      setError(err.message || "Erreur lors du chargement des données");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleContact = (messageThreadId: string | null, tenantEmail: string) => {
    if (messageThreadId) {
      router.push(`/tenant/messages?thread=${messageThreadId}`);
    } else {
      router.push(`/tenant/messages?email=${tenantEmail}`);
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

  if (!lease) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-gray-50 py-12">
          <div className="container mx-auto px-4 max-w-6xl">
            <Card className="border-2 border-red-200 bg-red-50">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3 text-red-700">
                  <AlertCircle className="h-6 w-6 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-semibold mb-2">Bail introuvable</p>
                    {error && (
                      <p className="text-sm text-red-600">{error}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="mb-8">
            <Link href="/landlord/rent-management" className="inline-flex items-center text-gray-600 hover:text-violet-600 mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour à la liste
            </Link>
            <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
              <Home className="h-8 w-8 text-violet-600" />
              {lease.application.listing.title}
            </h1>
            <p className="text-gray-600">
              {lease.application.listing.address && `${lease.application.listing.address}, `}
              {lease.application.listing.city}
              {lease.application.listing.area && ` (${lease.application.listing.area})`}
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

          <div className="grid gap-6">
            {/* Informations du locataire */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-violet-600" />
                  Locataire
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Nom</p>
                      <p className="font-semibold text-gray-900 text-lg">
                        {lease.application.tenant.user.name || 'Non renseigné'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Email</p>
                      <p className="font-semibold text-gray-900">
                        {lease.application.tenant.user.email}
                      </p>
                    </div>
                    {lease.application.tenant.phone && (
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Téléphone</p>
                        <p className="font-semibold text-gray-900">
                          {lease.application.tenant.phone}
                        </p>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    <Button
                      variant="outline"
                      onClick={() => handleContact(
                        lease.application.messageThreadId,
                        lease.application.tenant.user.email
                      )}
                      className="w-full"
                    >
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Contacter par message
                    </Button>
                    {lease.application.tenant.phone && (
                      <Button
                        variant="outline"
                        asChild
                        className="w-full"
                      >
                        <a href={`tel:${lease.application.tenant.phone}`}>
                          <Phone className="h-4 w-4 mr-2" />
                          Appeler
                        </a>
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      asChild
                      className="w-full"
                    >
                      <a href={`mailto:${lease.application.tenant.user.email}`}>
                        <Mail className="h-4 w-4 mr-2" />
                        Envoyer un email
                      </a>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Balance de paiement */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-violet-600" />
                  Balance de paiement
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">Dépôt de garantie</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {lease.deposit.toLocaleString('fr-CA', { style: 'currency', currency: 'CAD' })}
                      </p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">
                        Loyers dus ({lease.balance.monthsDue} mois)
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        {(lease.balance.monthsDue * lease.monthlyRent).toLocaleString('fr-CA', { style: 'currency', currency: 'CAD' })}
                      </p>
                    </div>
                  </div>
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <p className="text-sm font-semibold text-gray-700">Total dû</p>
                      <p className="text-xl font-bold text-gray-900">
                        {lease.balance.totalDue.toLocaleString('fr-CA', { style: 'currency', currency: 'CAD' })}
                      </p>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                      <p className="text-sm font-semibold text-green-700">Total payé</p>
                      <p className="text-xl font-bold text-green-700">
                        {lease.balance.totalPaid.toLocaleString('fr-CA', { style: 'currency', currency: 'CAD' })}
                      </p>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t-2 border-blue-400">
                      <p className="text-base font-bold text-blue-900">Solde restant</p>
                      <p className={`text-2xl font-bold ${
                        lease.balance.balance > 0 ? 'text-red-600' : 'text-green-600'
                      }`}>
                        {lease.balance.balance.toLocaleString('fr-CA', { style: 'currency', currency: 'CAD' })}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Informations du bail */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-violet-600" />
                  Informations du bail
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Date de début</p>
                      <p className="font-semibold text-gray-900">
                        {format(new Date(lease.startDate), "d MMMM yyyy", { locale: fr })}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Date de fin</p>
                      <p className="font-semibold text-gray-900">
                        {format(new Date(lease.endDate), "d MMMM yyyy", { locale: fr })}
                      </p>
                    </div>
                    {lease.finalizedAt && (
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Bail finalisé le</p>
                        <p className="font-semibold text-gray-900">
                          {format(new Date(lease.finalizedAt), "d MMMM yyyy à HH:mm", { locale: fr })}
                        </p>
                      </div>
                    )}
                  </div>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Loyer mensuel</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {lease.monthlyRent.toLocaleString('fr-CA', { style: 'currency', currency: 'CAD' })}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Dépôt de garantie</p>
                      <p className="text-xl font-bold text-gray-900">
                        {lease.deposit.toLocaleString('fr-CA', { style: 'currency', currency: 'CAD' })}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="mt-6 pt-6 border-t">
                  <Button
                    asChild
                    variant="outline"
                    className="w-full"
                  >
                    <Link href={`/landlord/leases/${lease.id}`}>
                      <FileText className="h-4 w-4 mr-2" />
                      Voir le contrat complet
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Ce que le loyer couvre */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Home className="h-5 w-5 text-violet-600" />
                  Ce que le loyer couvre
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  {lease.application.listing.wifiIncluded && (
                    <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <Wifi className="h-5 w-5 text-green-600" />
                      <div>
                        <p className="font-semibold text-gray-900">Wi-Fi</p>
                        <p className="text-sm text-gray-600">Inclus dans le loyer</p>
                      </div>
                    </div>
                  )}
                  {lease.application.listing.heatingIncluded && (
                    <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <Flame className="h-5 w-5 text-green-600" />
                      <div>
                        <p className="font-semibold text-gray-900">Chauffage</p>
                        <p className="text-sm text-gray-600">Inclus dans le loyer</p>
                      </div>
                    </div>
                  )}
                  {lease.application.listing.hotWaterIncluded && (
                    <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <Droplet className="h-5 w-5 text-green-600" />
                      <div>
                        <p className="font-semibold text-gray-900">Eau chaude</p>
                        <p className="text-sm text-gray-600">Inclus dans le loyer</p>
                      </div>
                    </div>
                  )}
                  {lease.application.listing.electricityIncluded && (
                    <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <Zap className="h-5 w-5 text-green-600" />
                      <div>
                        <p className="font-semibold text-gray-900">Électricité</p>
                        <p className="text-sm text-gray-600">Inclus dans le loyer</p>
                      </div>
                    </div>
                  )}
                  {!lease.application.listing.wifiIncluded && 
                   !lease.application.listing.heatingIncluded && 
                   !lease.application.listing.hotWaterIncluded && 
                   !lease.application.listing.electricityIncluded && (
                    <div className="col-span-2 text-center py-4 text-gray-500">
                      <p>Aucun service inclus dans le loyer</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Paiements */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-violet-600" />
                  Historique des paiements
                </CardTitle>
              </CardHeader>
              <CardContent>
                {lease.payments.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p>Aucun paiement enregistré</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {lease.payments.map((payment) => (
                      <div
                        key={payment.id}
                        className="flex justify-between items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-1">
                            <span className="font-semibold text-gray-900">
                              {payment.type === 'rent' ? 'Loyer' : payment.type === 'deposit' ? 'Dépôt' : 'Frais'}
                            </span>
                            {payment.dueDate && (
                              <span className="text-sm text-gray-500">
                                Échéance : {format(new Date(payment.dueDate), "d MMM yyyy", { locale: fr })}
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-gray-600">
                            {payment.paidAt ? (
                              <span>Payé le {format(new Date(payment.paidAt), "d MMMM yyyy à HH:mm", { locale: fr })}</span>
                            ) : (
                              <span>Créé le {format(new Date(payment.createdAt), "d MMMM yyyy", { locale: fr })}</span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-lg font-bold text-gray-900">
                            {payment.amount.toLocaleString('fr-CA', { style: 'currency', currency: 'CAD' })}
                          </span>
                          <Badge
                            className={
                              payment.status === 'paid'
                                ? 'bg-green-100 text-green-800 border-green-200'
                                : payment.status === 'pending'
                                ? 'bg-yellow-100 text-yellow-800 border-yellow-200'
                                : 'bg-red-100 text-red-800 border-red-200'
                            }
                          >
                            {payment.status === 'paid' ? 'Payé' : payment.status === 'pending' ? 'En attente' : 'Échoué'}
                          </Badge>
                          {payment.status === 'paid' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => window.open(`/api/payments/${payment.id}/receipt`, '_blank')}
                              className="ml-2"
                            >
                              <Download className="h-4 w-4 mr-2" />
                              Reçu
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </>
  );
}

