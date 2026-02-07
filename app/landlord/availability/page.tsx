"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { Calendar, Clock, Plus, X, Save, Trash2, Repeat, CalendarDays } from "lucide-react";
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
  
  // État pour les disponibilités récurrentes
  const [showRecurringModal, setShowRecurringModal] = useState(false);
  const [recurringType, setRecurringType] = useState<"daily" | "weekly" | "monthly" | "custom">("weekly");
  const [recurringStartDate, setRecurringStartDate] = useState("");
  const [recurringEndDate, setRecurringEndDate] = useState("");
  const [recurringStartTime, setRecurringStartTime] = useState("09:00");
  const [recurringEndTime, setRecurringEndTime] = useState("17:00");
  const [selectedWeekdays, setSelectedWeekdays] = useState<number[]>([]); // 0 = Dimanche, 1 = Lundi, etc.
  const [selectedMonthDays, setSelectedMonthDays] = useState<number[]>([]); // 1-31
  const [recurringInterval, setRecurringInterval] = useState(1); // Intervalle (toutes les X semaines/mois)
  const [isCreatingRecurring, setIsCreatingRecurring] = useState(false);

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
      setError(null);
      const response = await fetch(`/api/listings/${listingId}/availability`, {
        cache: "no-store",
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.details || errorData.error || "Erreur lors du chargement des disponibilités";
        console.error("Erreur API:", errorData);
        throw new Error(errorMessage);
      }

      const data = await response.json();
      setAvailabilitySlots(data.slots || []);
    } catch (err) {
      console.error("Erreur:", err);
      const errorMessage = err instanceof Error ? err.message : "Erreur lors du chargement des disponibilités";
      setError(errorMessage);
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

  const createRecurringAvailability = async () => {
    if (!selectedListingId || !recurringStartDate || !recurringEndDate) {
      setError("Veuillez remplir tous les champs requis");
      return;
    }

    if (recurringType === "weekly" && selectedWeekdays.length === 0) {
      setError("Veuillez sélectionner au moins un jour de la semaine");
      return;
    }

    if (recurringType === "monthly" && selectedMonthDays.length === 0) {
      setError("Veuillez sélectionner au moins un jour du mois");
      return;
    }

    try {
      setIsCreatingRecurring(true);
      setError(null);

      const response = await fetch(`/api/listings/${selectedListingId}/availability/recurring`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: recurringType,
          startDate: recurringStartDate,
          endDate: recurringEndDate,
          startTime: recurringStartTime,
          endTime: recurringEndTime,
          weekdays: recurringType === "weekly" ? selectedWeekdays : undefined,
          monthDays: recurringType === "monthly" ? selectedMonthDays : undefined,
          interval: recurringInterval,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Erreur lors de la création des disponibilités récurrentes");
      }

      const result = await response.json();
      
      // Fermer le modal et réinitialiser
      setShowRecurringModal(false);
      setRecurringType("weekly");
      setSelectedWeekdays([]);
      setSelectedMonthDays([]);
      setRecurringInterval(1);

      // Rafraîchir la liste
      await fetchAvailabilitySlots(selectedListingId);

      alert(`${result.count} disponibilités créées avec succès !`);
    } catch (err) {
      console.error("Erreur:", err);
      setError(err instanceof Error ? err.message : "Erreur lors de la création des disponibilités récurrentes");
    } finally {
      setIsCreatingRecurring(false);
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
                    <div className="grid md:grid-cols-2 gap-6">
                      {/* Disponibilité ponctuelle */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Calendar className="h-5 w-5" />
                            Disponibilité ponctuelle
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="grid gap-4">
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
                            <div className="grid grid-cols-2 gap-4">
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
                          </div>
                          <Button
                            onClick={createAvailabilitySlot}
                            disabled={isCreatingSlot || !newSlotDate}
                            className="w-full"
                            variant="outline"
                          >
                            {isCreatingSlot ? (
                              <>
                                <Clock className="h-4 w-4 mr-2 animate-spin" />
                                Création...
                              </>
                            ) : (
                              <>
                                <Plus className="h-4 w-4 mr-2" />
                                Ajouter
                              </>
                            )}
                          </Button>
                        </CardContent>
                      </Card>

                      {/* Disponibilité récurrente */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Repeat className="h-5 w-5" />
                            Disponibilité récurrente
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <p className="text-sm text-gray-600">
                            Créez des disponibilités qui se répètent automatiquement selon un calendrier.
                          </p>
                          <Button
                            onClick={() => {
                              setShowRecurringModal(true);
                              const today = new Date();
                              setRecurringStartDate(today.toISOString().split('T')[0]);
                              const endDate = new Date(today);
                              endDate.setMonth(endDate.getMonth() + 3);
                              setRecurringEndDate(endDate.toISOString().split('T')[0]);
                            }}
                            className="w-full"
                          >
                            <Repeat className="h-4 w-4 mr-2" />
                            Configurer une récurrence
                          </Button>
                        </CardContent>
                      </Card>
                    </div>

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

      {/* Modal pour les disponibilités récurrentes */}
      {showRecurringModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4">
          <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <CardHeader className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Repeat className="h-5 w-5" />
                Disponibilités récurrentes
              </CardTitle>
              <button
                onClick={() => setShowRecurringModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Type de récurrence */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Type de récurrence
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { value: "daily", label: "Quotidien", icon: CalendarDays },
                    { value: "weekly", label: "Hebdomadaire", icon: Repeat },
                    { value: "monthly", label: "Mensuel", icon: Calendar },
                    { value: "custom", label: "Personnalisé", icon: Clock },
                  ].map(({ value, label, icon: Icon }) => (
                    <button
                      key={value}
                      onClick={() => setRecurringType(value as any)}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        recurringType === value
                          ? "border-neutral-900 bg-neutral-900 text-white"
                          : "border-neutral-200 bg-white text-neutral-700 hover:border-neutral-300"
                      }`}
                    >
                      <Icon className="h-5 w-5 mx-auto mb-2" />
                      <div className="text-sm font-medium">{label}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Période */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date de début
                  </label>
                  <input
                    type="date"
                    value={recurringStartDate}
                    onChange={(e) => setRecurringStartDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date de fin
                  </label>
                  <input
                    type="date"
                    value={recurringEndDate}
                    onChange={(e) => setRecurringEndDate(e.target.value)}
                    min={recurringStartDate || new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
                  />
                </div>
              </div>

              {/* Heures */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Heure de début
                  </label>
                  <input
                    type="time"
                    value={recurringStartTime}
                    onChange={(e) => setRecurringStartTime(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Heure de fin
                  </label>
                  <input
                    type="time"
                    value={recurringEndTime}
                    onChange={(e) => setRecurringEndTime(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
                  />
                </div>
              </div>

              {/* Options spécifiques selon le type */}
              {recurringType === "weekly" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Jours de la semaine
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { value: 0, label: "Dim" },
                      { value: 1, label: "Lun" },
                      { value: 2, label: "Mar" },
                      { value: 3, label: "Mer" },
                      { value: 4, label: "Jeu" },
                      { value: 5, label: "Ven" },
                      { value: 6, label: "Sam" },
                    ].map(({ value, label }) => (
                      <button
                        key={value}
                        onClick={() => {
                          if (selectedWeekdays.includes(value)) {
                            setSelectedWeekdays(selectedWeekdays.filter((d) => d !== value));
                          } else {
                            setSelectedWeekdays([...selectedWeekdays, value]);
                          }
                        }}
                        className={`px-4 py-2 rounded-lg border-2 transition-all ${
                          selectedWeekdays.includes(value)
                            ? "border-neutral-900 bg-neutral-900 text-white"
                            : "border-neutral-200 bg-white text-neutral-700 hover:border-neutral-300"
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Répéter toutes les X semaines
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="52"
                      value={recurringInterval}
                      onChange={(e) => setRecurringInterval(parseInt(e.target.value) || 1)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
                    />
                  </div>
                </div>
              )}

              {recurringType === "monthly" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Jours du mois
                  </label>
                  <div className="grid grid-cols-7 gap-2 max-h-48 overflow-y-auto p-2 border border-gray-200 rounded-lg">
                    {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                      <button
                        key={day}
                        onClick={() => {
                          if (selectedMonthDays.includes(day)) {
                            setSelectedMonthDays(selectedMonthDays.filter((d) => d !== day));
                          } else {
                            setSelectedMonthDays([...selectedMonthDays, day]);
                          }
                        }}
                        className={`px-3 py-2 rounded-lg border-2 transition-all text-sm ${
                          selectedMonthDays.includes(day)
                            ? "border-neutral-900 bg-neutral-900 text-white"
                            : "border-neutral-200 bg-white text-neutral-700 hover:border-neutral-300"
                        }`}
                      >
                        {day}
                      </button>
                    ))}
                  </div>
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Répéter tous les X mois
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="12"
                      value={recurringInterval}
                      onChange={(e) => setRecurringInterval(parseInt(e.target.value) || 1)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
                    />
                  </div>
                </div>
              )}

              {recurringType === "daily" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Répéter tous les X jours
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="365"
                    value={recurringInterval}
                    onChange={(e) => setRecurringInterval(parseInt(e.target.value) || 1)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
                  />
                </div>
              )}

              {recurringType === "custom" && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-700">
                    Le mode personnalisé fonctionne comme le mode quotidien. 
                    Sélectionnez l'intervalle en jours pour personnaliser votre récurrence.
                  </p>
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Répéter tous les X jours
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="365"
                      value={recurringInterval}
                      onChange={(e) => setRecurringInterval(parseInt(e.target.value) || 1)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
                    />
                  </div>
                </div>
              )}

              {/* Boutons d'action */}
              <div className="flex gap-3 pt-4 border-t">
                <Button
                  onClick={createRecurringAvailability}
                  disabled={isCreatingRecurring || !recurringStartDate || !recurringEndDate}
                  className="flex-1"
                >
                  {isCreatingRecurring ? (
                    <>
                      <Clock className="h-4 w-4 mr-2 animate-spin" />
                      Création...
                    </>
                  ) : (
                    <>
                      <Repeat className="h-4 w-4 mr-2" />
                      Créer les disponibilités
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowRecurringModal(false)}
                  disabled={isCreatingRecurring}
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

