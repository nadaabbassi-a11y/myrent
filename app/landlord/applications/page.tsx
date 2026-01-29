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
  appointment?: {
    slot?: {
      startAt: string;
      endAt: string;
    } | null;
  } | null;
  steps?: Array<{
    stepKey: string;
    isComplete: boolean;
  }>;
  consents?: Array<{
    type: string;
    acceptedAt: string;
  }>;
  createdAt: string;
}

export default function LandlordApplicationsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);

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

  const handleAccept = async (applicationId: string) => {
    if (!confirm("Êtes-vous sûr de vouloir accepter cette candidature ?")) {
      return;
    }

    setProcessingId(applicationId);
    try {
      const response = await fetch(`/api/applications/${applicationId}/accept`, {
        method: "PATCH",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Erreur lors de l'acceptation");
      }

      fetchApplications();
    } catch (err: any) {
      setError(err.message || "Erreur lors de l'acceptation");
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (applicationId: string) => {
    if (!confirm("Êtes-vous sûr de vouloir rejeter cette candidature ?")) {
      return;
    }

    setProcessingId(applicationId);
    try {
      const response = await fetch(`/api/applications/${applicationId}/reject`, {
        method: "PATCH",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Erreur lors du rejet");
      }

      fetchApplications();
    } catch (err: any) {
      setError(err.message || "Erreur lors du rejet");
    } finally {
      setProcessingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ACCEPTED":
        return <Badge className="bg-green-500"><CheckCircle className="h-3 w-3 mr-1" />Acceptée</Badge>;
      case "REJECTED":
        return <Badge className="bg-red-500"><XCircle className="h-3 w-3 mr-1" />Rejetée</Badge>;
      case "SUBMITTED":
        return <Badge className="bg-blue-500"><Clock className="h-3 w-3 mr-1" />Soumise</Badge>;
      case "DRAFT":
        return <Badge className="bg-gray-500"><Clock className="h-3 w-3 mr-1" />Brouillon</Badge>;
      default:
        return <Badge className="bg-yellow-500"><Clock className="h-3 w-3 mr-1" />{status}</Badge>;
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
                          <p className="text-sm text-gray-600 mt-2">
                            <strong>Email:</strong> {application.tenant.user.email}
                          </p>
                          {application.appointment?.slot && (
                            <p className="text-sm text-gray-600 mt-1">
                              <strong>Date de visite:</strong>{" "}
                              {new Date(application.appointment.slot.startAt).toLocaleDateString('fr-FR')}
                            </p>
                          )}
                          <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                            <p className="text-sm font-semibold text-gray-700 mb-2">
                              Étapes complétées: {(application.steps || []).filter(s => s.isComplete).length} / {(application.steps || []).length}
                            </p>
                            <p className="text-sm text-gray-600">
                              Consentements: {(application.consents || []).length} accepté(s)
                            </p>
                          </div>
                          <p className="text-sm text-gray-500 mt-3">
                            Candidature reçue le {new Date(application.createdAt).toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                        <div className="ml-4 flex flex-col gap-2">
                          <Link href={`/landlord/applications/${application.id}`}>
                            <Button variant="outline" size="sm">
                              Voir la candidature
                            </Button>
                          </Link>
                          <Link href={`/listings/${application.listing.id}`}>
                            <Button variant="outline" size="sm">
                              Voir l'annonce
                            </Button>
                          </Link>
                          {application.status === "SUBMITTED" && (
                            <>
                              <Button
                                size="sm"
                                className="bg-green-600 hover:bg-green-700 text-white"
                                onClick={() => handleAccept(application.id)}
                                disabled={processingId === application.id}
                              >
                                {processingId === application.id ? (
                                  "Traitement..."
                                ) : (
                                  <>
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    Accepter
                                  </>
                                )}
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleReject(application.id)}
                                disabled={processingId === application.id}
                              >
                                {processingId === application.id ? (
                                  "Traitement..."
                                ) : (
                                  <>
                                    <XCircle className="h-4 w-4 mr-2" />
                                    Rejeter
                                  </>
                                )}
                              </Button>
                            </>
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

