"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { CalendarCheck, MapPin, Clock, MessageSquare, CheckCircle, XCircle, Hourglass, User, Mail, Phone, Home, AlertCircle } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface VisitRequest {
  id: string;
  status: string;
  message: string | null;
  preferredDate: string | null;
  preferredTime: string | null;
  createdAt: string;
  appointmentId?: string; // ID de l'appointment pour la confirmation
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
      const convertedRequests = appointments.map((apt: any) => {
        // Parser les images si c'est une string JSON
        let images: string[] = [];
        if (apt.listing?.images) {
          try {
            if (typeof apt.listing.images === 'string') {
              images = JSON.parse(apt.listing.images);
            } else if (Array.isArray(apt.listing.images)) {
              images = apt.listing.images;
            }
          } catch {
            images = [];
          }
        }

        // Extraire l'heure du créneau horaire
        let timeString: string | null = null;
        if (apt.slot?.startAt) {
          try {
            const slotDate = new Date(apt.slot.startAt);
            timeString = slotDate.toISOString(); // Garder l'ISO string pour formatTime
          } catch {
            timeString = null;
          }
        }

        return {
          id: apt.id,
          status: apt.status.toLowerCase(),
          message: apt.message || null,
          preferredDate: apt.slot?.startAt || null,
          preferredTime: timeString, // Utiliser l'heure du slot
          createdAt: apt.createdAt,
          listing: {
            ...apt.listing,
            images: images,
          },
          tenant: {
            phone: null, // Le phone n'est pas disponible dans l'API actuelle
            user: apt.tenant || {},
          },
          appointmentId: apt.id, // Pour la confirmation/refus
        };
      });
      setVisitRequests(convertedRequests);
      setError(null);
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
          <Badge className="bg-green-500 text-white border-0 rounded-full px-3 py-1">
            <CheckCircle className="h-3 w-3 mr-1.5" />
            <span className="text-xs font-medium">Confirmée</span>
          </Badge>
        );
      case "rejected":
        return (
          <Badge className="bg-red-500 text-white border-0 rounded-full px-3 py-1">
            <XCircle className="h-3 w-3 mr-1.5" />
            <span className="text-xs font-medium">Rejetée</span>
          </Badge>
        );
      case "completed":
        return (
          <Badge className="bg-blue-500 text-white border-0 rounded-full px-3 py-1">
            <CheckCircle className="h-3 w-3 mr-1.5" />
            <span className="text-xs font-medium">Complétée</span>
          </Badge>
        );
      case "requested":
      case "pending":
      default:
        return (
          <Badge className="bg-yellow-500 text-white border-0 rounded-full px-3 py-1">
            <Hourglass className="h-3 w-3 mr-1.5" />
            <span className="text-xs font-medium">En attente</span>
          </Badge>
        );
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Non spécifiée";
    try {
      return format(new Date(dateString), "d MMMM yyyy", { locale: fr });
    } catch {
      return "Date invalide";
    }
  };

  const formatTime = (time: string | null) => {
    if (!time) return "Flexible";
    
    // Si c'est une date ISO string, formater l'heure
    try {
      const date = new Date(time);
      if (!isNaN(date.getTime())) {
        return date.toLocaleTimeString("fr-FR", {
          hour: "2-digit",
          minute: "2-digit",
        });
      }
    } catch {
      // Si ce n'est pas une date, vérifier si c'est un mot-clé
    }
    
    // Vérifier les mots-clés (pour compatibilité avec l'ancien système)
    const timeMap: { [key: string]: string } = {
      morning: "Matin",
      afternoon: "Après-midi",
      evening: "Soir",
      flexible: "Flexible",
    };
    return timeMap[time] || time;
  };

  // Calculer les requêtes filtrées avec useMemo
  // Les demandes en attente sont celles avec status "requested" ou "pending" (en minuscules après conversion)
  const pendingRequests = useMemo(() => 
    visitRequests.filter((r) => {
      const status = r.status.toLowerCase();
      return status === "pending" || status === "requested";
    }),
    [visitRequests]
  );
  const otherRequests = useMemo(() => 
    visitRequests.filter((r) => {
      const status = r.status.toLowerCase();
      return status !== "pending" && status !== "requested";
    }),
    [visitRequests]
  );

  if (isLoading || isLoadingRequests) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-neutral-50 py-12">
          <div className="container mx-auto px-4">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-neutral-900 mb-4"></div>
              <p className="text-neutral-600 font-light">Chargement...</p>
            </div>
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
      <main className="min-h-screen bg-neutral-50 py-8">
        <div className="container mx-auto px-4 max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="flex items-center justify-between mb-10">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-neutral-900">
                  <CalendarCheck className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-light text-neutral-900 mb-1">
                    Demandes de visite
                  </h1>
                  <p className="text-neutral-500 text-sm font-light">
                    Gérez les rendez-vous pour vos annonces
                  </p>
                </div>
              </div>
              <Link href="/landlord/listings">
                <Button className="h-11 px-6 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl font-light shadow-lg hover:shadow-xl transition-all">
                  <Home className="h-4 w-4 mr-2" />
                  Mes annonces
                </Button>
              </Link>
            </div>

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 flex items-center gap-3"
                >
                  <AlertCircle className="h-5 w-5 flex-shrink-0" />
                  <span className="text-sm font-light">{error}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setError(null);
                      fetchVisitRequests();
                    }}
                    className="ml-auto h-8 px-3 text-red-700 hover:text-red-900 hover:bg-red-100"
                  >
                    Réessayer
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>

            {visitRequests.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <Card className="border-neutral-200 shadow-sm rounded-2xl">
                  <CardContent className="p-16 text-center">
                    <CalendarCheck className="h-20 w-20 text-neutral-300 mx-auto mb-6" />
                    <h3 className="text-xl font-light text-neutral-900 mb-2">
                      Aucune demande de visite
                    </h3>
                    <p className="text-neutral-500 text-sm font-light mb-6">
                      Vous n'avez pas encore reçu de demande de visite pour vos annonces.
                    </p>
                    <Link href="/landlord/listings">
                      <Button className="h-11 px-6 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl font-light shadow-lg hover:shadow-xl transition-all">
                        <Home className="h-4 w-4 mr-2" />
                        Voir mes annonces
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </motion.div>
            ) : (
              <div className="space-y-8">
                {/* Demandes en attente */}
                {pendingRequests.length > 0 && (
                  <div>
                    <h2 className="text-xl font-light mb-6 text-neutral-900 flex items-center gap-2">
                      <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-medium">
                        {pendingRequests.length}
                      </span>
                      En attente
                    </h2>
                    <div className="space-y-4">
                      <AnimatePresence>
                        {pendingRequests.map((request, index) => (
                          <motion.div
                            key={request.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                          >
                            <Card className="border-2 border-yellow-200 bg-gradient-to-br from-yellow-50/30 to-white shadow-sm hover:shadow-lg transition-all duration-300 rounded-2xl overflow-hidden">
                              <CardContent className="p-6">
                                <div className="flex flex-col md:flex-row gap-6">
                                  {/* Image */}
                                  <div className="w-full md:w-56 h-56 relative rounded-2xl overflow-hidden flex-shrink-0">
                                    {request.listing.images && Array.isArray(request.listing.images) && request.listing.images.length > 0 ? (
                                      <Image
                                        src={request.listing.images[0]}
                                        alt={request.listing.title || "Annonce"}
                                        fill
                                        className="object-cover"
                                      />
                                    ) : (
                                      <div className="w-full h-full bg-neutral-100 flex items-center justify-center">
                                        <CalendarCheck className="h-12 w-12 text-neutral-300" />
                                      </div>
                                    )}
                                  </div>

                                  {/* Détails */}
                                  <div className="flex-1">
                                    <div className="flex items-start justify-between mb-4">
                                      <div className="flex-1">
                                        <Link href={`/listings/${request.listing.id}`}>
                                          <h3 className="text-xl font-light text-neutral-900 hover:text-neutral-600 transition-colors mb-2">
                                            {request.listing.title || "Annonce"}
                                          </h3>
                                        </Link>
                                        <div className="flex items-center gap-2 text-neutral-600 text-sm font-light">
                                          <MapPin className="h-4 w-4" />
                                          <span>{request.listing.address || ""}{request.listing.city ? `, ${request.listing.city}` : ""}</span>
                                        </div>
                                      </div>
                                      {getStatusBadge(request.status)}
                                    </div>

                                    {/* Informations locataire */}
                                    <div className="mb-4 p-4 bg-neutral-50 rounded-xl border border-neutral-200">
                                      <h4 className="font-medium mb-3 text-neutral-900 flex items-center gap-2 text-sm">
                                        <User className="h-4 w-4" />
                                        Locataire
                                      </h4>
                                      <div className="space-y-2 text-sm">
                                        <div className="flex items-center gap-2 text-neutral-700 font-light">
                                          <span className="font-medium">Nom:</span> {request.tenant.user?.name || "Non spécifié"}
                                        </div>
                                        <div className="flex items-center gap-2 text-neutral-700">
                                          <Mail className="h-4 w-4 text-neutral-500" />
                                          <a href={`mailto:${request.tenant.user?.email || ""}`} className="text-neutral-900 hover:text-neutral-600 transition-colors font-light">
                                            {request.tenant.user?.email || "N/A"}
                                          </a>
                                        </div>
                                        {request.tenant.phone && (
                                          <div className="flex items-center gap-2 text-neutral-700">
                                            <Phone className="h-4 w-4 text-neutral-500" />
                                            <a href={`tel:${request.tenant.phone}`} className="text-neutral-900 hover:text-neutral-600 transition-colors font-light">
                                              {request.tenant.phone}
                                            </a>
                                          </div>
                                        )}
                                      </div>
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-4 mb-4">
                                      <div className="flex items-center gap-2 text-neutral-600 p-3 bg-neutral-50 rounded-xl">
                                        <Clock className="h-4 w-4 text-neutral-500" />
                                        <div>
                                          <p className="text-xs text-neutral-500 font-medium mb-0.5">Date préférée</p>
                                          <p className="text-sm font-light text-neutral-900">{formatDate(request.preferredDate)}</p>
                                        </div>
                                      </div>
                                      <div className="flex items-center gap-2 text-neutral-600 p-3 bg-neutral-50 rounded-xl">
                                        <CalendarCheck className="h-4 w-4 text-neutral-500" />
                                        <div>
                                          <p className="text-xs text-neutral-500 font-medium mb-0.5">Heure préférée</p>
                                          <p className="text-sm font-light text-neutral-900">{formatTime(request.preferredTime)}</p>
                                        </div>
                                      </div>
                                    </div>

                                    {request.message && (
                                      <div className="mb-4 p-3 bg-neutral-50 rounded-xl border border-neutral-200">
                                        <div className="flex items-start gap-2">
                                          <MessageSquare className="h-4 w-4 mt-0.5 text-neutral-500 flex-shrink-0" />
                                          <p className="text-sm text-neutral-700 font-light">{request.message}</p>
                                        </div>
                                      </div>
                                    )}

                                    <div className="flex items-center justify-between pt-4 border-t border-neutral-200">
                                      <div className="text-xs text-neutral-400 font-light">
                                        Demandée le {format(new Date(request.createdAt), "d MMM yyyy", { locale: fr })}
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
                                          className="h-9 px-4 rounded-xl border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50 font-light text-xs"
                                        >
                                          Proposer
                                        </Button>
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          onClick={() => updateStatus(request.appointmentId || request.id, "rejected")}
                                          disabled={updatingStatus === request.id}
                                          className="h-9 px-4 rounded-xl border-red-200 text-red-700 hover:bg-red-50 font-light text-xs"
                                        >
                                          {updatingStatus === request.id ? "..." : "Rejeter"}
                                        </Button>
                                        <Button
                                          size="sm"
                                          onClick={() => updateStatus(request.appointmentId || request.id, "approved")}
                                          disabled={updatingStatus === request.id}
                                          className="h-9 px-4 bg-green-600 hover:bg-green-700 text-white rounded-xl font-light text-xs shadow-lg hover:shadow-xl transition-all"
                                        >
                                          {updatingStatus === request.id ? "..." : "Confirmer"}
                                        </Button>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                  </div>
                )}

                {/* Autres demandes */}
                {otherRequests.length > 0 && (
                  <div>
                    <h2 className="text-xl font-light mb-6 text-neutral-900 flex items-center gap-2">
                      <span className="px-3 py-1 bg-neutral-100 text-neutral-700 rounded-full text-sm font-medium">
                        {otherRequests.length}
                      </span>
                      Autres demandes
                    </h2>
                    <div className="space-y-4">
                      <AnimatePresence>
                        {otherRequests.map((request, index) => (
                          <motion.div
                            key={request.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                          >
                            <Card className="border-neutral-200 shadow-sm hover:shadow-lg transition-all duration-300 rounded-2xl overflow-hidden">
                              <CardContent className="p-6">
                                <div className="flex flex-col md:flex-row gap-6">
                                  {/* Image */}
                                  <div className="w-full md:w-56 h-56 relative rounded-2xl overflow-hidden flex-shrink-0">
                                    {request.listing.images && Array.isArray(request.listing.images) && request.listing.images.length > 0 ? (
                                      <Image
                                        src={request.listing.images[0]}
                                        alt={request.listing.title || "Annonce"}
                                        fill
                                        className="object-cover"
                                      />
                                    ) : (
                                      <div className="w-full h-full bg-neutral-100 flex items-center justify-center">
                                        <CalendarCheck className="h-12 w-12 text-neutral-300" />
                                      </div>
                                    )}
                                  </div>

                                  {/* Détails */}
                                  <div className="flex-1">
                                    <div className="flex items-start justify-between mb-4">
                                      <div className="flex-1">
                                        {request.listing.id ? (
                                          <Link href={`/listings/${request.listing.id}`}>
                                            <h3 className="text-xl font-light text-neutral-900 hover:text-neutral-600 transition-colors mb-2">
                                              {request.listing.title || "Annonce"}
                                            </h3>
                                          </Link>
                                        ) : (
                                          <h3 className="text-xl font-light text-neutral-900 mb-2">
                                            {request.listing.title || "Annonce"}
                                          </h3>
                                        )}
                                        <div className="flex items-center gap-2 text-neutral-600 text-sm font-light">
                                          <MapPin className="h-4 w-4" />
                                          <span>{request.listing.address || ""}{request.listing.city ? `, ${request.listing.city}` : ""}</span>
                                        </div>
                                      </div>
                                      {getStatusBadge(request.status)}
                                    </div>

                                    <div className="mb-4 p-4 bg-neutral-50 rounded-xl border border-neutral-200">
                                      <h4 className="font-medium mb-3 text-neutral-900 flex items-center gap-2 text-sm">
                                        <User className="h-4 w-4" />
                                        Locataire
                                      </h4>
                                      <div className="space-y-2 text-sm">
                                        <div className="flex items-center gap-2 text-neutral-700 font-light">
                                          <span className="font-medium">Nom:</span> {request.tenant.user?.name || "Non spécifié"}
                                        </div>
                                        <div className="flex items-center gap-2 text-neutral-700">
                                          <Mail className="h-4 w-4 text-neutral-500" />
                                          <a href={`mailto:${request.tenant.user?.email || ""}`} className="text-neutral-900 hover:text-neutral-600 transition-colors font-light">
                                            {request.tenant.user?.email || "N/A"}
                                          </a>
                                        </div>
                                        {request.tenant.phone && (
                                          <div className="flex items-center gap-2 text-neutral-700">
                                            <Phone className="h-4 w-4 text-neutral-500" />
                                            <a href={`tel:${request.tenant.phone}`} className="text-neutral-900 hover:text-neutral-600 transition-colors font-light">
                                              {request.tenant.phone}
                                            </a>
                                          </div>
                                        )}
                                      </div>
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-4 mb-4">
                                      <div className="flex items-center gap-2 text-neutral-600 p-3 bg-neutral-50 rounded-xl">
                                        <Clock className="h-4 w-4 text-neutral-500" />
                                        <div>
                                          <p className="text-xs text-neutral-500 font-medium mb-0.5">Date préférée</p>
                                          <p className="text-sm font-light text-neutral-900">{formatDate(request.preferredDate)}</p>
                                        </div>
                                      </div>
                                      <div className="flex items-center gap-2 text-neutral-600 p-3 bg-neutral-50 rounded-xl">
                                        <CalendarCheck className="h-4 w-4 text-neutral-500" />
                                        <div>
                                          <p className="text-xs text-neutral-500 font-medium mb-0.5">Heure préférée</p>
                                          <p className="text-sm font-light text-neutral-900">{formatTime(request.preferredTime)}</p>
                                        </div>
                                      </div>
                                    </div>

                                    {request.message && (
                                      <div className="mb-4 p-3 bg-neutral-50 rounded-xl border border-neutral-200">
                                        <div className="flex items-start gap-2">
                                          <MessageSquare className="h-4 w-4 mt-0.5 text-neutral-500 flex-shrink-0" />
                                          <p className="text-sm text-neutral-700 font-light">{request.message}</p>
                                        </div>
                                      </div>
                                    )}

                                    {/* Boutons d'action pour les demandes qui peuvent encore être traitées */}
                                    {(() => {
                                      const status = request.status.toLowerCase();
                                      const canStillRespond = status === "requested" || status === "pending" || status === "proposed";
                                      
                                      if (canStillRespond) {
                                        return (
                                          <div className="flex items-center justify-between pt-4 border-t border-neutral-200">
                                            <div className="text-xs text-neutral-400 font-light">
                                              Demandée le {format(new Date(request.createdAt), "d MMM yyyy", { locale: fr })}
                                            </div>
                                            <div className="flex gap-2">
                                              {status === "proposed" && (
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
                                                  className="h-9 px-4 rounded-xl border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50 font-light text-xs"
                                                >
                                                  Modifier
                                                </Button>
                                              )}
                                              <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => updateStatus(request.appointmentId || request.id, "rejected")}
                                                disabled={updatingStatus === request.id}
                                                className="h-9 px-4 rounded-xl border-red-200 text-red-700 hover:bg-red-50 font-light text-xs"
                                              >
                                                {updatingStatus === request.id ? "..." : "Rejeter"}
                                              </Button>
                                              <Button
                                                size="sm"
                                                onClick={() => updateStatus(request.appointmentId || request.id, "approved")}
                                                disabled={updatingStatus === request.id}
                                                className="h-9 px-4 bg-green-600 hover:bg-green-700 text-white rounded-xl font-light text-xs shadow-lg hover:shadow-xl transition-all"
                                              >
                                                {updatingStatus === request.id ? "..." : "Confirmer"}
                                              </Button>
                                            </div>
                                          </div>
                                        );
                                      }
                                      
                                      return (
                                        <div className="text-xs text-neutral-400 pt-4 border-t border-neutral-200 font-light">
                                          Demandée le {format(new Date(request.createdAt), "d MMM yyyy", { locale: fr })}
                                        </div>
                                      );
                                    })()}
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </div>
      </main>

      {/* Modal pour proposer une heure de visite */}
      <AnimatePresence>
        {proposingVisit && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4"
            onClick={() => {
              setProposingVisit(null);
              setProposedDate("");
              setProposedTime("flexible");
              setProposedMessage("");
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
            >
              <Card className="max-w-md w-full border-neutral-200 shadow-xl rounded-2xl">
                <CardHeader className="border-b border-neutral-200 pb-4">
                  <CardTitle className="text-xl font-light text-neutral-900">Proposer une heure de visite</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 pt-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Date proposée
                    </label>
                    <input
                      type="date"
                      value={proposedDate}
                      onChange={(e) => setProposedDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full h-12 px-4 border-2 border-neutral-200 rounded-xl focus:border-neutral-400 focus:ring-neutral-400 font-light"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Heure proposée
                    </label>
                    <select
                      value={proposedTime}
                      onChange={(e) => setProposedTime(e.target.value as "morning" | "afternoon" | "evening" | "flexible")}
                      className="w-full h-12 px-4 border-2 border-neutral-200 rounded-xl focus:border-neutral-400 focus:ring-neutral-400 font-light"
                    >
                      <option value="flexible">Flexible</option>
                      <option value="morning">Matin (9h-12h)</option>
                      <option value="afternoon">Après-midi (13h-17h)</option>
                      <option value="evening">Soir (18h-20h)</option>
                    </select>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Message (optionnel)
                    </label>
                    <textarea
                      value={proposedMessage}
                      onChange={(e) => setProposedMessage(e.target.value)}
                      placeholder="Ajoutez un message pour le locataire..."
                      rows={3}
                      className="w-full px-4 py-3 border-2 border-neutral-200 rounded-xl focus:border-neutral-400 focus:ring-neutral-400 focus:outline-none font-light resize-none"
                    />
                  </div>
                  
                  <div className="flex gap-3 pt-2">
                    <Button
                      className="flex-1 h-11 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl font-light shadow-lg hover:shadow-xl transition-all"
                      onClick={() => proposeVisitTime(proposingVisit)}
                      disabled={updatingStatus === proposingVisit}
                    >
                      {updatingStatus === proposingVisit ? "Envoi..." : "Envoyer"}
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1 h-11 rounded-xl font-light border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50"
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
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

