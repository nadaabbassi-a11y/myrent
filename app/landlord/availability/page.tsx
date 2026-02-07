"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { Calendar, Clock, Plus, X, Save, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface Listing {
  id: string;
  title: string;
  address: string | null;
  city: string;
}

interface AvailabilitySlot {
  id: string;
  startAt: string;
  endAt: string;
  isBooked: boolean;
  listing: {
    id: string;
    title: string;
  };
}

export default function LandlordAvailabilityPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [listings, setListings] = useState<Listing[]>([]);
  const [selectedListingId, setSelectedListingId] = useState<string>("");
  const [availabilitySlots, setAvailabilitySlots] = useState<AvailabilitySlot[]>([]);
  const [isLoadingListings, setIsLoadingListings] = useState(true);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newSlotDate, setNewSlotDate] = useState("");
  const [newSlotStartTime, setNewSlotStartTime] = useState("09:00");
  const [newSlotEndTime, setNewSlotEndTime] = useState("17:00");
  const [isCreatingSlot, setIsCreatingSlot] = useState(false);
  const [deletingSlotId, setDeletingSlotId] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/auth/signin");
    } else if (!isLoading && user && user.role !== "LANDLORD") {
      router.push("/");
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    if (user && user.role === "LANDLORD") {
      fetchListings();
    }
  }, [user]);

  useEffect(() => {
    if (selectedListingId) {
      fetchAvailabilitySlots(selectedListingId);
    } else {
      setAvailabilitySlots([]);
    }
  }, [selectedListingId]);

  const fetchListings = async () => {
    try {
      setIsLoadingListings(true);
      const response = await fetch("/api/landlord/listings", {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("Erreur lors du chargement des annonces");
      }

      const data = await response.json();
      setListings(data.listings || []);
      if (data.listings && data.listings.length > 0) {
        setSelectedListingId(data.listings[0].id);
      }
    } catch (err) {
      console.error("Erreur:", err);
      setError("Erreur lors du chargement des annonces");
    } finally {
      setIsLoadingListings(false);
    }
  };

  const fetchAvailabilitySlots = async (listingId: string) => {
    try {
      setIsLoadingSlots(true);
      const response = await fetch(`/api/listings/${listingId}/availability`, {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("Erreur lors du chargement des disponibilités");
      }

      const data = await response.json();
      setAvailabilitySlots(data.slots || []);
    } catch (err) {
      console.error("Erreur:", err);
      setError("Erreur lors du chargement des disponibilités");
    } finally {
      setIsLoadingSlots(false);
    }
  };

  const createAvailabilitySlot = async () => {
    if (!selectedListingId || !newSlotDate) {
      setError("Veuillez sélectionner une annonce et une date");
      return;
    }

    try {
      setIsCreatingSlot(true);
      setError(null);

      const startDateTime = new Date(`${newSlotDate}T${newSlotStartTime}`);
      const endDateTime = new Date(`${newSlotDate}T${newSlotEndTime}`);

      if (endDateTime <= startDateTime) {
        setError("L'heure de fin doit être après l'heure de début");
        setIsCreatingSlot(false);
        return;
      }

      const response = await fetch(`/api/listings/${selectedListingId}/availability`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          startAt: startDateTime.toISOString(),
          endAt: endDateTime.toISOString(),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Erreur lors de la création de la disponibilité");
      }

      // Réinitialiser le formulaire
      setNewSlotDate("");
      setNewSlotStartTime("09:00");
      setNewSlotEndTime("17:00");

      // Rafraîchir la liste
      await fetchAvailabilitySlots(selectedListingId);
    } catch (err) {
      console.error("Erreur:", err);
      setError(err instanceof Error ? err.message : "Erreur lors de la création de la disponibilité");
    } finally {
      setIsCreatingSlot(false);
    }
  };

  const deleteAvailabilitySlot = async (slotId: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette disponibilité ?")) {
      return;
    }

    try {
      setDeletingSlotId(slotId);
      const response = await fetch(`/api/availability/${slotId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Erreur lors de la suppression");
      }

      // Rafraîchir la liste
      if (selectedListingId) {
        await fetchAvailabilitySlots(selectedListingId);
      }
    } catch (err) {
      console.error("Erreur:", err);
      alert(err instanceof Error ? err.message : "Erreur lors de la suppression");
    } finally {
      setDeletingSlotId(null);
    }
  };

  if (isLoading || isLoadingListings) {
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

  const selectedListing = listings.find((l) => l.id === selectedListingId);
  const availableSlots = availabilitySlots.filter((s) => !s.isBooked);
  const bookedSlots = availabilitySlots.filter((s) => s.isBooked);

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <h1 className="text-3xl font-bold text-gray-900">
                Gérer mes disponibilités
              </h1>
              <Button variant="outline" onClick={() => router.push("/landlord/listings")}>
                Mes annonces
              </Button>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                {error}
              </div>
            )}

            {listings.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Calendar className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-xl font-semibold mb-2 text-gray-700">
                    Aucune annonce
                  </h3>
                  <p className="text-gray-500 mb-6">
                    Vous devez créer une annonce avant de pouvoir gérer vos disponibilités.
                  </p>
                  <Button onClick={() => router.push("/landlord/listings/new")}>
                    Créer une annonce
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                {/* Sélection de l'annonce */}
                <Card>
                  <CardHeader>
                    <CardTitle>Sélectionner une annonce</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <select
                      value={selectedListingId}
                      onChange={(e) => setSelectedListingId(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
                    >
                      {listings.map((listing) => (
                        <option key={listing.id} value={listing.id}>
                          {listing.title} - {listing.address || listing.city}
                        </option>
                      ))}
                    </select>
                  </CardContent>
                </Card>

                {selectedListing && (
                  <>
                    {/* Formulaire pour créer une disponibilité */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Ajouter une disponibilité</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid md:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Date
                            </label>
                            <input
                              type="date"
                              value={newSlotDate}
                              onChange={(e) => setNewSlotDate(e.target.value)}
                              min={new Date().toISOString().split('T')[0]}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Heure de début
                            </label>
                            <input
                              type="time"
                              value={newSlotStartTime}
                              onChange={(e) => setNewSlotStartTime(e.target.value)}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Heure de fin
                            </label>
                            <input
                              type="time"
                              value={newSlotEndTime}
                              onChange={(e) => setNewSlotEndTime(e.target.value)}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
                            />
                          </div>
                        </div>
                        <Button
                          onClick={createAvailabilitySlot}
                          disabled={isCreatingSlot || !newSlotDate}
                          className="w-full md:w-auto"
                        >
                          {isCreatingSlot ? (
                            <>
                              <Clock className="h-4 w-4 mr-2 animate-spin" />
                              Création...
                            </>
                          ) : (
                            <>
                              <Plus className="h-4 w-4 mr-2" />
                              Ajouter la disponibilité
                            </>
                          )}
                        </Button>
                      </CardContent>
                    </Card>

                    {/* Liste des disponibilités */}
                    {isLoadingSlots ? (
                      <Card>
                        <CardContent className="p-12 text-center">
                          <div className="text-gray-500">Chargement des disponibilités...</div>
                        </CardContent>
                      </Card>
                    ) : (
                      <>
                        {/* Disponibilités disponibles */}
                        {availableSlots.length > 0 && (
                          <Card>
                            <CardHeader>
                              <CardTitle>Disponibilités disponibles ({availableSlots.length})</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-3">
                                {availableSlots.map((slot) => (
                                  <div
                                    key={slot.id}
                                    className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg"
                                  >
                                    <div className="flex items-center gap-4">
                                      <Calendar className="h-5 w-5 text-green-600" />
                                      <div>
                                        <div className="font-medium text-gray-900">
                                          {format(new Date(slot.startAt), "EEEE d MMMM yyyy", { locale: fr })}
                                        </div>
                                        <div className="text-sm text-gray-600 flex items-center gap-2">
                                          <Clock className="h-4 w-4" />
                                          {format(new Date(slot.startAt), "HH:mm")} - {format(new Date(slot.endAt), "HH:mm")}
                                        </div>
                                      </div>
                                    </div>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => deleteAvailabilitySlot(slot.id)}
                                      disabled={deletingSlotId === slot.id}
                                      className="border-red-300 text-red-700 hover:bg-red-50"
                                    >
                                      {deletingSlotId === slot.id ? (
                                        <Clock className="h-4 w-4 animate-spin" />
                                      ) : (
                                        <Trash2 className="h-4 w-4" />
                                      )}
                                    </Button>
                                  </div>
                                ))}
                              </div>
                            </CardContent>
                          </Card>
                        )}

                        {/* Disponibilités réservées */}
                        {bookedSlots.length > 0 && (
                          <Card>
                            <CardHeader>
                              <CardTitle>Disponibilités réservées ({bookedSlots.length})</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-3">
                                {bookedSlots.map((slot) => (
                                  <div
                                    key={slot.id}
                                    className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg"
                                  >
                                    <div className="flex items-center gap-4">
                                      <Calendar className="h-5 w-5 text-blue-600" />
                                      <div>
                                        <div className="font-medium text-gray-900">
                                          {format(new Date(slot.startAt), "EEEE d MMMM yyyy", { locale: fr })}
                                        </div>
                                        <div className="text-sm text-gray-600 flex items-center gap-2">
                                          <Clock className="h-4 w-4" />
                                          {format(new Date(slot.startAt), "HH:mm")} - {format(new Date(slot.endAt), "HH:mm")}
                                        </div>
                                      </div>
                                    </div>
                                    <span className="text-sm font-medium text-blue-700">Réservée</span>
                                  </div>
                                ))}
                              </div>
                            </CardContent>
                          </Card>
                        )}

                        {availabilitySlots.length === 0 && (
                          <Card>
                            <CardContent className="p-12 text-center">
                              <Calendar className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                              <h3 className="text-xl font-semibold mb-2 text-gray-700">
                                Aucune disponibilité
                              </h3>
                              <p className="text-gray-500">
                                Ajoutez des disponibilités pour permettre aux locataires de réserver des visites.
                              </p>
                            </CardContent>
                          </Card>
                        )}
                      </>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
}

