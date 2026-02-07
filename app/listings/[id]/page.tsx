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
import { fr } from "date-fns/locale";

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
  const [availableSlots, setAvailableSlots] = useState<
    Array<{ id: string; startAt: string; endAt: string }>
  >([]);
  const [timeSlotsByDate, setTimeSlotsByDate] = useState<Record<string, Array<{
    id: string;
    time: string;
    datetime: string;
    isAvailable: boolean;
    isBooked: boolean;
  }>>>({});
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [isBookingSlot, setIsBookingSlot] = useState<string | null>(null);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [bookingSuccess, setBookingSuccess] = useState<string | null>(null);
  
  // État pour proposer un créneau personnalisé
  const [showProposeModal, setShowProposeModal] = useState(false);
  const [proposedDate, setProposedDate] = useState("");
  const [proposedStartTime, setProposedStartTime] = useState("09:00");
  const [proposedEndTime, setProposedEndTime] = useState("09:30");
  const [proposedMessage, setProposedMessage] = useState("");
  const [isProposing, setIsProposing] = useState(false);
  const [showReservationModal, setShowReservationModal] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [contactMessage, setContactMessage] = useState("");
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [contactError, setContactError] = useState<string | null>(null);
  const [contactSuccess, setContactSuccess] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    let hasLoaded = false;
    
    const loadData = async () => {
      if (isMounted && !hasLoaded) {
        hasLoaded = true;
        await fetchListing();
        await fetchAvailableSlots();
      }
    };
    
    loadData();
    
    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listingId]);

  const fetchAvailableSlots = async () => {
    if (!listingId) return;
    
    try {
      setIsLoadingSlots(true);
      const response = await fetch(`/api/listings/${listingId}/time-slots`, {
        cache: "no-store",
      });

      if (response.ok) {
        const data = await response.json();
        setTimeSlotsByDate(data.slotsByDate || {});
        setAvailableDates(data.dates || []);
        
        // Sélectionner automatiquement la première date disponible
        if (data.dates && data.dates.length > 0 && !selectedDate) {
          setSelectedDate(data.dates[0]);
        }
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
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-neutral-900 mx-auto mb-4" />
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
            <div className="lg:col-span-2 space-y-6 relative z-20">
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
                      unoptimized={currentImage?.startsWith('/uploads/')}
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
                              ? "border-neutral-900 scale-105"
                              : "border-neutral-200 hover:border-neutral-400"
                          }`}
                        >
                          <Image
                            src={img}
                            alt={`${listing.title} - Image ${index + 1}`}
                            fill
                            className="object-cover"
                            sizes="80px"
                            quality={90}
                            unoptimized={img?.startsWith('/uploads/')}
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
                      <Bed className="h-5 w-5 text-neutral-600" />
                      <span className="text-gray-700">
                        <strong>{listing.bedrooms}</strong> chambre
                        {listing.bedrooms > 1 ? "s" : ""}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Bath className="h-5 w-5 text-neutral-600" />
                      <span className="text-gray-700">
                        <strong>{listing.bathrooms}</strong> salle
                        {listing.bathrooms > 1 ? "s" : ""} de bain
                      </span>
                    </div>
                    {listing.furnished && (
                      <div className="flex items-center gap-3">
                        <Home className="h-5 w-5 text-neutral-600" />
                        <span className="text-gray-700">Meublé</span>
                      </div>
                    )}
                    {listing.petAllowed && (
                      <div className="flex items-center gap-3">
                        <Dog className="h-5 w-5 text-neutral-600" />
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
                          <Wifi className="h-5 w-5 text-neutral-600" />
                          <span className="text-gray-700">WiFi</span>
                        </div>
                      )}
                      {listing.heatingIncluded && (
                        <div className="flex items-center gap-2">
                          <Flame className="h-5 w-5 text-neutral-600" />
                          <span className="text-gray-700">Chauffage</span>
                        </div>
                      )}
                      {listing.hotWaterIncluded && (
                        <div className="flex items-center gap-2">
                          <Droplet className="h-5 w-5 text-neutral-600" />
                          <span className="text-gray-700">Eau chaude</span>
                        </div>
                      )}
                      {listing.electricityIncluded && (
                        <div className="flex items-center gap-2">
                          <Zap className="h-5 w-5 text-neutral-600" />
                          <span className="text-gray-700">Électricité</span>
                        </div>
                      )}
                      {listing.parkingIncluded && (
                        <div className="flex items-center gap-2">
                          <Car className="h-5 w-5 text-neutral-600" />
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
                    <MapPin className="h-5 w-5 text-neutral-600" />
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
              <Card className="border-2 sticky top-24 z-0">
                <CardHeader className="bg-neutral-900 text-white">
                  <CardTitle className="text-white flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    {listing.price.toLocaleString("fr-CA")} $ / mois
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center gap-2 text-gray-600">
                    <MapPin className="h-4 w-4 text-neutral-600" />
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
                      <MapPin className="h-3 w-3 text-neutral-600" />
                      <span>Code postal: {listing.postalCode}</span>
                    </div>
                  )}

                  {listing.landlordName && listing.landlordId && (
                    <Link href={`/landlord/${listing.landlordId}`}>
                      <div className="flex items-center gap-2 text-neutral-600 pt-2 border-t border-neutral-200 hover:text-neutral-900 transition-colors cursor-pointer group">
                        <User className="h-4 w-4 text-neutral-600" />
                        <span className="text-sm font-medium group-hover:underline">
                          Propriétaire: {listing.landlordName}
                        </span>
                      </div>
                    </Link>
                  )}

                  {listing.minTerm && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar className="h-4 w-4 text-neutral-600" />
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
                          className="w-full border-2 border-neutral-900 text-neutral-900 hover:bg-neutral-50"
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
                    ) : (
                      <Button
                        variant="outline"
                        className="w-full border-2 border-neutral-900 text-neutral-900 hover:bg-neutral-50"
                        size="lg"
                        onClick={() => {
                          if (!user) {
                            router.push("/auth/signin");
                            return;
                          }
                          setShowReservationModal(true);
                          fetchAvailableSlots();
                        }}
                      >
                        <CalendarCheck className="h-4 w-4 mr-2" />
                        Réserver une visite
                      </Button>
                    )}

                    {!user ? (
                      <Link href="/auth/signin" className="block">
                        <Button
                          className="w-full bg-neutral-900 hover:bg-neutral-800 text-white"
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
                          className="w-full min-h-[80px] rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-neutral-900 resize-vertical"
                        />
                        <Button
                          className="w-full bg-neutral-900 hover:bg-neutral-800 text-white"
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

                </CardContent>
              </Card>

              <Card className="border-2">
                <CardContent className="p-4">
                  <div className="flex flex-wrap gap-2">
                    {listing.furnished && (
                      <Badge className="bg-neutral-100 text-neutral-800 border-neutral-300">
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
                  unoptimized={listing.images[currentImageIndex]?.startsWith('/uploads/')}
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

      {/* Modal pour réserver une visite */}
      {showReservationModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4 overflow-y-auto">
          <Card className="max-w-2xl w-full my-8">
            <CardHeader className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Réserver une visite
              </CardTitle>
              <button
                onClick={() => {
                  setShowReservationModal(false);
                  setSelectedDate("");
                  setSelectedTimeSlot(null);
                  setBookingError(null);
                  setBookingSuccess(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </CardHeader>
            <CardContent>
              {isLoadingSlots ? (
                <div className="text-center py-8 text-gray-500">
                  Chargement des créneaux...
                </div>
              ) : availableDates.length === 0 ? (
                <div className="text-center py-8 space-y-4">
                  <p className="text-gray-500">
                    Aucun créneau disponible pour le moment
                  </p>
                  <Button
                    onClick={() => {
                      if (!user) {
                        router.push("/auth/signin");
                        return;
                      }
                      setShowProposeModal(true);
                      const today = new Date();
                      setProposedDate(today.toISOString().split('T')[0]);
                    }}
                    variant="outline"
                    className="mt-4"
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    Proposer un créneau
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  {bookingSuccess && (
                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center gap-2 text-green-700">
                        <CheckCircle className="h-4 w-4" />
                        <span className="text-sm font-medium">
                          {bookingSuccess}
                        </span>
                      </div>
                    </div>
                  )}
                  {bookingError && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-center gap-2 text-red-700">
                        <AlertCircle className="h-4 w-4" />
                        <span className="text-sm font-medium">
                          {bookingError}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Sélection de la date - Calendrier mensuel */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Choisir une date
                    </label>
                    
                    {/* Navigation du calendrier */}
                    <div className="flex items-center justify-between mb-3">
                      <button
                        onClick={() => {
                          const prevMonth = new Date(currentMonth);
                          prevMonth.setMonth(prevMonth.getMonth() - 1);
                          setCurrentMonth(prevMonth);
                        }}
                        className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
                      >
                        <ChevronLeft className="h-5 w-5 text-neutral-600" />
                      </button>
                      <h3 className="text-base font-semibold text-neutral-900">
                        {format(currentMonth, "MMMM yyyy", { locale: fr })}
                      </h3>
                      <button
                        onClick={() => {
                          const nextMonth = new Date(currentMonth);
                          nextMonth.setMonth(nextMonth.getMonth() + 1);
                          setCurrentMonth(nextMonth);
                        }}
                        className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
                      >
                        <ChevronRight className="h-5 w-5 text-neutral-600" />
                      </button>
                    </div>

                    {/* En-têtes des jours */}
                    <div className="grid grid-cols-7 gap-1 mb-1">
                      {["L", "M", "M", "J", "V", "S", "D"].map((day, index) => (
                        <div key={index} className="text-center text-xs font-medium text-neutral-500 py-1">
                          {day}
                        </div>
                      ))}
                    </div>

                    {/* Grille du calendrier */}
                    <div className="grid grid-cols-7 gap-1">
                      {(() => {
                        const year = currentMonth.getFullYear();
                        const month = currentMonth.getMonth();
                        const firstDay = new Date(year, month, 1);
                        const lastDay = new Date(year, month + 1, 0);
                        const daysInMonth = lastDay.getDate();
                        const startingDayOfWeek = firstDay.getDay();
                        const days = [];
                        
                        // Jours du mois précédent (pour remplir la première semaine)
                        const prevMonth = new Date(year, month - 1, 0);
                        const daysInPrevMonth = prevMonth.getDate();
                        for (let i = startingDayOfWeek - 1; i >= 0; i--) {
                          const date = new Date(year, month - 1, daysInPrevMonth - i);
                          days.push({ date, isCurrentMonth: false, dateString: date.toISOString().split('T')[0] });
                        }
                        
                        // Jours du mois actuel
                        for (let day = 1; day <= daysInMonth; day++) {
                          const date = new Date(year, month, day);
                          days.push({ date, isCurrentMonth: true, dateString: date.toISOString().split('T')[0] });
                        }
                        
                        // Jours du mois suivant (pour compléter la dernière semaine)
                        const remainingDays = 42 - days.length; // 6 semaines * 7 jours
                        for (let day = 1; day <= remainingDays; day++) {
                          const date = new Date(year, month + 1, day);
                          days.push({ date, isCurrentMonth: false, dateString: date.toISOString().split('T')[0] });
                        }
                        
                        return days.map(({ date, isCurrentMonth, dateString }) => {
                          const isAvailable = availableDates.includes(dateString);
                          const isSelected = selectedDate === dateString;
                          const isToday = dateString === new Date().toISOString().split('T')[0];
                          const today = new Date();
                          today.setHours(0, 0, 0, 0);
                          const isPast = new Date(dateString) < today;
                          
                          return (
                            <button
                              key={dateString}
                              onClick={() => {
                                if (isAvailable && !isPast) {
                                  setSelectedDate(dateString);
                                  setSelectedTimeSlot(null);
                                }
                              }}
                              disabled={!isAvailable || isPast}
                              className={`aspect-square p-1 rounded-lg text-sm transition-all ${
                                !isCurrentMonth
                                  ? "text-neutral-300"
                                  : isSelected
                                  ? "bg-neutral-900 text-white font-semibold"
                                  : isToday
                                  ? "bg-neutral-100 text-neutral-900 font-semibold border-2 border-neutral-300"
                                  : isAvailable && !isPast
                                  ? "text-neutral-700 hover:bg-neutral-100 border border-neutral-200"
                                  : "text-neutral-300 cursor-not-allowed"
                              }`}
                            >
                              {date.getDate()}
                            </button>
                          );
                        });
                      })()}
                    </div>
                  </div>

                  {/* Sélection de l'heure */}
                  {selectedDate && timeSlotsByDate[selectedDate] && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Choisir une heure
                      </label>
                      <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
                        {timeSlotsByDate[selectedDate]
                          .filter((slot) => slot.isAvailable)
                          .map((slot) => {
                            const isSelected = selectedTimeSlot === slot.id;
                            const isBooking = isBookingSlot === slot.id;
                            
                            return (
                              <button
                                key={slot.id}
                                onClick={async () => {
                                  if (!user) {
                                    router.push("/auth/signin");
                                    return;
                                  }

                                  if (isSelected) {
                                    // Réserver le créneau
                                    try {
                                      setIsBookingSlot(slot.id);
                                      setBookingError(null);
                                      setBookingSuccess(null);

                                      const appointmentResponse = await fetch(
                                        "/api/appointments",
                                        {
                                          method: "POST",
                                          headers: {
                                            "Content-Type": "application/json",
                                          },
                                          body: JSON.stringify({
                                            datetime: slot.datetime,
                                          }),
                                        }
                                      );

                                      const appointmentData = await appointmentResponse.json();

                                      if (!appointmentResponse.ok) {
                                        throw new Error(
                                          appointmentData.error ||
                                            "Erreur lors de la réservation"
                                        );
                                      }

                                      const slotDateTime = new Date(slot.datetime);
                                      setBookingSuccess(
                                        `Visite réservée le ${format(slotDateTime, "d MMMM yyyy à HH:mm", { locale: fr })} !`
                                      );
                                      setSelectedTimeSlot(null);
                                      fetchAvailableSlots();
                                      
                                      // Fermer le modal après 2 secondes
                                      setTimeout(() => {
                                        setShowReservationModal(false);
                                        setSelectedDate("");
                                        setSelectedTimeSlot(null);
                                        setBookingError(null);
                                        setBookingSuccess(null);
                                      }, 2000);
                                    } catch (err: any) {
                                      setBookingError(
                                        err.message ||
                                          "Erreur lors de la réservation"
                                      );
                                    } finally {
                                      setIsBookingSlot(null);
                                    }
                                  } else {
                                    // Sélectionner le créneau
                                    setSelectedTimeSlot(slot.id);
                                    setBookingError(null);
                                  }
                                }}
                                disabled={isBooking}
                                className={`px-4 py-3 rounded-xl border-2 text-sm font-medium transition-all ${
                                  isSelected
                                    ? "border-neutral-900 bg-neutral-900 text-white"
                                    : isBooking
                                    ? "border-neutral-200 bg-neutral-100 text-neutral-400 cursor-not-allowed"
                                    : "border-neutral-200 bg-white text-neutral-700 hover:border-neutral-400 hover:bg-neutral-50"
                                }`}
                              >
                                {isBooking ? "..." : slot.time}
                              </button>
                            );
                          })}
                      </div>
                      {timeSlotsByDate[selectedDate].filter((slot) => slot.isAvailable).length === 0 && (
                        <div className="text-center py-4 space-y-3">
                          <p className="text-sm text-gray-500">
                            Aucun créneau disponible pour cette date
                          </p>
                          <Button
                            onClick={() => {
                              if (!user) {
                                router.push("/auth/signin");
                                return;
                              }
                              setShowProposeModal(true);
                              setProposedDate(selectedDate);
                            }}
                            variant="outline"
                            size="sm"
                          >
                            <Calendar className="h-4 w-4 mr-2" />
                            Proposer un créneau
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* Bouton pour proposer un créneau */}
                  <div className="pt-4 border-t">
                    <Button
                      onClick={() => {
                        if (!user) {
                          router.push("/auth/signin");
                          return;
                        }
                        setShowProposeModal(true);
                        if (selectedDate) {
                          setProposedDate(selectedDate);
                        } else {
                          const today = new Date();
                          setProposedDate(today.toISOString().split('T')[0]);
                        }
                      }}
                      variant="outline"
                      className="w-full"
                    >
                      <Calendar className="h-4 w-4 mr-2" />
                      Proposer un autre créneau
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Modal pour proposer un créneau personnalisé */}
      {showProposeModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4">
          <Card className="max-w-md w-full">
            <CardHeader className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Proposer un créneau
              </CardTitle>
              <button
                onClick={() => setShowProposeModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date
                </label>
                <input
                  type="date"
                  value={proposedDate}
                  onChange={(e) => setProposedDate(e.target.value)}
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
                    value={proposedStartTime}
                    onChange={(e) => setProposedStartTime(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Heure de fin
                  </label>
                  <input
                    type="time"
                    value={proposedEndTime}
                    onChange={(e) => setProposedEndTime(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message (optionnel)
                </label>
                <textarea
                  value={proposedMessage}
                  onChange={(e) => setProposedMessage(e.target.value)}
                  placeholder="Ajoutez un message pour le propriétaire..."
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
                />
              </div>

              <div className="flex gap-3 pt-4 border-t">
                <Button
                  onClick={async () => {
                    if (!proposedDate || !proposedStartTime || !proposedEndTime) {
                      setBookingError("Veuillez remplir tous les champs");
                      return;
                    }

                    try {
                      setIsProposing(true);
                      setBookingError(null);
                      setBookingSuccess(null);

                      const response = await fetch("/api/appointments/propose", {
                        method: "POST",
                        headers: {
                          "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                          listingId,
                          proposedDate,
                          proposedStartTime,
                          proposedEndTime,
                          message: proposedMessage || null,
                        }),
                      });

                      const data = await response.json();

                      if (!response.ok) {
                        throw new Error(data.error || "Erreur lors de la proposition");
                      }

                      const slotDateTime = new Date(`${proposedDate}T${proposedStartTime}`);
                      setBookingSuccess(
                        `Créneau proposé le ${format(slotDateTime, "d MMMM yyyy à HH:mm", { locale: fr })} ! Le propriétaire vous confirmera.`
                      );
                      
                      setShowProposeModal(false);
                      setProposedDate("");
                      setProposedStartTime("09:00");
                      setProposedEndTime("09:30");
                      setProposedMessage("");
                      
                      fetchAvailableSlots();
                    } catch (err: any) {
                      setBookingError(err.message || "Erreur lors de la proposition");
                    } finally {
                      setIsProposing(false);
                    }
                  }}
                  disabled={isProposing || !proposedDate || !proposedStartTime || !proposedEndTime}
                  className="flex-1"
                >
                  {isProposing ? (
                    <>
                      <Clock className="h-4 w-4 mr-2 animate-spin" />
                      Envoi...
                    </>
                  ) : (
                    <>
                      <Calendar className="h-4 w-4 mr-2" />
                      Proposer ce créneau
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowProposeModal(false)}
                  disabled={isProposing}
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

