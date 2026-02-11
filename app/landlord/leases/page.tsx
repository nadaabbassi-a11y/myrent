"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { ArrowLeft, FileText, Calendar, DollarSign, User, MapPin, Home, CheckCircle, Clock, AlertCircle, CreditCard } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'FINALIZED':
        return (
          <Badge className="bg-green-500 text-white border-0 rounded-full px-3 py-1">
            <CheckCircle className="h-3 w-3 mr-1.5" />
            <span className="text-xs font-medium">Finalisé</span>
          </Badge>
        );
      case 'TENANT_SIGNED':
        return (
          <Badge className="bg-yellow-500 text-white border-0 rounded-full px-3 py-1">
            <Clock className="h-3 w-3 mr-1.5" />
            <span className="text-xs font-medium">En attente de votre signature</span>
          </Badge>
        );
      case 'OWNER_SIGNED':
        return (
          <Badge className="bg-blue-500 text-white border-0 rounded-full px-3 py-1">
            <Clock className="h-3 w-3 mr-1.5" />
            <span className="text-xs font-medium">En attente de signature du locataire</span>
          </Badge>
        );
      default:
        return (
          <Badge className="bg-neutral-500 text-white border-0 rounded-full px-3 py-1">
            <FileText className="h-3 w-3 mr-1.5" />
            <span className="text-xs font-medium">Brouillon</span>
          </Badge>
        );
    }
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-neutral-50 py-8">
        <div className="container mx-auto px-4 max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Link
              href="/landlord/dashboard"
              className="inline-flex items-center gap-2 text-neutral-600 hover:text-neutral-900 mb-8 transition-colors group"
            >
              <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
              <span className="text-sm font-light">Retour au tableau de bord</span>
            </Link>

            <div className="mb-10">
              <div className="flex items-center gap-4 mb-2">
                <div className="p-3 rounded-xl bg-neutral-900">
                  <FileText className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-light text-neutral-900 mb-1">Contrats</h1>
                  <p className="text-neutral-500 text-sm font-light">
                    Gérez tous vos contrats de location
                  </p>
                </div>
              </div>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 flex items-center gap-3"
              >
                <AlertCircle className="h-5 w-5 flex-shrink-0" />
                <span className="text-sm font-light">{error}</span>
              </motion.div>
            )}

            {leases.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <Card className="border-neutral-200 shadow-sm rounded-2xl">
                  <CardContent className="p-16 text-center">
                    <FileText className="h-20 w-20 text-neutral-300 mx-auto mb-6" />
                    <h3 className="text-xl font-light text-neutral-900 mb-2">Aucun contrat</h3>
                    <p className="text-neutral-500 text-sm font-light mb-4">
                      Les contrats seront affichés ici une fois qu'une candidature aura été approuvée.
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ) : (
              <div className="space-y-4">
                <AnimatePresence>
                  {leases.map((lease, index) => {
                    const isFinalized = lease.status === 'FINALIZED';
                    const pendingPayments = lease.payments?.filter(p => p.status === 'pending').length || 0;
                    
                    return (
                      <motion.div
                        key={lease.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <Card 
                          className={`border-neutral-200 shadow-sm hover:shadow-lg transition-all duration-300 rounded-2xl overflow-hidden ${
                            isFinalized 
                              ? "border-green-200 bg-gradient-to-br from-green-50/30 to-white" 
                              : "hover:border-neutral-300"
                          }`}
                        >
                          <CardContent className="p-6">
                            <div className="flex items-start gap-6">
                              {/* Avatar */}
                              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0 text-2xl font-light ${
                                isFinalized 
                                  ? "bg-green-100 text-green-700" 
                                  : "bg-neutral-100 text-neutral-600"
                              }`}>
                                {lease.application.listing.title.charAt(0).toUpperCase()}
                              </div>

                              {/* Content */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-4 mb-4">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-3 flex-wrap">
                                      <h3 className={`text-xl font-light ${
                                        isFinalized ? "text-green-900" : "text-neutral-900"
                                      }`}>
                                        {lease.application.listing.title}
                                      </h3>
                                      {getStatusBadge(lease.status)}
                                      {lease.stripeSubscriptionId && (
                                        <Badge className="bg-blue-500 text-white border-0 rounded-full px-3 py-1">
                                          <CreditCard className="h-3 w-3 mr-1.5" />
                                          <span className="text-xs font-medium">Paiement configuré</span>
                                        </Badge>
                                      )}
                                    </div>

                                    {/* Tenant Info */}
                                    <div className="flex items-center gap-4 mb-3 flex-wrap">
                                      <div className="flex items-center gap-2 text-sm text-neutral-600">
                                        <User className="h-4 w-4" />
                                        <span className="font-light">
                                          {lease.application.tenant.user.name || lease.application.tenant.user.email}
                                        </span>
                                      </div>
                                    </div>

                                    {/* Address */}
                                    <div className="flex items-start gap-2 text-sm text-neutral-600 mb-4">
                                      <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                                      <span className="font-light line-clamp-2">
                                        {lease.application.listing.address || 
                                         `${lease.application.listing.area ? lease.application.listing.area + ', ' : ''}${lease.application.listing.city || 'N/A'}`}
                                      </span>
                                    </div>

                                    {/* Dates and Financial Info */}
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                                      <div className="p-3 bg-neutral-50 rounded-xl">
                                        <div className="flex items-center gap-2 mb-1">
                                          <Calendar className="h-4 w-4 text-neutral-600" />
                                          <span className="text-xs text-neutral-500 font-medium">Début</span>
                                        </div>
                                        <p className="text-sm font-light text-neutral-900">
                                          {format(new Date(lease.startDate), "d MMM yyyy", { locale: fr })}
                                        </p>
                                      </div>
                                      <div className="p-3 bg-neutral-50 rounded-xl">
                                        <div className="flex items-center gap-2 mb-1">
                                          <Calendar className="h-4 w-4 text-neutral-600" />
                                          <span className="text-xs text-neutral-500 font-medium">Fin</span>
                                        </div>
                                        <p className="text-sm font-light text-neutral-900">
                                          {format(new Date(lease.endDate), "d MMM yyyy", { locale: fr })}
                                        </p>
                                      </div>
                                      <div className="p-3 bg-neutral-50 rounded-xl">
                                        <div className="flex items-center gap-2 mb-1">
                                          <DollarSign className="h-4 w-4 text-neutral-600" />
                                          <span className="text-xs text-neutral-500 font-medium">Loyer</span>
                                        </div>
                                        <p className="text-sm font-light text-neutral-900">
                                          {lease.monthlyRent.toLocaleString('fr-CA')} $/mois
                                        </p>
                                      </div>
                                      <div className="p-3 bg-neutral-50 rounded-xl">
                                        <div className="flex items-center gap-2 mb-1">
                                          <DollarSign className="h-4 w-4 text-neutral-600" />
                                          <span className="text-xs text-neutral-500 font-medium">Dépôt</span>
                                        </div>
                                        <p className="text-sm font-light text-neutral-900">
                                          {lease.deposit.toLocaleString('fr-CA')} $
                                        </p>
                                      </div>
                                    </div>

                                    {/* Payments */}
                                    {lease.payments && lease.payments.length > 0 && (
                                      <div className="mt-4 p-4 bg-neutral-50 rounded-xl">
                                        <div className="flex items-center justify-between mb-3">
                                          <p className="text-xs font-medium text-neutral-700">
                                            Derniers paiements
                                          </p>
                                          {pendingPayments > 0 && (
                                            <Badge className="bg-yellow-500 text-white border-0 rounded-full px-2 py-0.5">
                                              <span className="text-xs font-medium">{pendingPayments} en attente</span>
                                            </Badge>
                                          )}
                                        </div>
                                        <div className="space-y-2">
                                          {lease.payments.slice(0, 3).map((payment) => (
                                            <div key={payment.id} className="flex items-center justify-between text-sm">
                                              <div className="flex items-center gap-2">
                                                <span className="font-light text-neutral-700">
                                                  {payment.type === 'rent' ? 'Loyer' : payment.type}:
                                                </span>
                                                <span className="font-medium text-neutral-900">
                                                  {payment.amount.toLocaleString('fr-CA')} $
                                                </span>
                                              </div>
                                              <Badge 
                                                className={`border-0 rounded-full px-2 py-0.5 ${
                                                  payment.status === 'paid' 
                                                    ? 'bg-green-500 text-white' 
                                                    : payment.status === 'failed' 
                                                    ? 'bg-red-500 text-white'
                                                    : 'bg-yellow-500 text-white'
                                                }`}
                                              >
                                                <span className="text-xs font-medium">
                                                  {payment.status === 'paid' ? 'Payé' :
                                                   payment.status === 'failed' ? 'Échoué' :
                                                   'En attente'}
                                                </span>
                                              </Badge>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    )}
                                  </div>

                                  {/* Actions */}
                                  <div className="flex flex-col gap-2 flex-shrink-0">
                                    <Link href={`/landlord/leases/${lease.id}`}>
                                      <Button 
                                        className={`h-11 px-6 rounded-xl font-light transition-all ${
                                          isFinalized 
                                            ? "bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl" 
                                            : "bg-neutral-900 hover:bg-neutral-800 text-white"
                                        }`}
                                      >
                                        <FileText className="h-4 w-4 mr-2" />
                                        Contrat
                                      </Button>
                                    </Link>
                                    <Link href={`/listings/${lease.application.listing.id}`}>
                                      <Button 
                                        variant="outline" 
                                        className="h-11 px-6 rounded-xl font-light border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50"
                                      >
                                        <Home className="h-4 w-4 mr-2" />
                                        Annonce
                                      </Button>
                                    </Link>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            )}
          </motion.div>
        </div>
      </main>
    </>
  );
}

