"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { Calendar, Clock, MapPin, User, CheckCircle, X, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface Appointment {
  id: string;
  listingId: string;
  listingTitle: string;
  listingAddress: string;
  slotId: string;
  startAt: string;
  endAt: string;
  status: string;
  tenant: {
    id: string;
    name: string | null;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

export default function LandlordAppointmentsPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [processingAction, setProcessingAction] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth/signin");
      return;
    }

    if (user && user.role !== "LANDLORD") {
      router.push("/");
      return;
    }

    if (user) {
      fetchAppointments();
    }
  }, [user, authLoading, router]);

  const fetchAppointments = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch("/api/landlord/appointments");
      if (!response.ok) {
        throw new Error("Erreur lors du chargement des appointments");
      }

      const data = await response.json();
      setAppointments(data.appointments || []);
    } catch (err: any) {
      setError(err.message || "Erreur lors du chargement des appointments");
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirm = async (appointmentId: string) => {
    try {
      setProcessingId(appointmentId);
      setProcessingAction("confirm");
      setError(null);

      const response = await fetch(`/api/appointments/${appointmentId}/confirm`, {
        method: "PATCH",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Erreur lors de la confirmation");
      }

      fetchAppointments();
    } catch (err: any) {
      setError(err.message || "Erreur lors de la confirmation");
    } finally {
      setProcessingId(null);
      setProcessingAction(null);
    }
  };

  const handleCancel = async (appointmentId: string) => {
    if (!confirm("Êtes-vous sûr de vouloir annuler cette visite ?")) {
      return;
    }

    try {
      setProcessingId(appointmentId);
      setProcessingAction("cancel");
      setError(null);

      const response = await fetch(`/api/appointments/${appointmentId}/cancel`, {
        method: "PATCH",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Erreur lors de l'annulation");
      }

      fetchAppointments();
    } catch (err: any) {
      setError(err.message || "Erreur lors de l'annulation");
    } finally {
      setProcessingId(null);
      setProcessingAction(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "REQUESTED":
        return <Badge className="bg-yellow-100 text-yellow-800">En attente</Badge>;
      case "CONFIRMED":
        return <Badge className="bg-green-100 text-green-800">Confirmé</Badge>;
      case "CANCELED":
        return <Badge className="bg-gray-100 text-gray-800">Annulé</Badge>;
      case "COMPLETED":
        return <Badge className="bg-blue-100 text-blue-800">Terminé</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const canConfirm = (appointment: Appointment) => {
    return appointment.status === "REQUESTED";
  };

  const canCancel = (appointment: Appointment) => {
    return appointment.status !== "CANCELED" && appointment.status !== "COMPLETED";
  };

  if (authLoading || isLoading) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-gray-50 py-12">
          <div className="container mx-auto px-4">
            <div className="text-center py-20">
              <p className="text-xl text-gray-500">Chargement...</p>
            </div>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Demandes de visite</h1>
              <p className="text-gray-600">Gérez les demandes de visite pour vos annonces</p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center gap-2 text-red-700">
                  <AlertCircle className="h-5 w-5" />
                  <span>{error}</span>
                </div>
              </div>
            )}

            {appointments.length === 0 ? (
              <Card className="border-2">
                <CardContent className="p-12 text-center">
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">Aucune demande de visite</p>
                  <p className="text-gray-400 text-sm mt-2">
                    Les demandes de visite de vos annonces apparaîtront ici
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {appointments.map((appointment) => (
                  <Card key={appointment.id} className="border-2">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-gray-900 mb-2">
                            {appointment.listingTitle}
                          </h3>
                          <div className="flex items-center gap-2 text-gray-600 mb-3">
                            <MapPin className="h-4 w-4" />
                            <span className="text-sm">{appointment.listingAddress}</span>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4" />
                              <span>
                                {format(new Date(appointment.startAt), "d MMM yyyy", { locale: fr })}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4" />
                              <span>
                                {format(new Date(appointment.startAt), "HH:mm")} -{" "}
                                {format(new Date(appointment.endAt), "HH:mm")}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <User className="h-4 w-4" />
                            <span>
                              {appointment.tenant.name || "Locataire"} ({appointment.tenant.email})
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          {getStatusBadge(appointment.status)}
                        </div>
                      </div>

                      {(canConfirm(appointment) || canCancel(appointment)) && (
                        <div className="pt-4 border-t border-gray-200 flex gap-3">
                          {canConfirm(appointment) && (
                            <Button
                              size="sm"
                              className="bg-green-600 hover:bg-green-700"
                              onClick={() => handleConfirm(appointment.id)}
                              disabled={processingId === appointment.id}
                            >
                              {processingId === appointment.id && processingAction === "confirm" ? (
                                "Confirmation..."
                              ) : (
                                <>
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  Confirmer
                                </>
                              )}
                            </Button>
                          )}
                          {canCancel(appointment) && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              onClick={() => handleCancel(appointment.id)}
                              disabled={processingId === appointment.id}
                            >
                              {processingId === appointment.id && processingAction === "cancel" ? (
                                "Annulation..."
                              ) : (
                                <>
                                  <X className="h-4 w-4 mr-2" />
                                  Annuler
                                </>
                              )}
                            </Button>
                          )}
                        </div>
                      )}
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

