"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { ArrowLeft, FileText, DollarSign, CheckCircle, AlertCircle } from "lucide-react";

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
  };
  balance: {
    totalDue: number;
    totalPaid: number;
    balance: number;
    monthsDue: number;
  };
}

export default function TenantRentManagementPage() {
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
      const response = await fetch("/api/tenant/rent-management", {
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

  if (!user || user.role !== "TENANT") {
    return null;
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-white">
        <div className="container mx-auto px-8 py-16 max-w-5xl">
          <div className="mb-16">
            <Link href="/tenant/dashboard" className="inline-flex items-center text-neutral-600 hover:text-neutral-900 transition-colors mb-10 text-sm">
              <ArrowLeft className="h-4 w-4 mr-1.5" />
              Retour
            </Link>
            <div>
              <h1 className="text-3xl font-medium text-neutral-900 mb-4 tracking-tight">
                Gestion de loyer
              </h1>
              <p className="text-neutral-500 text-base">
                Gérez vos paiements et consultez vos baux
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

          {leases.length === 0 && !isLoading && (
            <div className="text-center py-28 text-neutral-400">
              <p className="text-base">Aucun bail finalisé</p>
            </div>
          )}

          <div className="space-y-0">
            {leases.map((lease, index) => (
              <div
                key={lease.id}
                className={`py-12 ${index !== leases.length - 1 ? 'border-b border-neutral-100' : ''} cursor-pointer hover:bg-neutral-50/50 transition-colors rounded-xl`}
                onClick={() => router.push(`/tenant/rent-management/${lease.id}`)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-4">
                      <h3 className="text-2xl font-medium text-neutral-900">
                        {lease.application.listing.title}
                      </h3>
                      <span className="text-sm px-3 py-1.5 rounded-lg bg-green-50 text-green-700">
                        Finalisé
                      </span>
                    </div>
                    <p className="text-base text-neutral-500 mb-8">
                      {lease.application.listing.address && `${lease.application.listing.address}, `}
                      {lease.application.listing.city}
                      {lease.application.listing.area && ` (${lease.application.listing.area})`}
                    </p>
                    <div className="grid md:grid-cols-3 gap-10">
                      <div>
                        <p className="text-sm text-neutral-500 mb-3 uppercase tracking-wider">Solde restant</p>
                        <p className={`text-xl font-medium ${
                          lease.balance.balance > 0 ? 'text-red-600' : 'text-green-600'
                        }`}>
                          {lease.balance.balance.toLocaleString('fr-CA', { style: 'currency', currency: 'CAD' })}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-neutral-500 mb-3 uppercase tracking-wider">Loyer mensuel</p>
                        <p className="text-xl font-medium text-neutral-900">
                          {lease.monthlyRent.toLocaleString('fr-CA', { style: 'currency', currency: 'CAD' })}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-neutral-500 mb-3 uppercase tracking-wider">Total payé</p>
                        <p className="text-xl font-medium text-green-600">
                          {lease.balance.totalPaid.toLocaleString('fr-CA', { style: 'currency', currency: 'CAD' })}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}

