"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { CalendarCheck, MapPin, Clock, MessageSquare, CheckCircle, XCircle, Hourglass, User, Mail, Phone } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

interface VisitRequest {
  id: string;
  status: string;
  message: string | null;
  preferredDate: string | null;
  preferredTime: string | null;
  createdAt: string;
  listing: {
    id: string;
    title: string;
    address: string;
    city: string;
    price: number;
    images: string[];
  };
  tenant: {
    phone: string | null;
    user: {
      id: string;
      name: string | null;
      email: string;
    };
  };
}

export default function LandlordVisits() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [visitRequests, setVisitRequests] = useState<VisitRequest[]>([]);
  const [isLoadingRequests, setIsLoadingRequests] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const [proposingVisit, setProposingVisit] = useState<string | null>(null);
  const [proposedDate, setProposedDate] = useState("");
  const [proposedTime, setProposedTime] = useState<"morning" | "afternoon" | "evening" | "flexible">("flexible");
  const [proposedMessage, setProposedMessage] = useState("");

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/auth/signin");
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    if (user && user.role === "LANDLORD") {
      fetchVisitRequests();
    }
  }, [user]);

  const fetchVisitRequests = async () => {
    try {
      setIsLoadingRequests(true);
      // Récupérer les rendez-vous (appointments) au lieu des visit requests
      const response = await fetch("/api/landlord/appointments", {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("Erreur lors du chargement des rendez-vous");
      }

      const data = await response.json();
      // Convertir les appointments en format compatible avec l'interface existante
      const appointments = data.appointments || [];
      const convertedRequests = appointments.map((apt: any) => ({
        id: apt.id,
        status: apt.status.toLowerCase(),
        message: null,
        preferredDate: apt.slot.startAt,
        preferredTime: null,
        createdAt: apt.createdAt,
        listing: apt.listing,
        tenant: {
          phone: apt.tenant.tenantProfile?.phone || null,
          user: apt.tenant,
        },
        appointmentId: apt.id, // Pour la confirmation/refus
      }));
      setVisitRequests(convertedRequests);
    } catch (err) {
      console.error("Erreur:", err);
      setError("Erreur lors du chargement des rendez-vous");
    } finally {
      setIsLoadingRequests(false);
    }
  };

  const updateStatus = async (requestId: string, newStatus: "approved" | "rejected") => {
    try {
      setUpdatingStatus(requestId);
      // Utiliser l'API de confirmation des appointments
      const action = newStatus === "approved" ? "confirm" : "reject";
      const response = await fetch(`/api/appointments/${requestId}/confirm`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Erreur lors de la mise à jour");
      }

      // Rafraîchir la liste
      await fetchVisitRequests();
    } catch (err) {
      console.error("Erreur:", err);
      alert(err instanceof Error ? err.message : "Erreur lors de la mise à jour");
    } finally {
      setUpdatingStatus(null);
    }
  };

  const proposeVisitTime = async (requestId: string) => {
    try {
      setUpdatingStatus(requestId);
      const response = await fetch(`/api/visit-requests/${requestId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          proposedDate: proposedDate || undefined,
          proposedTime: proposedTime,
          proposedMessage: proposedMessage || undefined,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Erreur lors de la proposition");
      }

      // Rafraîchir la liste et fermer le modal
      await fetchVisitRequests();
      setProposingVisit(null);
      setProposedDate("");
      setProposedTime("flexible");
      setProposedMessage("");
    } catch (err) {
      console.error("Erreur:", err);
      alert(err instanceof Error ? err.message : "Erreur lors de la proposition");
    } finally {
      setUpdatingStatus(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "confirmed":
        return (
          <Badge className="bg-green-100 text-green-800">
            <CheckCircle className="h-3 w-3 mr-1" />
            Confirmée
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
      case "requested":
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

  const pendingRequests = visitRequests.filter((r) => r.status === "pending");
  const otherRequests = visitRequests.filter((r) => r.status !== "pending");

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <h1 className="text-3xl font-bold text-gray-900">
                Demandes de visite
              </h1>
              <Link href="/landlord/listings">
                <Button variant="outline">Mes annonces</Button>
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
                    Vous n'avez pas encore reçu de demande de visite pour vos annonces.
                  </p>
                  <Link href="/landlord/listings">
                    <Button>Voir mes annonces</Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-8">
                {/* Demandes en attente */}
                {pendingRequests.length > 0 && (
                  <div>
                    <h2 className="text-xl font-semibold mb-4 text-gray-900">
                      En attente ({pendingRequests.length})
                    </h2>
                    <div className="space-y-6">
                      {pendingRequests.map((request) => (
                        <Card key={request.id} className="border-yellow-200">
                          <CardContent className="p-6">
                            <div className="flex flex-col md:flex-row gap-6">
                              {/* Image */}
                              <div className="w-full md:w-48 h-48 relative rounded-lg overflow-hidden flex-shrink-0">
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

                              {/* Détails */}
                              <div className="flex-1">
                                <div className="flex items-start justify-between mb-4">
                                  <div>
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

                                {/* Informations locataire */}
                                <div className="mb-4 p-4 bg-violet-50 rounded-lg">
                                  <h4 className="font-semibold mb-2 text-gray-900 flex items-center gap-2">
                                    <User className="h-4 w-4" />
                                    Locataire
                                  </h4>
                                  <div className="space-y-1 text-sm text-gray-700">
                                    <div className="flex items-center gap-2">
                                      <strong>Nom:</strong> {request.tenant.user.name || "Non spécifié"}
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <Mail className="h-4 w-4" />
                                      <a href={`mailto:${request.tenant.user.email}`} className="text-violet-600 hover:underline">
                                        {request.tenant.user.email}
                                      </a>
                                    </div>
                                    {request.tenant.phone && (
                                      <div className="flex items-center gap-2">
                                        <Phone className="h-4 w-4" />
                                        <a href={`tel:${request.tenant.phone}`} className="text-violet-600 hover:underline">
                                          {request.tenant.phone}
                                        </a>
                                      </div>
                                    )}
                                  </div>
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
                                  <div className="text-sm text-gray-500">
                                    Demandée le {new Date(request.createdAt).toLocaleDateString("fr-FR")}
                                  </div>
                                  <div className="flex gap-2">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => {
                                        setProposingVisit(request.id);
                                        setProposedDate("");
                                        setProposedTime("flexible");
                                        setProposedMessage("");
                                      }}
                                      disabled={updatingStatus === request.id}
                                      className="border-violet-300 text-violet-700 hover:bg-violet-50"
                                    >
                                      Proposer une heure
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => updateStatus(request.appointmentId || request.id, "rejected")}
                                      disabled={updatingStatus === request.id}
                                      className="border-red-300 text-red-700 hover:bg-red-50"
                                    >
                                      {updatingStatus === request.id ? "..." : "Rejeter"}
                                    </Button>
                                    <Button
                                      size="sm"
                                      onClick={() => updateStatus(request.appointmentId || request.id, "approved")}
                                      disabled={updatingStatus === request.id}
                                      className="bg-green-600 hover:bg-green-700"
                                    >
                                      {updatingStatus === request.id ? "..." : "Confirmer"}
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {/* Autres demandes */}
                {otherRequests.length > 0 && (
                  <div>
                    <h2 className="text-xl font-semibold mb-4 text-gray-900">
                      Autres demandes ({otherRequests.length})
                    </h2>
                    <div className="space-y-6">
                      {otherRequests.map((request) => (
                        <Card key={request.id}>
                          <CardContent className="p-6">
                            <div className="flex flex-col md:flex-row gap-6">
                              {/* Image */}
                              <div className="w-full md:w-48 h-48 relative rounded-lg overflow-hidden flex-shrink-0">
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

                              {/* Détails */}
                              <div className="flex-1">
                                <div className="flex items-start justify-between mb-4">
                                  <div>
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

                                <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                                  <h4 className="font-semibold mb-2 text-gray-900 flex items-center gap-2">
                                    <User className="h-4 w-4" />
                                    Locataire
                                  </h4>
                                  <div className="space-y-1 text-sm text-gray-700">
                                    <div className="flex items-center gap-2">
                                      <strong>Nom:</strong> {request.tenant.user.name || "Non spécifié"}
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <Mail className="h-4 w-4" />
                                      <a href={`mailto:${request.tenant.user.email}`} className="text-violet-600 hover:underline">
                                        {request.tenant.user.email}
                                      </a>
                                    </div>
                                    {request.tenant.phone && (
                                      <div className="flex items-center gap-2">
                                        <Phone className="h-4 w-4" />
                                        <a href={`tel:${request.tenant.phone}`} className="text-violet-600 hover:underline">
                                          {request.tenant.phone}
                                        </a>
                                      </div>
                                    )}
                                  </div>
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

                                <div className="text-sm text-gray-500 pt-4 border-t">
                                  Demandée le {new Date(request.createdAt).toLocaleDateString("fr-FR")}
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Modal pour proposer une heure de visite */}
      {proposingVisit && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4">
          <Card className="max-w-md w-full">
            <CardHeader>
              <CardTitle>Proposer une heure de visite</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date proposée
                </label>
                <input
                  type="date"
                  value={proposedDate}
                  onChange={(e) => setProposedDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Heure proposée
                </label>
                <select
                  value={proposedTime}
                  onChange={(e) => setProposedTime(e.target.value as "morning" | "afternoon" | "evening" | "flexible")}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                >
                  <option value="flexible">Flexible</option>
                  <option value="morning">Matin (9h-12h)</option>
                  <option value="afternoon">Après-midi (13h-17h)</option>
                  <option value="evening">Soir (18h-20h)</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message (optionnel)
                </label>
                <textarea
                  value={proposedMessage}
                  onChange={(e) => setProposedMessage(e.target.value)}
                  placeholder="Ajoutez un message pour le locataire..."
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                />
              </div>
              
              <div className="flex gap-3">
                <Button
                  className="flex-1"
                  onClick={() => proposeVisitTime(proposingVisit)}
                  disabled={updatingStatus === proposingVisit}
                >
                  {updatingStatus === proposingVisit ? "Envoi..." : "Envoyer la proposition"}
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setProposingVisit(null);
                    setProposedDate("");
                    setProposedTime("flexible");
                    setProposedMessage("");
                  }}
                  disabled={updatingStatus === proposingVisit}
                >
                  Annuler
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}

