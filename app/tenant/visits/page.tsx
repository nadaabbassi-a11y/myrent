"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { CalendarCheck, MapPin, Clock, MessageSquare, CheckCircle, XCircle, Hourglass, Eye, FileText } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

interface VisitRequest {
  id: string;
  status: string;
  message: string | null;
  preferredDate: string | null;
  preferredTime: string | null;
  createdAt: string;
  hasConfirmedAppointment?: boolean;
  appointmentId?: string | null;
  hasApplication?: boolean;
  listing: {
    id: string;
    title: string;
    address: string;
    city: string;
    price: number;
    images: string[];
    landlord: {
      phone: string | null;
      company: string | null;
      user: {
        name: string | null;
        email: string;
      };
    };
  };
}

export default function TenantVisits() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [visitRequests, setVisitRequests] = useState<VisitRequest[]>([]);
  const [isLoadingRequests, setIsLoadingRequests] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/auth/signin");
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    if (user && user.role === "TENANT") {
      fetchVisitRequests();
    }
  }, [user]);

  const fetchVisitRequests = async () => {
    try {
      setIsLoadingRequests(true);
      const response = await fetch("/api/tenant/visit-requests", {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("Erreur lors du chargement des demandes de visite");
      }

      const data = await response.json();
      setVisitRequests(data.visitRequests || []);
    } catch (err) {
      console.error("Erreur:", err);
      setError("Erreur lors du chargement des demandes de visite");
    } finally {
      setIsLoadingRequests(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return (
          <Badge className="bg-green-100 text-green-800">
            <CheckCircle className="h-3 w-3 mr-1" />
            Approuvée
          </Badge>
        );
      case "rejected":
        return (
          <Badge className="bg-red-100 text-red-800">
            <XCircle className="h-3 w-3 mr-1" />
            Rejetée
          </Badge>
        );
      case "completed":
        return (
          <Badge className="bg-blue-100 text-blue-800">
            <CheckCircle className="h-3 w-3 mr-1" />
            Complétée
          </Badge>
        );
      default:
        return (
          <Badge className="bg-yellow-100 text-yellow-800">
            <Hourglass className="h-3 w-3 mr-1" />
            En attente
          </Badge>
        );
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Non spécifiée";
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const formatTime = (time: string | null) => {
    if (!time) return "Flexible";
    const timeMap: { [key: string]: string } = {
      morning: "Matin",
      afternoon: "Après-midi",
      evening: "Soir",
      flexible: "Flexible",
    };
    return timeMap[time] || time;
  };

  if (isLoading || isLoadingRequests) {
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

  if (!user) {
    return null;
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <h1 className="text-3xl font-bold text-gray-900">
                Mes demandes de visite
              </h1>
              <Link href="/listings">
                <Button variant="outline">Voir les annonces</Button>
              </Link>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                {error}
              </div>
            )}

            {visitRequests.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <CalendarCheck className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-xl font-semibold mb-2 text-gray-700">
                    Aucune demande de visite
                  </h3>
                  <p className="text-gray-500 mb-6">
                    Vous n'avez pas encore demandé de visite. Parcourez les annonces et demandez une visite !
                  </p>
                  <Link href="/listings">
                    <Button>Parcourir les annonces</Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                {visitRequests.map((request) => (
                  <Card key={request.id}>
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row gap-6">
                        {/* Image */}
                        <div className="w-full md:w-48 flex-shrink-0">
                          <div className="w-full h-48 relative rounded-lg overflow-hidden mb-3">
                            {request.listing.images && request.listing.images.length > 0 ? (
                              <Image
                                src={request.listing.images[0]}
                                alt={request.listing.title}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                                <CalendarCheck className="h-12 w-12 text-gray-400" />
                              </div>
                            )}
                          </div>
                          <Link href={`/listings/${request.listing.id}`}>
                            <Button variant="outline" size="sm" className="w-full flex items-center justify-center gap-2">
                              <Eye className="h-4 w-4" />
                              Consulter l'offre
                            </Button>
                          </Link>
                        </div>

                        {/* Détails */}
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                              <Link href={`/listings/${request.listing.id}`}>
                                <h3 className="text-xl font-semibold text-gray-900 hover:text-violet-600 transition-colors">
                                  {request.listing.title}
                                </h3>
                              </Link>
                              <div className="flex items-center gap-2 mt-1 text-gray-600">
                                <MapPin className="h-4 w-4" />
                                <span>{request.listing.address}, {request.listing.city}</span>
                              </div>
                            </div>
                            {getStatusBadge(request.status)}
                          </div>

                          <div className="grid md:grid-cols-2 gap-4 mb-4">
                            <div className="flex items-center gap-2 text-gray-600">
                              <Clock className="h-4 w-4" />
                              <span className="text-sm">
                                <strong>Date préférée:</strong> {formatDate(request.preferredDate)}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-600">
                              <CalendarCheck className="h-4 w-4" />
                              <span className="text-sm">
                                <strong>Heure préférée:</strong> {formatTime(request.preferredTime)}
                              </span>
                            </div>
                          </div>

                          {request.message && (
                            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                              <div className="flex items-start gap-2">
                                <MessageSquare className="h-4 w-4 mt-0.5 text-gray-500" />
                                <p className="text-sm text-gray-700">{request.message}</p>
                              </div>
                            </div>
                          )}

                          <div className="flex items-center justify-between pt-4 border-t">
                            <div className="text-sm text-gray-600">
                              <strong>Propriétaire:</strong> {request.listing.landlord.user.name || "Non spécifié"}
                              {request.listing.landlord.phone && (
                                <span className="ml-2">• {request.listing.landlord.phone}</span>
                              )}
                            </div>
                            <div className="text-sm text-gray-500">
                              Demandée le {new Date(request.createdAt).toLocaleDateString("fr-FR")}
                            </div>
                          </div>
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

