"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { ArrowLeft, Users, CheckCircle, XCircle, Clock } from "lucide-react";

interface Application {
  id: string;
  status: string;
  message: string | null;
  appliedAt: string;
  listing: {
    id: string;
    title: string;
    price: number;
    address: string | null;
  };
  tenant: {
    user: {
      name: string | null;
      email: string;
    };
  };
}

export default function LandlordApplicationsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && (!user || user.role !== "LANDLORD")) {
      router.push("/auth/signin");
    } else if (user && user.role === "LANDLORD") {
      fetchApplications();
    }
  }, [user, authLoading, router]);

  const fetchApplications = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Récupérer les listings du landlord
      const listingsResponse = await fetch("/api/landlord/listings", {
        cache: 'no-store',
      });
      
      if (!listingsResponse.ok) {
        throw new Error("Erreur lors du chargement des annonces");
      }

      const listingsData = await listingsResponse.json();
      const listingIds = listingsData.listings?.map((l: any) => l.id) || [];

      if (listingIds.length === 0) {
        setApplications([]);
        setIsLoading(false);
        return;
      }

      // Récupérer les applications pour ces listings
      const applicationsResponse = await fetch("/api/landlord/applications", {
        cache: 'no-store',
      });

      if (!applicationsResponse.ok) {
        throw new Error("Erreur lors du chargement des candidatures");
      }

      const applicationsData = await applicationsResponse.json();
      setApplications(applicationsData.applications || []);
    } catch (err) {
      setError("Erreur lors du chargement des candidatures");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-500"><CheckCircle className="h-3 w-3 mr-1" />Approuvée</Badge>;
      case "rejected":
        return <Badge className="bg-red-500"><XCircle className="h-3 w-3 mr-1" />Rejetée</Badge>;
      default:
        return <Badge className="bg-yellow-500"><Clock className="h-3 w-3 mr-1" />En attente</Badge>;
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
                <Users className="h-8 w-8 text-violet-600" />
                Candidatures
              </h1>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
                {error}
              </div>
            )}

            {applications.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 mb-4">Aucune candidature pour le moment.</p>
                  <p className="text-sm text-gray-400">
                    Les candidatures des locataires pour vos annonces apparaîtront ici.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {applications.map((application) => (
                  <Card key={application.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-xl font-semibold text-gray-900">
                              {application.listing.title}
                            </h3>
                            {getStatusBadge(application.status)}
                          </div>
                          <p className="text-gray-600 mb-2">
                            <strong>Locataire:</strong> {application.tenant.user.name || application.tenant.user.email}
                          </p>
                          {application.listing.address && (
                            <p className="text-gray-600 mb-2">
                              <strong>Adresse:</strong> {application.listing.address}
                            </p>
                          )}
                          {application.message && (
                            <p className="text-gray-700 mt-3 p-3 bg-gray-50 rounded-lg">
                              {application.message}
                            </p>
                          )}
                          <p className="text-sm text-gray-500 mt-3">
                            Candidature reçue le {new Date(application.appliedAt).toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                        <div className="ml-4">
                          <Link href={`/listings/${application.listing.id}`}>
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

