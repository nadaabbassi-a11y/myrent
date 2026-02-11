"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  MapPin, 
  Bed, 
  Bath, 
  DollarSign,
  Wifi,
  Flame,
  Droplet,
  Zap,
  Dog,
  Calendar,
  MessageSquare,
  CalendarDays,
  Shield,
  Home,
  Square,
  Waves,
  Dumbbell,
  Gamepad2,
  ArrowUpDown,
  Car,
  Wind,
  UtensilsCrossed,
  TreePine,
  Lock,
  Accessibility,
  Shirt,
  Sparkles,
  Box,
  Utensils
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { ListingMap } from "@/components/listing-map";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";
import { Send, X, CheckCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Listing {
  id: string;
  title: string;
  description: string;
  price: number;
  city: string;
  area: string | null;
  address: string;
  postalCode: string | null;
  bedrooms: number;
  bathrooms: number;
  furnished: boolean;
  petAllowed: boolean;
  wifiIncluded: boolean;
  heatingIncluded: boolean;
  hotWaterIncluded: boolean;
  electricityIncluded: boolean;
  squareFootage?: number | null;
  pool?: boolean;
  gym?: boolean;
  recreationRoom?: boolean;
  elevator?: boolean;
  parkingIncluded?: boolean;
  parkingPaid?: boolean;
  washerDryer?: boolean;
  airConditioning?: boolean;
  balcony?: boolean;
  yard?: boolean;
  dishwasher?: boolean;
  refrigerator?: boolean;
  oven?: boolean;
  microwave?: boolean;
  freezer?: boolean;
  stove?: boolean;
  storage?: boolean;
  security?: boolean;
  wheelchairAccessible?: boolean;
  minTerm?: number;
  maxTerm?: number | null;
  deposit?: number;
  images: string[];
  latitude: number | null;
  longitude: number | null;
  landlordId?: string;
  landlordName?: string;
}

// Fonction pour raccourcir l'adresse
const shortenAddress = (address: string | null, city: string | null = null, area: string | null = null): string => {
  if (!address) return "";
  
  if (city) {
    const streetPart = address.split(",")[0].trim();
    if (area) {
      return `${streetPart}, ${area}, ${city}`;
    }
    return `${streetPart}, ${city}`;
  }
  
  const parts = address.split(",");
  if (parts.length > 1) {
    return parts[0].trim();
  }
  
  if (address.length > 60) {
    return address.substring(0, 60) + "...";
  }
  
  return address;
};

export default function ListingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [listing, setListing] = useState<Listing | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [messageContent, setMessageContent] = useState("");
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [messageError, setMessageError] = useState<string | null>(null);
  const [messageSuccess, setMessageSuccess] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [isBooking, setIsBooking] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [existingAppointment, setExistingAppointment] = useState<{
    id: string;
    status: string;
    startAt: string;
    endAt: string;
  } | null>(null);
  const [isLoadingAppointment, setIsLoadingAppointment] = useState(false);
  const [isCanceling, setIsCanceling] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    if (params.id) {
      fetchListing();
    }
  }, [params.id]);

  useEffect(() => {
    if (user && user.role === "TENANT" && listing?.id) {
      fetchExistingAppointment();
    }
  }, [user, listing?.id]);

  // Rafraîchir aussi quand on revient sur la page (par exemple après une réservation)
  useEffect(() => {
    const handleFocus = () => {
      if (user && user.role === "TENANT" && listing?.id) {
        fetchExistingAppointment();
      }
    };
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [user, listing?.id]);

  const fetchListing = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/listings/${params.id}`);
      
      if (!response.ok) {
        throw new Error("Annonce introuvable");
      }

      const data = await response.json();
      setListing(data.listing || data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors du chargement");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchExistingAppointment = async () => {
    if (!listing?.id || !user) return;
    
    try {
      setIsLoadingAppointment(true);
      const response = await fetch(`/api/appointments/listing/${listing.id}`, {
        cache: 'no-store',
      });
      
      if (!response.ok) {
        throw new Error("Erreur lors de la vérification du rendez-vous");
      }

      const data = await response.json();
      setExistingAppointment(data.appointment || null);
    } catch (err) {
      console.error("Erreur lors de la vérification du rendez-vous:", err);
      setExistingAppointment(null);
    } finally {
      setIsLoadingAppointment(false);
    }
  };

  const handleCancelAppointment = async () => {
    if (!existingAppointment) return;

    if (!confirm("Êtes-vous sûr de vouloir annuler ce rendez-vous ?")) {
      return;
    }

    setIsCanceling(true);
    setBookingError(null);

    try {
      const response = await fetch(`/api/appointments/${existingAppointment.id}/cancel`, {
        method: "PATCH",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Erreur lors de l'annulation");
      }

      setExistingAppointment(null);
      setBookingSuccess(true);
      
      setTimeout(() => {
        setBookingSuccess(false);
      }, 2000);
    } catch (err: any) {
      setBookingError(err.message || "Erreur lors de l'annulation");
    } finally {
      setIsCanceling(false);
    }
  };

  const handleEditAppointment = () => {
    if (!existingAppointment) return;
    
    // Pré-remplir la modal avec la date et l'heure existantes
    const startDate = new Date(existingAppointment.startAt);
    const dateString = startDate.toISOString().split("T")[0];
    const timeString = startDate.toTimeString().slice(0, 5);
    
    setSelectedDate(dateString);
    setSelectedTime(timeString);
    setCurrentMonth(startDate);
    setShowEditModal(true);
    setBookingError(null);
    setBookingSuccess(false);
  };

  const handleUpdateAppointment = async () => {
    if (!selectedDate || !selectedTime || !listing || !existingAppointment) {
      setBookingError("Veuillez sélectionner une date et une heure");
      return;
    }

    if (!user) {
      router.push("/auth/signin");
      return;
    }

    setIsBooking(true);
    setBookingError(null);
    setBookingSuccess(false);

    try {
      // D'abord annuler l'ancien rendez-vous
      const cancelResponse = await fetch(`/api/appointments/${existingAppointment.id}/cancel`, {
        method: "PATCH",
      });

      if (!cancelResponse.ok) {
        const data = await cancelResponse.json();
        throw new Error(data.error || "Erreur lors de l'annulation de l'ancien rendez-vous");
      }

      // Créer un nouveau rendez-vous avec la nouvelle date/heure
      const datetime = new Date(`${selectedDate}T${selectedTime}`);
      
      const response = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          datetime: datetime.toISOString(),
          listingId: listing.id,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Erreur lors de la modification");
      }

      setBookingSuccess(true);
      
      // Rafraîchir le rendez-vous existant
      await fetchExistingAppointment();
      
      // Fermer la modal après 1.5 secondes
      setTimeout(() => {
        setShowEditModal(false);
        setBookingSuccess(false);
      }, 1500);
    } catch (err: any) {
      setBookingError(err.message || "Erreur lors de la modification");
    } finally {
      setIsBooking(false);
    }
  };

  const handleSendMessage = async () => {
    if (!messageContent.trim() || !listing) {
      setMessageError("Veuillez entrer un message");
      return;
    }

    if (!user) {
      router.push("/auth/signin");
      return;
    }

    setIsSendingMessage(true);
    setMessageError(null);
    setMessageSuccess(false);

    try {
      // Créer ou récupérer le thread
      const threadResponse = await fetch("/api/messages/threads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listingId: listing.id }),
      });

      if (!threadResponse.ok) {
        const data = await threadResponse.json();
        throw new Error(data.error || "Erreur lors de la création du thread");
      }

      const { threadId } = await threadResponse.json();

      // Envoyer le message
      const messageResponse = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          threadId,
          content: messageContent.trim(),
        }),
      });

      if (!messageResponse.ok) {
        const data = await messageResponse.json();
        throw new Error(data.error || "Erreur lors de l'envoi du message");
      }

      setMessageSuccess(true);
      setMessageContent("");
      
      // Fermer la modal après 1.5 secondes
      setTimeout(() => {
        setShowMessageModal(false);
        setMessageSuccess(false);
        router.push(`/tenant/messages?threadId=${threadId}`);
      }, 1500);
    } catch (err: any) {
      setMessageError(err.message || "Erreur lors de l'envoi du message");
    } finally {
      setIsSendingMessage(false);
    }
  };

  const handleBookVisit = async () => {
    if (!selectedDate || !selectedTime || !listing) {
      setBookingError("Veuillez sélectionner une date et une heure");
      return;
    }

    if (!user) {
      router.push("/auth/signin");
      return;
    }

    setIsBooking(true);
    setBookingError(null);
    setBookingSuccess(false);

    try {
      // Combiner la date et l'heure
      const datetime = new Date(`${selectedDate}T${selectedTime}`);
      
      const response = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          datetime: datetime.toISOString(),
          listingId: listing.id,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Erreur lors de la réservation");
      }

      setBookingSuccess(true);
      
      // Réinitialiser les champs
      setSelectedDate("");
      setSelectedTime("");
      setBookingError(null);
      
      // Rafraîchir le rendez-vous existant après un court délai pour laisser le temps à la DB
      setTimeout(async () => {
        await fetchExistingAppointment();
      }, 500);
      
      // Fermer la modal après 1.5 secondes
      setTimeout(() => {
        setShowBookingModal(false);
        setBookingSuccess(false);
      }, 1500);
    } catch (err: any) {
      setBookingError(err.message || "Erreur lors de la réservation");
    } finally {
      setIsBooking(false);
    }
  };

  // Générer les créneaux horaires (de 9h à 18h, par tranches de 15 minutes)
  const generateTimeSlots = () => {
    const slots = [];
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const isToday = selectedDate && new Date(selectedDate).getTime() === today.getTime();
    
    for (let hour = 9; hour < 18; hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        const timeString = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
        
        // Si c'est aujourd'hui, filtrer les créneaux dans le passé
        if (isToday) {
          const slotDateTime = new Date(`${selectedDate}T${timeString}`);
          if (slotDateTime < now) {
            continue; // Ignorer les créneaux dans le passé
          }
        }
        
        slots.push(timeString);
      }
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();

  // Fonctions pour le calendrier
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days = [];
    
    // Ajouter les jours du mois précédent pour compléter la première semaine
    const prevMonth = new Date(year, month - 1, 0);
    const daysInPrevMonth = prevMonth.getDate();
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      days.push({
        date: new Date(year, month - 1, daysInPrevMonth - i),
        isCurrentMonth: false,
        isToday: false,
        isPast: true,
      });
    }
    
    // Ajouter les jours du mois actuel
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    for (let day = 1; day <= daysInMonth; day++) {
      const dateObj = new Date(year, month, day);
      dateObj.setHours(0, 0, 0, 0);
      days.push({
        date: dateObj,
        isCurrentMonth: true,
        isToday: dateObj.getTime() === today.getTime(),
        isPast: dateObj < today,
      });
    }
    
    // Ajouter les jours du mois suivant pour compléter la dernière semaine
    const remainingDays = 42 - days.length; // 6 semaines * 7 jours
    for (let day = 1; day <= remainingDays; day++) {
      const dateObj = new Date(year, month + 1, day);
      dateObj.setHours(0, 0, 0, 0);
      days.push({
        date: dateObj,
        isCurrentMonth: false,
        isToday: false,
        isPast: dateObj < today,
      });
    }
    
    return days;
  };

  const formatMonthYear = (date: Date) => {
    return date.toLocaleDateString("fr-FR", { month: "long", year: "numeric" });
  };

  const handlePreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const handleDateClick = (date: Date) => {
    if (date < new Date(new Date().setHours(0, 0, 0, 0))) {
      return; // Ne pas permettre de sélectionner les dates passées
    }
    const dateString = date.toISOString().split("T")[0];
    setSelectedDate(dateString);
    setBookingError(null);
  };

  if (isLoading) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-white py-12">
          <div className="container mx-auto px-4">
            <div className="text-center">Chargement...</div>
          </div>
        </main>
      </>
    );
  }

  if (error || !listing) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-white py-12">
          <div className="container mx-auto px-4">
            <div className="text-center">
              <p className="text-red-600 mb-4">{error || "Annonce introuvable"}</p>
              <Link href="/listings">
                <Button>Retour aux annonces</Button>
              </Link>
            </div>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-white py-12">
        <div className="container mx-auto px-4 max-w-6xl">
          <Link href="/listings" className="inline-flex items-center gap-2 text-neutral-600 hover:text-neutral-900 mb-6">
            <ArrowLeft className="h-4 w-4" />
            Retour aux annonces
          </Link>

          <div className="space-y-16">
            {/* Top Section - Two Columns */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
              {/* Left Column - Images */}
              <div>
                {listing.images && listing.images.length > 0 ? (
                  <div className="relative aspect-square rounded-2xl overflow-hidden bg-neutral-100">
                    <Image
                      src={listing.images[0]}
                      alt={listing.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                  </div>
                ) : (
                  <div className="aspect-square rounded-2xl bg-neutral-100 flex items-center justify-center">
                    <span className="text-neutral-400">Aucune image</span>
                  </div>
                )}
              </div>

            {/* Right Column - Header, Price, Landlord, Button */}
            <div className="flex flex-col">
              {/* Header Section */}
              <div className="space-y-2 pb-3 border-b border-neutral-200 mb-3">
                <h1 className="text-5xl font-light text-neutral-900 leading-tight">
                  {listing.title}
                </h1>
                {(listing.address || listing.city) && (
                  <p className="text-xl text-neutral-600 font-light">
                    {shortenAddress(listing.address, listing.city, listing.area)}
                  </p>
                )}
              </div>

              {/* Price Section */}
              {listing.price != null && (
                <div className="pb-3 border-b border-neutral-200 mb-3">
                  <div className="flex items-baseline gap-3">
                    <span className="text-5xl font-light text-neutral-900">
                      {typeof listing.price === 'number' ? listing.price.toLocaleString('fr-CA') : listing.price}
                    </span>
                    <span className="text-2xl text-neutral-600 font-light">$/mois</span>
                  </div>
                </div>
              )}

              {/* Landlord Section */}
              {listing.landlordName && (
                <div className="pb-3 border-b border-neutral-200 mb-3">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center text-white font-semibold text-lg">
                      {listing.landlordName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm text-neutral-500 font-light mb-1">Propriétaire</p>
                      <p className="text-xl font-light text-neutral-900">{listing.landlordName}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons - Higher up */}
              <div className="space-y-3 pt-3">
                {listing.landlordName && (
                  <Button 
                    className="w-full h-14 text-lg bg-neutral-900 hover:bg-neutral-800 text-white font-light shadow-lg"
                    onClick={() => {
                      if (!user) {
                        router.push("/auth/signin");
                        return;
                      }
                      setShowMessageModal(true);
                      setMessageContent("");
                      setMessageError(null);
                      setMessageSuccess(false);
                    }}
                  >
                    <MessageSquare className="h-5 w-5 mr-3" />
                    Envoyer un message
                  </Button>
                )}
                {existingAppointment ? (
                  <div className="space-y-3">
                    <div className="p-4 bg-neutral-50 rounded-2xl border border-neutral-200">
                      <p className="text-sm font-light text-neutral-700 mb-1">
                        Rendez-vous réservé
                      </p>
                      <p className="text-base font-light text-neutral-900">
                        {new Date(existingAppointment.startAt).toLocaleDateString("fr-FR", {
                          weekday: "long",
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </p>
                      <p className="text-sm font-light text-neutral-600">
                        {new Date(existingAppointment.startAt).toLocaleTimeString("fr-FR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })} - {new Date(existingAppointment.endAt).toLocaleTimeString("fr-FR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <Button 
                        className="h-14 text-base bg-neutral-900 hover:bg-neutral-800 text-white font-light shadow-lg"
                        onClick={handleEditAppointment}
                        disabled={isCanceling || existingAppointment.status === "CANCELED"}
                      >
                        <Calendar className="h-5 w-5 mr-2" />
                        Modifier
                      </Button>
                      <Button 
                        className="h-14 text-base border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 font-light"
                        variant="outline"
                        onClick={handleCancelAppointment}
                        disabled={isCanceling || existingAppointment.status === "CANCELED"}
                      >
                        {isCanceling ? (
                          <span className="flex items-center gap-2">
                            <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                            Annulation...
                          </span>
                        ) : (
                          <>
                            <X className="h-5 w-5 mr-2" />
                            Annuler
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button 
                    className="w-full h-14 text-lg bg-neutral-900 hover:bg-neutral-800 text-white font-light shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={() => {
                      if (!user) {
                        router.push("/auth/signin");
                        return;
                      }
                      setShowBookingModal(true);
                      setSelectedDate("");
                      setSelectedTime("");
                      setBookingError(null);
                      setBookingSuccess(false);
                      setCurrentMonth(new Date());
                    }}
                    disabled={isLoadingAppointment || !!existingAppointment}
                  >
                    <Calendar className="h-5 w-5 mr-3" />
                    {isLoadingAppointment ? "Vérification..." : existingAppointment ? "Visite déjà réservée" : "Réserver une visite"}
                  </Button>
                )}
              </div>
            </div>
            </div>

            {/* Full Width Sections - Description, Features, Specifications */}
            <div className="space-y-12">
              {/* Description Section */}
              <div className="border-t border-neutral-200 pt-8">
                <h3 className="text-2xl font-medium text-neutral-900 mb-4">Description</h3>
                <p className="text-lg text-neutral-600 font-light leading-relaxed whitespace-pre-line max-w-4xl">
                  {listing.description}
                </p>
              </div>

              {/* Features Section - Organized by Categories */}
              {(listing.furnished || listing.petAllowed || listing.wifiIncluded || listing.heatingIncluded || listing.hotWaterIncluded || listing.electricityIncluded || listing.pool || listing.gym || listing.recreationRoom || listing.elevator || listing.parkingIncluded || listing.parkingPaid || listing.washerDryer || listing.airConditioning || listing.balcony || listing.yard || listing.dishwasher || listing.refrigerator || listing.oven || listing.microwave || listing.freezer || listing.stove || listing.storage || listing.security || listing.wheelchairAccessible) && (
                <div className="border-t border-neutral-200 pt-8">
                  <h3 className="text-sm text-neutral-500 font-medium mb-6 uppercase tracking-wide">Caractéristiques</h3>
                  
                  {/* Utilities Section */}
                  {(listing.wifiIncluded || listing.heatingIncluded || listing.hotWaterIncluded || listing.electricityIncluded || listing.airConditioning) && (
                    <div className="mb-8">
                      <h4 className="text-xs text-neutral-500 font-medium mb-4 uppercase tracking-wide">Services publics</h4>
                      <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
                        {listing.wifiIncluded && (
                          <div className="flex items-center gap-3">
                            <div className="p-3 rounded-lg bg-blue-50 border border-blue-200 flex-shrink-0">
                              <Wifi className="h-5 w-5 text-blue-600" />
                            </div>
                            <span className="text-blue-700 font-light text-sm">WiFi</span>
                          </div>
                        )}
                        {listing.heatingIncluded && (
                          <div className="flex items-center gap-3">
                            <div className="p-3 rounded-lg bg-red-50 border border-red-200 flex-shrink-0">
                              <Flame className="h-5 w-5 text-red-600" />
                            </div>
                            <span className="text-red-700 font-light text-sm">Chauffage</span>
                          </div>
                        )}
                        {listing.hotWaterIncluded && (
                          <div className="flex items-center gap-3">
                            <div className="p-3 rounded-lg bg-cyan-50 border border-cyan-200 flex-shrink-0">
                              <Droplet className="h-5 w-5 text-cyan-600" />
                            </div>
                            <span className="text-cyan-700 font-light text-sm">Eau chaude</span>
                          </div>
                        )}
                        {listing.electricityIncluded && (
                          <div className="flex items-center gap-3">
                            <div className="p-3 rounded-lg bg-yellow-50 border border-yellow-200 flex-shrink-0">
                              <Zap className="h-5 w-5 text-yellow-600" />
                            </div>
                            <span className="text-yellow-700 font-light text-sm">Électricité</span>
                          </div>
                        )}
                        {listing.airConditioning && (
                          <div className="flex items-center gap-3">
                            <div className="p-3 rounded-lg bg-sky-50 border border-sky-200 flex-shrink-0">
                              <Wind className="h-5 w-5 text-sky-600" />
                            </div>
                            <span className="text-sky-700 font-light text-sm">Climatisation</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Building Features Section */}
                  {(listing.furnished || listing.elevator || listing.storage || listing.security || listing.wheelchairAccessible) && (
                    <div className="mb-8">
                      <h4 className="text-xs text-neutral-500 font-medium mb-4 uppercase tracking-wide">Caractéristiques du bâtiment</h4>
                      <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
                        {listing.furnished && (
                          <div className="flex items-center gap-3">
                            <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 flex-shrink-0">
                              <Home className="h-5 w-5 text-amber-600" />
                            </div>
                            <span className="text-amber-700 font-light text-sm">Meublé</span>
                          </div>
                        )}
                        {listing.elevator && (
                          <div className="flex items-center gap-3">
                            <div className="p-3 rounded-lg bg-gray-50 border border-gray-200 flex-shrink-0">
                              <ArrowUpDown className="h-5 w-5 text-gray-600" />
                            </div>
                            <span className="text-gray-700 font-light text-sm">Ascenseur</span>
                          </div>
                        )}
                        {listing.storage && (
                          <div className="flex items-center gap-3">
                            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex-shrink-0">
                              <Home className="h-5 w-5 text-slate-600" />
                            </div>
                            <span className="text-slate-700 font-light text-sm">Cave/entreposage</span>
                          </div>
                        )}
                        {listing.security && (
                          <div className="flex items-center gap-3">
                            <div className="p-3 rounded-lg bg-red-50 border border-red-200 flex-shrink-0">
                              <Lock className="h-5 w-5 text-red-600" />
                            </div>
                            <span className="text-red-700 font-light text-sm">Sécurité</span>
                          </div>
                        )}
                        {listing.wheelchairAccessible && (
                          <div className="flex items-center gap-3">
                            <div className="p-3 rounded-lg bg-teal-50 border border-teal-200 flex-shrink-0">
                              <Accessibility className="h-5 w-5 text-teal-600" />
                            </div>
                            <span className="text-teal-700 font-light text-sm">Accès handicapé</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Appliances Section */}
                  {(listing.washerDryer || listing.dishwasher || listing.refrigerator || listing.oven || listing.microwave || listing.freezer || listing.stove) && (
                    <div className="mb-8">
                      <h4 className="text-xs text-neutral-500 font-medium mb-4 uppercase tracking-wide">Électroménagers</h4>
                      <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
                        {listing.washerDryer && (
                          <div className="flex items-center gap-3">
                            <div className="p-3 rounded-lg bg-indigo-50 border border-indigo-200 flex-shrink-0">
                              <Shirt className="h-5 w-5 text-indigo-600" />
                            </div>
                            <span className="text-indigo-700 font-light text-sm">Laveuse/sécheuse</span>
                          </div>
                        )}
                        {listing.dishwasher && (
                          <div className="flex items-center gap-3">
                            <div className="p-3 rounded-lg bg-violet-50 border border-violet-200 flex-shrink-0">
                              <Sparkles className="h-5 w-5 text-violet-600" />
                            </div>
                            <span className="text-violet-700 font-light text-sm">Lave-vaisselle</span>
                          </div>
                        )}
                        {listing.refrigerator && (
                          <div className="flex items-center gap-3">
                            <div className="p-3 rounded-lg bg-blue-50 border border-blue-200 flex-shrink-0">
                              <Box className="h-5 w-5 text-blue-600" />
                            </div>
                            <span className="text-blue-700 font-light text-sm">Réfrigérateur</span>
                          </div>
                        )}
                        {listing.oven && (
                          <div className="flex items-center gap-3">
                            <div className="p-3 rounded-lg bg-orange-50 border border-orange-200 flex-shrink-0">
                              <Flame className="h-5 w-5 text-orange-600" />
                            </div>
                            <span className="text-orange-700 font-light text-sm">Four</span>
                          </div>
                        )}
                        {listing.microwave && (
                          <div className="flex items-center gap-3">
                            <div className="p-3 rounded-lg bg-pink-50 border border-pink-200 flex-shrink-0">
                              <Box className="h-5 w-5 text-pink-600" />
                            </div>
                            <span className="text-pink-700 font-light text-sm">Micro-ondes</span>
                          </div>
                        )}
                        {listing.freezer && (
                          <div className="flex items-center gap-3">
                            <div className="p-3 rounded-lg bg-cyan-50 border border-cyan-200 flex-shrink-0">
                              <Box className="h-5 w-5 text-cyan-600" />
                            </div>
                            <span className="text-cyan-700 font-light text-sm">Congélateur</span>
                          </div>
                        )}
                        {listing.stove && (
                          <div className="flex items-center gap-3">
                            <div className="p-3 rounded-lg bg-red-50 border border-red-200 flex-shrink-0">
                              <Utensils className="h-5 w-5 text-red-600" />
                            </div>
                            <span className="text-red-700 font-light text-sm">Plaque de cuisson</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Outdoor & Parking Section */}
                  {(listing.balcony || listing.yard || listing.parkingIncluded || listing.parkingPaid) && (
                    <div className="mb-8">
                      <h4 className="text-xs text-neutral-500 font-medium mb-4 uppercase tracking-wide">Extérieur et stationnement</h4>
                      <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
                        {listing.balcony && (
                          <div className="flex items-center gap-3">
                            <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 flex-shrink-0">
                              <Home className="h-5 w-5 text-emerald-600" />
                            </div>
                            <span className="text-emerald-700 font-light text-sm">Balcon/terrasse</span>
                          </div>
                        )}
                        {listing.yard && (
                          <div className="flex items-center gap-3">
                            <div className="p-3 rounded-lg bg-green-50 border border-green-200 flex-shrink-0">
                              <TreePine className="h-5 w-5 text-green-600" />
                            </div>
                            <span className="text-green-700 font-light text-sm">Jardin/cour</span>
                          </div>
                        )}
                        {listing.parkingIncluded && (
                          <div className="flex items-center gap-3">
                            <div className="p-3 rounded-lg bg-green-50 border border-green-200 flex-shrink-0">
                              <Car className="h-5 w-5 text-green-600" />
                            </div>
                            <span className="text-green-700 font-medium text-sm">Garage inclus</span>
                          </div>
                        )}
                        {listing.parkingPaid && !listing.parkingIncluded && (
                          <div className="flex items-start gap-3">
                            <div className="p-3 rounded-lg bg-amber-100 border-2 border-amber-300 flex-shrink-0 ring-2 ring-amber-200">
                              <Car className="h-5 w-5 text-amber-700" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-amber-800 font-semibold text-sm line-clamp-2">Garage payant</span>
                                <span className="text-xs bg-amber-200 text-amber-800 px-2 py-1 rounded-full font-semibold flex-shrink-0">
                                  Payant
                                </span>
                              </div>
                            </div>
                          </div>
                        )}
                        {listing.parkingPaid && listing.parkingIncluded && (
                          <div className="flex items-start gap-3">
                            <div className="p-3 rounded-lg bg-amber-100 border-2 border-amber-300 flex-shrink-0 ring-2 ring-amber-200">
                              <Car className="h-5 w-5 text-amber-700" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-amber-800 font-semibold text-sm line-clamp-2 leading-tight">Garage payant<br />(en plus)</span>
                                <span className="text-xs bg-amber-200 text-amber-800 px-2 py-1 rounded-full font-semibold flex-shrink-0">
                                  Payant
                                </span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Amenities Section */}
                  {(listing.pool || listing.gym || listing.recreationRoom) && (
                    <div className="mb-8">
                      <h4 className="text-xs text-neutral-500 font-medium mb-4 uppercase tracking-wide">Services de l'immeuble</h4>
                      <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
                        {listing.pool && (
                          <div className="flex items-center gap-3">
                            <div className="p-3 rounded-lg bg-blue-50 border border-blue-200 flex-shrink-0">
                              <Waves className="h-5 w-5 text-blue-600" />
                            </div>
                            <span className="text-blue-700 font-light text-sm">Piscine</span>
                          </div>
                        )}
                        {listing.gym && (
                          <div className="flex items-center gap-3">
                            <div className="p-3 rounded-lg bg-orange-50 border border-orange-200 flex-shrink-0">
                              <Dumbbell className="h-5 w-5 text-orange-600" />
                            </div>
                            <span className="text-orange-700 font-light text-sm">Salle de sport</span>
                          </div>
                        )}
                        {listing.recreationRoom && (
                          <div className="flex items-center gap-3">
                            <div className="p-3 rounded-lg bg-pink-50 border border-pink-200 flex-shrink-0">
                              <Gamepad2 className="h-5 w-5 text-pink-600" />
                            </div>
                            <span className="text-pink-700 font-light text-sm">Loisirs</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Other Section */}
                  {listing.petAllowed && (
                    <div>
                      <h4 className="text-xs text-neutral-500 font-medium mb-4 uppercase tracking-wide">Autres</h4>
                      <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
                        {listing.petAllowed && (
                          <div className="flex items-center gap-3">
                            <div className="p-3 rounded-lg bg-purple-50 border border-purple-200 flex-shrink-0">
                              <Dog className="h-5 w-5 text-purple-600" />
                            </div>
                            <span className="text-purple-700 font-light text-sm">Animaux acceptés</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Specifications Section */}
              <div className="border-t border-neutral-200 pt-8">
                <h3 className="text-sm text-neutral-500 font-medium mb-6 uppercase tracking-wide">Spécifications</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-lg bg-neutral-50 flex-shrink-0">
                      <Bed className="h-5 w-5 text-neutral-600" />
                    </div>
                    <div>
                      <p className="text-xs text-neutral-500 font-light mb-0.5">Chambres</p>
                      <p className="text-xl font-light text-neutral-900">{listing.bedrooms}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-lg bg-neutral-50 flex-shrink-0">
                      <Bath className="h-5 w-5 text-neutral-600" />
                    </div>
                    <div>
                      <p className="text-xs text-neutral-500 font-light mb-0.5">Salles de bain</p>
                      <p className="text-xl font-light text-neutral-900">{listing.bathrooms}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-lg bg-neutral-50 flex-shrink-0">
                      <Square className="h-5 w-5 text-neutral-600" />
                    </div>
                    <div>
                      <p className="text-xs text-neutral-500 font-light mb-0.5">Superficie</p>
                      <p className="text-xl font-light text-neutral-900">
                        {(listing.squareFootage != null && listing.squareFootage > 0) 
                          ? `${listing.squareFootage.toLocaleString('fr-CA')} pi²`
                          : 'Non spécifiée'}
                      </p>
                    </div>
                  </div>
                  {(listing.minTerm != null && listing.minTerm > 0) && (
                    <div className="flex items-center gap-3">
                      <div className="p-3 rounded-lg bg-neutral-50 flex-shrink-0">
                        <CalendarDays className="h-5 w-5 text-neutral-600" />
                      </div>
                      <div>
                        <p className="text-xs text-neutral-500 font-light mb-0.5">Durée min.</p>
                        <p className="text-xl font-light text-neutral-900">{listing.minTerm} mois</p>
                      </div>
                    </div>
                  )}
                  {listing.deposit && listing.deposit > 0 && (
                    <div className="flex items-center gap-3">
                      <div className="p-3 rounded-lg bg-neutral-50 flex-shrink-0">
                        <Shield className="h-5 w-5 text-neutral-600" />
                      </div>
                      <div>
                        <p className="text-xs text-neutral-500 font-light mb-0.5">Dépôt</p>
                        <p className="text-xl font-light text-neutral-900">{typeof listing.deposit === 'number' ? listing.deposit.toLocaleString('fr-CA') : listing.deposit} $</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Map Section */}
              {listing.latitude && listing.longitude && (
                <div className="border-t border-neutral-200 pt-8">
                  <h3 className="text-2xl font-medium text-neutral-900 mb-6">Emplacement</h3>
                  <div className="w-full">
                    <ListingMap
                      city={listing.city}
                      area={listing.area || ""}
                      title={listing.title}
                      latitude={listing.latitude}
                      longitude={listing.longitude}
                    />
                  </div>
                  {listing.address && (
                    <p className="mt-4 text-base text-neutral-600 font-light flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      {listing.address}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Modal pour envoyer un message */}
      <Dialog open={showMessageModal} onOpenChange={setShowMessageModal}>
        <DialogContent className="sm:max-w-[600px] rounded-3xl border-neutral-200 shadow-xl">
          <DialogHeader className="pb-6">
            <DialogTitle className="text-3xl font-light text-neutral-900">
              Envoyer un message
            </DialogTitle>
            {listing && (
              <p className="text-neutral-600 font-light mt-2">
                À propos de : {listing.title}
              </p>
            )}
          </DialogHeader>

          <div className="space-y-6">
            {messageError && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-sm font-light"
              >
                {messageError}
              </motion.div>
            )}

            {messageSuccess && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-4 bg-green-50 border border-green-200 rounded-2xl text-green-700 text-sm font-light flex items-center gap-2"
              >
                <MessageSquare className="h-5 w-5" />
                Message envoyé avec succès ! Redirection...
              </motion.div>
            )}

            <div>
              <label className="block text-sm font-light text-neutral-700 mb-2">
                Votre message
              </label>
              <Textarea
                value={messageContent}
                onChange={(e) => setMessageContent(e.target.value)}
                placeholder="Bonjour, je suis intéressé(e) par cette annonce..."
                className="min-h-[150px] rounded-2xl border-2 border-neutral-200 focus:border-neutral-400 focus:ring-neutral-400 text-base font-light resize-none"
                disabled={isSendingMessage || messageSuccess}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
              />
              <p className="text-xs text-neutral-500 font-light mt-2">
                Appuyez sur Cmd/Ctrl + Entrée pour envoyer
              </p>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setShowMessageModal(false);
                  setMessageContent("");
                  setMessageError(null);
                  setMessageSuccess(false);
                }}
                disabled={isSendingMessage}
                className="h-11 px-6 rounded-2xl border-neutral-200 hover:bg-neutral-50 font-light"
              >
                Annuler
              </Button>
              <Button
                onClick={handleSendMessage}
                disabled={!messageContent.trim() || isSendingMessage || messageSuccess}
                className="h-11 px-8 bg-neutral-900 hover:bg-neutral-800 text-white rounded-2xl font-light shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSendingMessage ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Envoi...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Send className="h-4 w-4" />
                    Envoyer
                  </span>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal pour réserver/modifier une visite */}
      <Dialog open={showBookingModal || showEditModal} onOpenChange={(open) => {
        if (!open) {
          setShowBookingModal(false);
          setShowEditModal(false);
          setSelectedDate("");
          setSelectedTime("");
          setBookingError(null);
          setBookingSuccess(false);
        }
      }}>
        <DialogContent className="sm:max-w-[600px] rounded-3xl border-neutral-200 shadow-xl">
          <DialogHeader className="pb-6">
            <DialogTitle className="text-3xl font-light text-neutral-900">
              {showEditModal ? "Modifier la visite" : "Réserver une visite"}
            </DialogTitle>
            {listing && (
              <p className="text-neutral-600 font-light mt-2">
                {listing.title}
              </p>
            )}
          </DialogHeader>

          <div className="space-y-6">
            {bookingError && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-sm font-light"
              >
                {bookingError}
              </motion.div>
            )}

            {bookingSuccess && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-4 bg-green-50 border border-green-200 rounded-2xl text-green-700 text-sm font-light flex items-center gap-2"
              >
                <CheckCircle className="h-5 w-5" />
                Visite réservée avec succès ! Redirection...
              </motion.div>
            )}

            <div>
              <label className="block text-sm font-light text-neutral-700 mb-4">
                Date
              </label>
              
              {/* Navigation du mois */}
              <div className="flex items-center justify-between mb-4">
                <button
                  type="button"
                  onClick={handlePreviousMonth}
                  disabled={isBooking || bookingSuccess}
                  className="p-2 rounded-xl hover:bg-neutral-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="h-5 w-5 text-neutral-700" />
                </button>
                <h3 className="text-lg font-light text-neutral-900 capitalize">
                  {formatMonthYear(currentMonth)}
                </h3>
                <button
                  type="button"
                  onClick={handleNextMonth}
                  disabled={isBooking || bookingSuccess}
                  className="p-2 rounded-xl hover:bg-neutral-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="h-5 w-5 text-neutral-700" />
                </button>
              </div>

              {/* Calendrier */}
              <div className="border border-neutral-200 rounded-2xl p-4 bg-white">
                {/* En-têtes des jours de la semaine */}
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"].map((day) => (
                    <div
                      key={day}
                      className="text-center text-xs font-medium text-neutral-500 py-2"
                    >
                      {day}
                    </div>
                  ))}
                </div>

                {/* Jours du calendrier */}
                <div className="grid grid-cols-7 gap-1">
                  {getDaysInMonth(currentMonth).map((day, index) => {
                    const dateString = day.date.toISOString().split("T")[0];
                    const isSelected = selectedDate === dateString;
                    const isDisabled = day.isPast || !day.isCurrentMonth || isBooking || bookingSuccess;

                    return (
                      <button
                        key={index}
                        type="button"
                        onClick={() => handleDateClick(day.date)}
                        disabled={isDisabled}
                        className={`
                          h-10 rounded-xl text-sm font-light transition-all
                          ${isSelected
                            ? "bg-neutral-900 text-white shadow-lg"
                            : day.isToday
                            ? "bg-neutral-100 text-neutral-900 border-2 border-neutral-900"
                            : day.isCurrentMonth
                            ? "text-neutral-700 hover:bg-neutral-50"
                            : "text-neutral-300"
                          }
                          ${isDisabled && !isSelected
                            ? "opacity-30 cursor-not-allowed"
                            : "cursor-pointer"
                          }
                        `}
                      >
                        {day.date.getDate()}
                      </button>
                    );
                  })}
                </div>
              </div>

              {selectedDate && (
                <p className="text-xs text-neutral-500 font-light mt-3 text-center">
                  Date sélectionnée : {new Date(selectedDate).toLocaleDateString("fr-FR", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-light text-neutral-700 mb-2">
                Heure
              </label>
              <div className="grid grid-cols-4 gap-2 max-h-[200px] overflow-y-auto p-2">
                {timeSlots.map((time) => (
                  <button
                    key={time}
                    type="button"
                    onClick={() => {
                      setSelectedTime(time);
                      setBookingError(null);
                    }}
                    disabled={isBooking || bookingSuccess}
                    className={`h-10 px-3 rounded-xl text-sm font-light transition-all ${
                      selectedTime === time
                        ? "bg-neutral-900 text-white shadow-lg"
                        : "bg-neutral-50 text-neutral-700 hover:bg-neutral-100 border border-neutral-200"
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {time}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setShowBookingModal(false);
                  setShowEditModal(false);
                  setSelectedDate("");
                  setSelectedTime("");
                  setBookingError(null);
                  setBookingSuccess(false);
                }}
                disabled={isBooking}
                className="h-11 px-6 rounded-2xl border-neutral-200 hover:bg-neutral-50 font-light"
              >
                Annuler
              </Button>
              <Button
                onClick={showEditModal ? handleUpdateAppointment : handleBookVisit}
                disabled={!selectedDate || !selectedTime || isBooking || bookingSuccess}
                className="h-11 px-8 bg-neutral-900 hover:bg-neutral-800 text-white rounded-2xl font-light shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isBooking ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    {showEditModal ? "Modification..." : "Réservation..."}
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {showEditModal ? "Modifier" : "Réserver"}
                  </span>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
