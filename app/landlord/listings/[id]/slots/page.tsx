"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { Calendar, Clock, Trash2, Plus, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";

interface AvailabilitySlot {
  id: string;
  startAt: string;
  endAt: string;
  isBooked: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function ListingSlotsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const listingId = params.id as string;

  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    startAt: "",
    endAt: "",
  });

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth/signin");
    } else if (user && user.role !== "LANDLORD") {
      router.push("/");
    } else if (user) {
      fetchSlots();
    }
  }, [user, authLoading, router]);

  const fetchSlots = async () => {
    try {
      setIsLoading(true);
      // Fetch all slots (including booked) for the landlord
      const response = await fetch(`/api/landlord/slots`);
      
      if (!response.ok) {
        throw new Error("Erreur lors du chargement des créneaux");
      }

      const data = await response.json();
      // Filter slots for this specific listing
      const listingSlots = data.slots.filter(
        (slot: AvailabilitySlot & { listing: { id: string } }) =>
          slot.listing.id === listingId
      );
      setSlots(listingSlots);
    } catch (err) {
      setError("Erreur lors du chargement des créneaux");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.startAt || !formData.endAt) {
      setError("Veuillez remplir tous les champs");
      return;
    }

    try {
      setIsCreating(true);
      setError(null);

      const response = await fetch(`/api/listings/${listingId}/slots`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          startAt: new Date(formData.startAt).toISOString(),
          endAt: new Date(formData.endAt).toISOString(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erreur lors de la création du créneau");
      }

      // Reset form and refresh slots
      setFormData({ startAt: "", endAt: "" });
      fetchSlots();
    } catch (err: any) {
      setError(err.message || "Erreur lors de la création du créneau");
      console.error(err);
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteSlot = async (slotId: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce créneau ?")) {
      return;
    }

    try {
      const response = await fetch(`/api/slots/${slotId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la suppression du créneau");
      }

      fetchSlots();
    } catch (err) {
      setError("Erreur lors de la suppression du créneau");
      console.error(err);
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

  const now = new Date();
  const upcomingSlots = slots.filter(
    (slot) => new Date(slot.startAt) > now
  );
  const pastSlots = slots.filter(
    (slot) => new Date(slot.startAt) <= now
  );

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="mb-6">
              <Link
                href="/landlord/listings"
                className="inline-flex items-center gap-2 text-gray-600 hover:text-violet-600 mb-4 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Retour aux annonces
              </Link>
              <h1 className="text-3xl font-bold text-gray-900">
                Gérer les créneaux de visite
              </h1>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
                {error}
              </div>
            )}

            {/* Form to create new slot */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5 text-violet-600" />
                  Ajouter un créneau
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateSlot} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="startAt"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        Date et heure de début
                      </label>
                      <Input
                        id="startAt"
                        type="datetime-local"
                        value={formData.startAt}
                        onChange={(e) =>
                          setFormData({ ...formData, startAt: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="endAt"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        Date et heure de fin
                      </label>
                      <Input
                        id="endAt"
                        type="datetime-local"
                        value={formData.endAt}
                        onChange={(e) =>
                          setFormData({ ...formData, endAt: e.target.value })
                        }
                        required
                      />
                    </div>
                  </div>
                  <Button
                    type="submit"
                    disabled={isCreating}
                    className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white"
                  >
                    {isCreating ? "Création..." : "Créer le créneau"}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Upcoming slots */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-violet-600" />
                  Créneaux à venir ({upcomingSlots.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {upcomingSlots.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">
                    Aucun créneau à venir
                  </p>
                ) : (
                  <div className="space-y-3">
                    {upcomingSlots.map((slot) => (
                      <div
                        key={slot.id}
                        className={`p-4 rounded-lg border-2 flex items-center justify-between ${
                          slot.isBooked
                            ? "bg-green-50 border-green-200"
                            : "bg-white border-gray-200"
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <Clock className="h-5 w-5 text-gray-400" />
                          <div>
                            <div className="font-semibold">
                              {format(new Date(slot.startAt), "d MMM yyyy")}
                            </div>
                            <div className="text-sm text-gray-600">
                              {format(new Date(slot.startAt), "HH:mm")} -{" "}
                              {format(new Date(slot.endAt), "HH:mm")}
                            </div>
                            {slot.isBooked && (
                              <span className="inline-block mt-1 px-2 py-1 text-xs font-semibold bg-green-100 text-green-800 rounded">
                                Réservé
                              </span>
                            )}
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteSlot(slot.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Past slots */}
            {pastSlots.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-gray-500">
                    <Calendar className="h-5 w-5" />
                    Créneaux passés ({pastSlots.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {pastSlots.map((slot) => (
                      <div
                        key={slot.id}
                        className="p-4 rounded-lg border-2 bg-gray-50 border-gray-200 flex items-center justify-between opacity-60"
                      >
                        <div className="flex items-center gap-4">
                          <Clock className="h-5 w-5 text-gray-400" />
                          <div>
                            <div className="font-semibold">
                              {format(new Date(slot.startAt), "d MMM yyyy")}
                            </div>
                            <div className="text-sm text-gray-600">
                              {format(new Date(slot.startAt), "HH:mm")} -{" "}
                              {format(new Date(slot.endAt), "HH:mm")}
                            </div>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteSlot(slot.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </>
  );
}

