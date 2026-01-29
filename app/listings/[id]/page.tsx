"use client";

import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useLanguageContext } from "@/contexts/LanguageContext";
import {
  MapPin,
  Bed,
  Bath,
  Home,
  Wifi,
  Flame,
  Droplet,
  Zap,
  Car,
  Dog,
  ArrowLeft,
  Calendar,
  DollarSign,
  CheckCircle,
  AlertCircle,
  User,
  CalendarCheck,
  Clock,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import { useState, useEffect } from "react";
import { ListingMap } from "@/components/listing-map";
import { format } from "date-fns";

interface Listing {
  id: string;
  title: string;
  price: number;
  city: string;
  area: string | null;
  address?: string | null;
  postalCode?: string | null;
  bedrooms: number;
  bathrooms: number;
  furnished: boolean;
  petAllowed?: boolean;
  images: string[];
  model3dUrl?: string | null;
  panoramaUrl?: string | null;
  matterportUrl?: string | null;
  sketchfabUrl?: string | null;
  description?: string;
  minTerm?: number;
  maxTerm?: number;
  wifiIncluded?: boolean;
  heatingIncluded?: boolean;
  hotWaterIncluded?: boolean;
  electricityIncluded?: boolean;
  parkingIncluded?: boolean;
  latitude?: number | null;
  longitude?: number | null;
  landlordId?: string;
  landlordName?: string;
}

export default function ListingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { t } = useLanguageContext();
  const listingId = params.id as string;
  const [listing, setListing] = useState<Listing | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showVisitModal, setShowVisitModal] = useState(false);
  const [visitDate, setVisitDate] = useState("");
  const [visitTime, setVisitTime] = useState<
    "morning" | "afternoon" | "evening" | "flexible"
  >("flexible");
  const [visitMessage, setVisitMessage] = useState("");
  const [isRequestingVisit, setIsRequestingVisit] = useState(false);
  const [visitRequestSuccess, setVisitRequestSuccess] = useState(false);
  const [visitRequestError, setVisitRequestError] = useState<string | null>(
    null
  );
  const [availableSlots, setAvailableSlots] = useState<
    Array<{ id: string; startAt: string; endAt: string }>
  >([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [isBookingSlot, setIsBookingSlot] = useState<string | null>(null);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [bookingSuccess, setBookingSuccess] = useState<string | null>(null);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [contactMessage, setContactMessage] = useState("");
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [contactError, setContactError] = useState<string | null>(null);
  const [contactSuccess, setContactSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchListing();
    fetchAvailableSlots();
  }, [listingId]);

  const fetchAvailableSlots = async () => {
    try {
      setIsLoadingSlots(true);
      const response = await fetch(`/api/listings/${listingId}/slots`);

      if (response.ok) {
        const data = await response.json();
        setAvailableSlots(data.slots || []);
      }
    } catch (err) {
      console.error("Error fetching slots:", err);
    } finally {
      setIsLoadingSlots(false);
    }
  };

  const fetchListing = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(
        `/api/listings/${listingId}?t=${Date.now()}`,
        {
          cache: "no-store",
          headers: {
            "Cache-Control": "no-cache",
          },
        }
      );

      if (!response.ok) {
        if (response.status === 404) {
          setError("Listing non trouvé");
        } else {
          setError("Erreur lors du chargement du listing");
        }
        setIsLoading(false);
        return;
      }

      const data = await response.json();
      setListing(data.listing);
    } catch (err) {
      setError("Erreur lors du chargement du listing");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-gray-50 py-8">
          <div className="container mx-auto px-4">
            <div className="text-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600 mx-auto mb-4" />
              <p className="text-gray-600">Chargement du listing...</p>
            </div>
          </div>
        </main>
      </>
    );
  }

  if (error || !listing) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-gray-50 py-8">
          <div className="container mx-auto px-4">
            <div className="text-center py-20">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                Listing non trouvé
              </h1>
              <p className="text-gray-600 mb-8">
                {error || "Le listing que vous recherchez n'existe pas."}
              </p>
              <Link href="/listings">
                <Button>Retour aux listings</Button>
              </Link>
            </div>
          </div>
        </main>
      </>
    );
  }

  const currentImage = listing.images[currentImageIndex] || listing.images[0];

  const handleRequestVisit = async () => {
    if (!user || user.role !== "TENANT") {
      router.push("/auth/signin");
      return;
    }

    if (!listing || !listing.id) {
      setVisitRequestError("Impossible de trouver l'annonce");
      return;
    }

    setIsRequestingVisit(true);
    setVisitRequestError(null);
    setVisitRequestSuccess(false);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
      setIsRequestingVisit(false);
      setVisitRequestError(
        "La requête a pris trop de temps. Veuillez réessayer."
      );
    }, 10000);

    try {
      const response = await fetch("/api/visit-requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          listingId: listing.id,
          preferredDate: visitDate || undefined,
          preferredTime: visitTime,
          message: visitMessage || undefined,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      let data;
      try {
        data = await response.json();
      } catch (parseError) {
        clearTimeout(timeoutId);
        console.error("[Visit Request] Parse error:", parseError);
        setVisitRequestError("Une erreur est survenue. Veuillez réessayer.");
        setIsRequestingVisit(false);
        return;
      }

      if (!response.ok) {
        let errorMessage =
          data.error ||
          data.message ||
          "Erreur lors de l'envoi de la demande de visite";

        if (data.details) {
          if (typeof data.details === "string") {
            errorMessage = data.details;
          } else if (data.details.message) {
            errorMessage = data.details.message;
          } else if (Array.isArray(data.details)) {
            errorMessage = data.details
              .map((d: any) => d.message || JSON.stringify(d))
              .join(", ");
          }
        }

        clearTimeout(timeoutId);
        setVisitRequestError(errorMessage);
        setIsRequestingVisit(false);
        return;
      }

      clearTimeout(timeoutId);
      setVisitRequestSuccess(true);
      setIsRequestingVisit(false);
      setShowVisitModal(false);
      setVisitDate("");
      setVisitTime("flexible");
      setVisitMessage("");
      setTimeout(() => {
        setVisitRequestSuccess(false);
      }, 5000);
    } catch (err) {
      clearTimeout(timeoutId);
      console.error("[Visit Request] Exception:", err);
      let errorMessage = "Une erreur est survenue. Veuillez réessayer.";

      if (err instanceof Error) {
        if (err.name === "AbortError") {
          errorMessage =
            "La requête a pris trop de temps. Veuillez réessayer.";
        } else {
          errorMessage = err.message;
        }
      }

      setVisitRequestError(errorMessage);
      setIsRequestingVisit(false);
    }
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <Link href="/listings">
            <Button variant="ghost" className="mb-6">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour aux listings
            </Button>
          </Link>

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Card className="overflow-hidden border-2">
                <div
                  className="relative h-96 w-full bg-gray-200 cursor-zoom-in"
                  onClick={() =>
                    listing.images.length > 0 && setIsLightboxOpen(true)
                  }
                >
                  {currentImage && (
                    <Image
                      src={currentImage}
                      alt={listing.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 66vw"
                      quality={90}
                    />
                  )}
                  {listing.images.length > 1 && !isLightboxOpen && (
                    <>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setCurrentImageIndex((prev) =>
                            prev === 0 ? listing.images.length - 1 : prev - 1
                          );
                        }}
                        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/95 hover:bg-white rounded-full p-2 shadow-lg transition-all flex items-center justify-center"
                        aria-label="Image précédente"
                      >
                        <ChevronLeft className="h-5 w-5 text-gray-800" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setCurrentImageIndex((prev) =>
                            prev === listing.images.length - 1 ? 0 : prev + 1
                          );
                        }}
                        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/95 hover:bg-white rounded-full p-2 shadow-lg transition-all flex items-center justify-center"
                        aria-label="Image suivante"
                      >
                        <ChevronRight className="h-5 w-5 text-gray-800" />
                      </button>
                      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 text-white px-4 py-2 rounded-full text-sm">
                        {currentImageIndex + 1} / {listing.images.length}
                      </div>
                    </>
                  )}
                </div>
                {listing.images.length > 1 && (
                  <div className="p-4 bg-white">
                    <div className="flex gap-2 overflow-x-auto">
                      {listing.images.map((img, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentImageIndex(index)}
                          className={`relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all ${
                            index === currentImageIndex
                              ? "border-violet-600 scale-105"
                              : "border-gray-200 hover:border-violet-300"
                          }`}
                        >
                          <Image
                            src={img}
                            alt={`${listing.title} - Image ${index + 1}`}
                            fill
                            className="object-cover"
                            sizes="80px"
                            quality={90}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </Card>

              {(listing.model3dUrl ||
                listing.matterportUrl ||
                listing.sketchfabUrl ||
                listing.panoramaUrl) && (
                <Card className="border-2">
                  <CardHeader>
                    <CardTitle>Modèle 3D / Visite virtuelle</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="relative w-full h-96 bg-gray-200 rounded-xl overflow-hidden">
                      <iframe
                        src={
                          listing.matterportUrl ||
                          listing.model3dUrl ||
                          listing.sketchfabUrl ||
                          listing.panoramaUrl ||
                          ""
                        }
                        className="w-full h-full border-0"
                        allow="fullscreen; xr-spatial-tracking; vr"
                        allowFullScreen
                        loading="lazy"
                        title={`Modèle 3D - ${listing.title}`}
                      />
                    </div>
                    <p className="mt-2 text-xs text-gray-500">
                      Tour 3D intégrée à partir du lien fourni par le
                      propriétaire (Matterport, Sketchfab ou autre).
                    </p>
                  </CardContent>
                </Card>
              )}

              <Card className="border-2">
                <CardHeader>
                  <CardTitle>Description</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 leading-relaxed">
                    {listing.description || "Aucune description disponible."}
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2">
                <CardHeader>
                  <CardTitle>Caractéristiques</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="flex items-center gap-3">
                      <Bed className="h-5 w-5 text-violet-600" />
                      <span className="text-gray-700">
                        <strong>{listing.bedrooms}</strong> chambre
                        {listing.bedrooms > 1 ? "s" : ""}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Bath className="h-5 w-5 text-violet-600" />
                      <span className="text-gray-700">
                        <strong>{listing.bathrooms}</strong> salle
                        {listing.bathrooms > 1 ? "s" : ""} de bain
                      </span>
                    </div>
                    {listing.furnished && (
                      <div className="flex items-center gap-3">
                        <Home className="h-5 w-5 text-violet-600" />
                        <span className="text-gray-700">Meublé</span>
                      </div>
                    )}
                    {listing.petAllowed && (
                      <div className="flex items-center gap-3">
                        <Dog className="h-5 w-5 text-violet-600" />
                        <span className="text-gray-700">Animaux acceptés</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {(listing.wifiIncluded ||
                listing.heatingIncluded ||
                listing.hotWaterIncluded ||
                listing.electricityIncluded ||
                listing.parkingIncluded) && (
                <Card className="border-2">
                  <CardHeader>
                    <CardTitle>Utilités incluses</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {listing.wifiIncluded && (
                        <div className="flex items-center gap-2">
                          <Wifi className="h-5 w-5 text-violet-600" />
                          <span className="text-gray-700">WiFi</span>
                        </div>
                      )}
                      {listing.heatingIncluded && (
                        <div className="flex items-center gap-2">
                          <Flame className="h-5 w-5 text-violet-600" />
                          <span className="text-gray-700">Chauffage</span>
                        </div>
                      )}
                      {listing.hotWaterIncluded && (
                        <div className="flex items-center gap-2">
                          <Droplet className="h-5 w-5 text-violet-600" />
                          <span className="text-gray-700">Eau chaude</span>
                        </div>
                      )}
                      {listing.electricityIncluded && (
                        <div className="flex items-center gap-2">
                          <Zap className="h-5 w-5 text-violet-600" />
                          <span className="text-gray-700">Électricité</span>
                        </div>
                      )}
                      {listing.parkingIncluded && (
                        <div className="flex items-center gap-2">
                          <Car className="h-5 w-5 text-violet-600" />
                          <span className="text-gray-700">Parking</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              <Card className="border-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-violet-600" />
                    Visites disponibles
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoadingSlots ? (
                    <div className="text-center py-8 text-gray-500">
                      Chargement des créneaux...
                    </div>
                  ) : availableSlots.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">
                      Aucun créneau disponible pour le moment
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {bookingSuccess && (
                        <div className="p-3 bg-green-50 border border-green-200 rounded-lg mb-3">
                          <div className="flex items-center gap-2 text-green-700">
                            <CheckCircle className="h-4 w-4" />
                            <span className="text-sm font-medium">
                              {bookingSuccess}
                            </span>
                          </div>
                        </div>
                      )}
                      {bookingError && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg mb-3">
                          <div className="flex items-center gap-2 text-red-700">
                            <AlertCircle className="h-4 w-4" />
                            <span className="text-sm font-medium">
                              {bookingError}
                            </span>
                          </div>
                        </div>
                      )}
                      {availableSlots.map((slot) => (
                        <div
                          key={slot.id}
                          className="p-4 rounded-lg border-2 border-gray-200 bg-white hover:border-violet-300 transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <Clock className="h-5 w-5 text-violet-600" />
                              <div>
                                <div className="font-semibold text-gray-900">
                                  {format(
                                    new Date(slot.startAt),
                                    "d MMM yyyy"
                                  )}
                                </div>
                                <div className="text-sm text-gray-600">
                                  {format(
                                    new Date(slot.startAt),
                                    "HH:mm"
                                  )}{" "}
                                  -{" "}
                                  {format(
                                    new Date(slot.endAt),
                                    "HH:mm"
                                  )}
                                </div>
                              </div>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-violet-600 hover:text-violet-700 hover:bg-violet-50"
                              onClick={async () => {
                                if (!user) {
                                  router.push("/auth/signin");
                                  return;
                                }

                                try {
                                  setIsBookingSlot(slot.id);
                                  setBookingError(null);
                                  setBookingSuccess(null);

                                  const response = await fetch(
                                    "/api/appointments",
                                    {
                                      method: "POST",
                                      headers: {
                                        "Content-Type":
                                          "application/json",
                                      },
                                      body: JSON.stringify({
                                        listingId: listing.id,
                                        slotId: slot.id,
                                      }),
                                    }
                                  );

                                  const data = await response.json();

                                  if (!response.ok) {
                                    throw new Error(
                                      data.error ||
                                        "Erreur lors de la réservation"
                                    );
                                  }

                                  setBookingSuccess(
                                    "Visite réservée avec succès !"
                                  );
                                  fetchAvailableSlots();
                                } catch (err: any) {
                                  setBookingError(
                                    err.message ||
                                      "Erreur lors de la réservation"
                                  );
                                } finally {
                                  setIsBookingSlot(null);
                                }
                              }}
                              disabled={isBookingSlot === slot.id}
                            >
                              {isBookingSlot === slot.id
                                ? "Réservation..."
                                : "Réserver cette visite"}
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="border-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-violet-600" />
                    Localisation
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <ListingMap
                    city={listing.city}
                    area={listing.area || ""}
                    title={listing.title}
                    latitude={listing.latitude}
                    longitude={listing.longitude}
                  />
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card className="border-2 sticky top-24">
                <CardHeader className="bg-gradient-to-r from-violet-600 to-purple-600 text-white">
                  <CardTitle className="text-white flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    {listing.price.toLocaleString("fr-CA")} $ / mois
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center gap-2 text-gray-600">
                    <MapPin className="h-4 w-4 text-violet-600" />
                    <span className="text-sm font-medium">
                      {listing.address ? (
                        <>
                          {listing.address}
                          {listing.area && `, ${listing.area}`}
                          {listing.city && `, ${listing.city}`}
                        </>
                      ) : (
                        <>
                          {listing.area
                            ? `${listing.area}, `
                            : ""}
                          {listing.city}
                        </>
                      )}
                    </span>
                  </div>
                  {listing.postalCode && (
                    <div className="flex items-center gap-2 text-gray-500 text-xs">
                      <MapPin className="h-3 w-3 text-violet-500" />
                      <span>Code postal: {listing.postalCode}</span>
                    </div>
                  )}

                  {listing.landlordName && listing.landlordId && (
                    <Link href={`/landlord/${listing.landlordId}`}>
                      <div className="flex items-center gap-2 text-gray-600 pt-2 border-t border-gray-200 hover:text-violet-600 transition-colors cursor-pointer group">
                        <User className="h-4 w-4 text-violet-600" />
                        <span className="text-sm font-medium group-hover:underline">
                          Propriétaire: {listing.landlordName}
                        </span>
                      </div>
                    </Link>
                  )}

                  {listing.minTerm && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar className="h-4 w-4 text-violet-600" />
                      <span className="text-sm">
                        Durée: {listing.minTerm} -{" "}
                        {listing.maxTerm || "∞"} mois
                      </span>
                    </div>
                  )}

                  <div className="pt-4 border-t space-y-3">
                    {!user ? (
                      <Link href="/auth/signin" className="block">
                        <Button
                          variant="outline"
                          className="w-full border-2 border-violet-600 text-violet-600 hover:bg-violet-50"
                          size="lg"
                        >
                          <CalendarCheck className="h-4 w-4 mr-2" />
                          Demander une visite
                        </Button>
                      </Link>
                    ) : user.role !== "TENANT" ? (
                      <Button
                        variant="outline"
                        className="w-full border-2 border-gray-300 text-gray-400 cursor-not-allowed"
                        size="lg"
                        disabled
                      >
                        <CalendarCheck className="h-4 w-4 mr-2" />
                        Demander une visite
                      </Button>
                    ) : visitRequestSuccess ? (
                      <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center gap-2 text-green-700">
                          <CheckCircle className="h-5 w-5" />
                          <span className="font-semibold text-sm">
                            Demande de visite envoyée !
                          </span>
                        </div>
                      </div>
                    ) : (
                      <>
                        <Button
                          variant="outline"
                          className="w-full border-2 border-violet-600 text-violet-600 hover:bg-violet-50"
                          size="lg"
                          onClick={() => setShowVisitModal(true)}
                          disabled={
                            isRequestingVisit || !listing || !listing.id
                          }
                        >
                          <CalendarCheck className="h-4 w-4 mr-2" />
                          {isRequestingVisit
                            ? "Envoi..."
                            : "Demander une visite"}
                        </Button>
                        {visitRequestError && (
                          <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-red-700">
                              {visitRequestError}
                            </p>
                          </div>
                        )}
                      </>
                    )}

                    {!user ? (
                      <Link href="/auth/signin" className="block">
                        <Button
                          className="w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white"
                          size="lg"
                        >
                          Envoyer un message
                        </Button>
                      </Link>
                    ) : user.role !== "TENANT" ? (
                      <Button
                        className="w-full bg-gray-400 cursor-not-allowed"
                        size="lg"
                        disabled
                      >
                        Envoyer un message
                      </Button>
                    ) : (
                      <div className="space-y-3">
                        <textarea
                          value={contactMessage}
                          onChange={(e) =>
                            setContactMessage(e.target.value)
                          }
                          placeholder="Écrivez un message au propriétaire..."
                          className="w-full min-h-[80px] rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 resize-vertical"
                        />
                        <Button
                          className="w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white"
                          size="lg"
                          disabled={
                            isSendingMessage || !contactMessage.trim()
                          }
                          onClick={async () => {
                            if (!contactMessage.trim()) return;
                            try {
                              setIsSendingMessage(true);
                              setContactError(null);
                              setContactSuccess(null);

                              const res = await fetch(
                                `/api/listings/${listing.id}/messages`,
                                {
                                  method: "POST",
                                  headers: {
                                    "Content-Type":
                                      "application/json",
                                  },
                                  body: JSON.stringify({
                                    message: contactMessage,
                                  }),
                                }
                              );

                              const data = await res.json();
                              if (!res.ok) {
                                throw new Error(
                                  data.error ||
                                    "Erreur lors de l'envoi du message"
                                );
                              }

                              setContactSuccess(
                                "Message envoyé au propriétaire."
                              );
                              setContactMessage("");
                            } catch (err: any) {
                              setContactError(
                                err.message ||
                                  "Erreur lors de l'envoi du message"
                              );
                            } finally {
                              setIsSendingMessage(false);
                            }
                          }}
                        >
                          {isSendingMessage
                            ? "Envoi..."
                            : "Envoyer un message"}
                        </Button>
                        {contactSuccess && (
                          <div className="p-3 bg-green-50 border border-green-200 rounded-lg flex items-start gap-2">
                            <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-green-700">
                              {contactSuccess}
                            </p>
                          </div>
                        )}
                        {contactError && (
                          <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-red-700">
                              {contactError}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {showVisitModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4">
                      <Card className="max-w-md w-full">
                        <CardHeader>
                          <CardTitle>Demander une visite</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Date préférée
                            </label>
                            <input
                              type="date"
                              value={visitDate}
                              onChange={(e) =>
                                setVisitDate(e.target.value)
                              }
                              min={new Date()
                                .toISOString()
                                .split("T")[0]}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Heure préférée
                            </label>
                            <select
                              value={visitTime}
                              onChange={(e) =>
                                setVisitTime(
                                  e.target
                                    .value as
                                    | "morning"
                                    | "afternoon"
                                    | "evening"
                                    | "flexible"
                                )
                              }
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                            >
                              <option value="flexible">
                                Flexible
                              </option>
                              <option value="morning">
                                Matin (9h-12h)
                              </option>
                              <option value="afternoon">
                                Après-midi (13h-17h)
                              </option>
                              <option value="evening">
                                Soir (18h-20h)
                              </option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Message (optionnel)
                            </label>
                            <textarea
                              value={visitMessage}
                              onChange={(e) =>
                                setVisitMessage(e.target.value)
                              }
                              placeholder="Ajoutez un message pour le propriétaire..."
                              rows={3}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                            />
                          </div>

                          <div className="flex gap-3">
                            <Button
                              className="flex-1"
                              onClick={handleRequestVisit}
                              disabled={isRequestingVisit}
                            >
                              {isRequestingVisit
                                ? "Envoi..."
                                : "Envoyer la demande"}
                            </Button>
                            <Button
                              variant="outline"
                              className="flex-1"
                              onClick={() => {
                                setShowVisitModal(false);
                                setVisitDate("");
                                setVisitTime("flexible");
                                setVisitMessage("");
                              }}
                              disabled={isRequestingVisit}
                            >
                              Annuler
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="border-2">
                <CardContent className="p-4">
                  <div className="flex flex-wrap gap-2">
                    {listing.furnished && (
                      <Badge className="bg-violet-100 text-violet-800 border-violet-300">
                        Meublé
                      </Badge>
                    )}
                    {listing.petAllowed && (
                      <Badge className="bg-green-100 text-green-800 border-green-300">
                        Animaux acceptés
                      </Badge>
                    )}
                    {listing.wifiIncluded && (
                      <Badge className="bg-blue-100 text-blue-800 border-blue-300">
                        WiFi inclus
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {isLightboxOpen && listing.images.length > 0 && (
            <div
              className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
              onClick={() => setIsLightboxOpen(false)}
            >
              <button
                className="absolute top-6 right-6 bg-white/90 hover:bg-white rounded-full p-2 shadow-lg transition-all flex items-center justify-center"
                aria-label="Fermer la vue plein écran"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsLightboxOpen(false);
                }}
              >
                <X className="h-5 w-5 text-gray-800" />
              </button>

              {listing.images.length > 1 && (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentImageIndex((prev) =>
                        prev === 0 ? listing.images.length - 1 : prev - 1
                      );
                    }}
                    className="absolute left-6 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-3 shadow-lg transition-all flex items-center justify-center"
                    aria-label="Image précédente"
                  >
                    <ChevronLeft className="h-6 w-6 text-gray-800" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentImageIndex((prev) =>
                        prev === listing.images.length - 1 ? 0 : prev + 1
                      );
                    }}
                    className="absolute right-6 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-3 shadow-lg transition-all flex items-center justify-center"
                    aria-label="Image suivante"
                  >
                    <ChevronRight className="h-6 w-6 text-gray-800" />
                  </button>
                </>
              )}

              <div
                className="relative w-[95vw] max-w-5xl h-[70vh] max-h-[80vh]"
                onClick={(e) => e.stopPropagation()}
              >
                <Image
                  src={listing.images[currentImageIndex]}
                  alt={`${listing.title} - plein écran`}
                  fill
                  className="object-contain"
                  sizes="(max-width: 1024px) 100vw, 80vw"
                  quality={95}
                />
                {listing.images.length > 1 && (
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 text-white px-4 py-1 rounded-full text-xs">
                    {currentImageIndex + 1} / {listing.images.length}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  );
}

