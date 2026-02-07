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
      <main className="min-h-screen bg-white">
        <div className="container mx-auto px-8 py-20 max-w-5xl">
          <div className="mb-20">
            <Link href="/landlord/rent-management" className="inline-flex items-center text-neutral-600 hover:text-neutral-900 transition-colors mb-12 text-base">
              <ArrowLeft className="h-5 w-5 mr-2" />
              Retour
            </Link>
            <div>
              <h1 className="text-4xl font-medium text-neutral-900 mb-5 tracking-tight">
                {lease.application.listing.title}
              </h1>
              <p className="text-neutral-500 text-lg">
                {lease.application.listing.address && `${lease.application.listing.address}, `}
                {lease.application.listing.city}
                {lease.application.listing.area && ` (${lease.application.listing.area})`}
              </p>
            </div>
          </div>

          {error && (
            <div className="mb-16 rounded-xl border border-red-200 bg-red-50/30 p-6">
              <div className="flex items-start gap-5">
                <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium text-red-900 mb-2 text-base">Erreur</p>
                  <p className="text-base text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-20">
            {/* Informations du locataire */}
            <div>
              <h2 className="text-2xl font-medium text-neutral-900 mb-12">Locataire</h2>
              <div className="grid md:grid-cols-2 gap-12">
                <div className="space-y-8">
                  <div>
                    <p className="text-sm text-neutral-500 mb-3 uppercase tracking-wider">Nom</p>
                    <p className="font-medium text-neutral-900 text-xl">
                      {lease.application.tenant.user.name || 'Non renseigné'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-neutral-500 mb-3 uppercase tracking-wider">Email</p>
                    <p className="font-medium text-neutral-900 text-lg">
                      {lease.application.tenant.user.email}
                    </p>
                  </div>
                  {lease.application.tenant.phone && (
                    <div>
                      <p className="text-sm text-neutral-500 mb-3 uppercase tracking-wider">Téléphone</p>
                      <p className="font-medium text-neutral-900 text-lg">
                        {lease.application.tenant.phone}
                      </p>
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-4">
                  <Button
                    variant="outline"
                    onClick={() => handleContact(
                      lease.application.messageThreadId,
                      lease.application.tenant.user.email
                    )}
                    className="w-full h-12 text-base rounded-xl border-neutral-300 text-neutral-700 hover:bg-neutral-50"
                  >
                    <MessageSquare className="h-5 w-5 mr-2" />
                    Contacter par message
                  </Button>
                  {lease.application.tenant.phone && (
                    <Button
                      variant="outline"
                      asChild
                      className="w-full h-12 text-base rounded-xl border-neutral-300 text-neutral-700 hover:bg-neutral-50"
                    >
                      <a href={`tel:${lease.application.tenant.phone}`}>
                        <Phone className="h-5 w-5 mr-2" />
                        Appeler
                      </a>
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    asChild
                    className="w-full h-12 text-base rounded-xl border-neutral-300 text-neutral-700 hover:bg-neutral-50"
                  >
                    <a href={`mailto:${lease.application.tenant.user.email}`}>
                      <Mail className="h-5 w-5 mr-2" />
                      Envoyer un email
                    </a>
                  </Button>
                </div>
              </div>
            </div>

            {/* Balance de paiement */}
            <div>
              <h2 className="text-2xl font-medium text-neutral-900 mb-12">Balance de paiement</h2>
              <div className="space-y-12">
                <div className="grid md:grid-cols-2 gap-12">
                  <div className="pb-10 border-b border-neutral-200">
                    <p className="text-sm text-neutral-500 mb-4 uppercase tracking-wider">Dépôt de garantie</p>
                    <p className="text-4xl font-medium text-neutral-900">
                      {lease.deposit.toLocaleString('fr-CA', { style: 'currency', currency: 'CAD' })}
                    </p>
                  </div>
                  <div className="pb-10 border-b border-neutral-200">
                    <p className="text-sm text-neutral-500 mb-4 uppercase tracking-wider">
                      Loyers dus ({lease.balance.monthsDue} mois)
                    </p>
                    <p className="text-4xl font-medium text-neutral-900">
                      {(lease.balance.monthsDue * lease.monthlyRent).toLocaleString('fr-CA', { style: 'currency', currency: 'CAD' })}
                    </p>
                  </div>
                </div>
                <div className="pt-10 border-t border-neutral-200">
                  <div className="space-y-8">
                    <div className="flex justify-between items-center">
                      <p className="text-base text-neutral-600">Total dû</p>
                      <p className="text-2xl font-medium text-neutral-900">
                        {lease.balance.totalDue.toLocaleString('fr-CA', { style: 'currency', currency: 'CAD' })}
                      </p>
                    </div>
                    <div className="flex justify-between items-center">
                      <p className="text-base text-neutral-600">Total payé</p>
                      <p className="text-2xl font-medium text-green-600">
                        {lease.balance.totalPaid.toLocaleString('fr-CA', { style: 'currency', currency: 'CAD' })}
                      </p>
                    </div>
                    <div className="pt-8 border-t border-neutral-200">
                      <div className="flex justify-between items-center">
                        <p className="text-lg font-medium text-neutral-900">Solde restant</p>
                        <p className={`text-5xl font-medium ${
                          lease.balance.balance > 0 ? 'text-red-600' : 'text-green-600'
                        }`}>
                          {lease.balance.balance.toLocaleString('fr-CA', { style: 'currency', currency: 'CAD' })}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Informations du bail */}
            <div>
              <h2 className="text-2xl font-medium text-neutral-900 mb-12">Informations du bail</h2>
              <div className="grid md:grid-cols-2 gap-12">
                <div className="space-y-8">
                  <div>
                    <p className="text-sm text-neutral-500 mb-3 uppercase tracking-wider">Date de début</p>
                    <p className="font-medium text-neutral-900 text-lg">
                      {format(new Date(lease.startDate), "d MMMM yyyy", { locale: fr })}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-neutral-500 mb-3 uppercase tracking-wider">Date de fin</p>
                    <p className="font-medium text-neutral-900 text-lg">
                      {format(new Date(lease.endDate), "d MMMM yyyy", { locale: fr })}
                    </p>
                  </div>
                  {lease.finalizedAt && (
                    <div>
                      <p className="text-sm text-neutral-500 mb-3 uppercase tracking-wider">Bail finalisé le</p>
                      <p className="font-medium text-neutral-900 text-lg">
                        {format(new Date(lease.finalizedAt), "d MMMM yyyy à HH:mm", { locale: fr })}
                      </p>
                    </div>
                  )}
                </div>
                <div className="space-y-8">
                  <div>
                    <p className="text-sm text-neutral-500 mb-3 uppercase tracking-wider">Loyer mensuel</p>
                    <p className="text-4xl font-medium text-neutral-900">
                      {lease.monthlyRent.toLocaleString('fr-CA', { style: 'currency', currency: 'CAD' })}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-neutral-500 mb-3 uppercase tracking-wider">Dépôt de garantie</p>
                    <p className="text-3xl font-medium text-neutral-900">
                      {lease.deposit.toLocaleString('fr-CA', { style: 'currency', currency: 'CAD' })}
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-12 pt-12 border-t border-neutral-200">
                <Button
                  asChild
                  variant="outline"
                  className="w-full h-12 text-base rounded-xl border-neutral-300 text-neutral-700 hover:bg-neutral-50"
                >
                  <Link href={`/landlord/leases/${lease.id}`}>
                    Voir le contrat complet
                  </Link>
                </Button>
              </div>
            </div>

            {/* Services inclus */}
            <div>
              <h2 className="text-2xl font-medium text-neutral-900 mb-12">Services inclus</h2>
              <div className="grid md:grid-cols-2 gap-8">
                {lease.application.listing.wifiIncluded && (
                  <div className="flex items-center gap-5 py-5 border-b border-neutral-100">
                    <Wifi className="h-6 w-6 text-neutral-400" />
                    <div>
                      <p className="font-medium text-neutral-900 text-base">Wi-Fi</p>
                      <p className="text-sm text-neutral-500 mt-1.5">Inclus dans le loyer</p>
                    </div>
                  </div>
                )}
                {lease.application.listing.heatingIncluded && (
                  <div className="flex items-center gap-5 py-5 border-b border-neutral-100">
                    <Flame className="h-6 w-6 text-neutral-400" />
                    <div>
                      <p className="font-medium text-neutral-900 text-base">Chauffage</p>
                      <p className="text-sm text-neutral-500 mt-1.5">Inclus dans le loyer</p>
                    </div>
                  </div>
                )}
                {lease.application.listing.hotWaterIncluded && (
                  <div className="flex items-center gap-5 py-5 border-b border-neutral-100">
                    <Droplet className="h-6 w-6 text-neutral-400" />
                    <div>
                      <p className="font-medium text-neutral-900 text-base">Eau chaude</p>
                      <p className="text-sm text-neutral-500 mt-1.5">Inclus dans le loyer</p>
                    </div>
                  </div>
                )}
                {lease.application.listing.electricityIncluded && (
                  <div className="flex items-center gap-5 py-5 border-b border-neutral-100">
                    <Zap className="h-6 w-6 text-neutral-400" />
                    <div>
                      <p className="font-medium text-neutral-900 text-base">Électricité</p>
                      <p className="text-sm text-neutral-500 mt-1.5">Inclus dans le loyer</p>
                    </div>
                  </div>
                )}
                {!lease.application.listing.wifiIncluded && 
                 !lease.application.listing.heatingIncluded && 
                 !lease.application.listing.hotWaterIncluded && 
                 !lease.application.listing.electricityIncluded && (
                  <div className="col-span-2 text-center py-16 text-neutral-400 text-base">
                    Aucun service inclus dans le loyer
                  </div>
                )}
              </div>
            </div>

            {/* Paiements */}
            <div>
              <h2 className="text-2xl font-medium text-neutral-900 mb-12">Historique des paiements</h2>
              {lease.payments.length === 0 ? (
                <div className="text-center py-24 text-neutral-400">
                  <p className="text-base">Aucun paiement enregistré</p>
                </div>
              ) : (
                <div className="space-y-0">
                  {lease.payments.map((payment, index) => (
                    <div
                      key={payment.id}
                      className={`flex justify-between items-center py-8 ${
                        index !== lease.payments.length - 1 ? 'border-b border-neutral-100' : ''
                      }`}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-5 mb-3">
                          <span className="font-medium text-neutral-900 text-base">
                            {payment.type === 'rent' ? 'Loyer' : payment.type === 'deposit' ? 'Dépôt' : 'Frais'}
                          </span>
                          {payment.dueDate && (
                            <span className="text-sm text-neutral-500">
                              Échéance : {format(new Date(payment.dueDate), "d MMM yyyy", { locale: fr })}
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-neutral-500">
                          {payment.paidAt ? (
                            <span>Payé le {format(new Date(payment.paidAt), "d MMMM yyyy à HH:mm", { locale: fr })}</span>
                          ) : (
                            <span>Créé le {format(new Date(payment.createdAt), "d MMMM yyyy", { locale: fr })}</span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <span className="text-lg font-medium text-neutral-900">
                          {payment.amount.toLocaleString('fr-CA', { style: 'currency', currency: 'CAD' })}
                        </span>
                        <span className={`text-sm px-4 py-2 rounded-lg ${
                          payment.status === 'paid'
                            ? 'bg-green-50 text-green-700'
                            : payment.status === 'pending'
                            ? 'bg-amber-50 text-amber-700'
                            : 'bg-red-50 text-red-700'
                        }`}>
                          {payment.status === 'paid' ? 'Payé' : payment.status === 'pending' ? 'En attente' : 'Échoué'}
                        </span>
                        {payment.status === 'paid' && (
                          <Button
                            variant="ghost"
                            size="default"
                            className="text-neutral-600 hover:text-neutral-900 h-11 text-base rounded-lg"
                            onClick={() => window.open(`/api/payments/${payment.id}/receipt`, '_blank')}
                          >
                            Reçu
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

