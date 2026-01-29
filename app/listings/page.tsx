"use client";

import Link from "next/link";
import Image from "next/image";
import { Navbar } from "@/components/navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Search, 
  MapPin, 
  Bed, 
  Bath, 
  Filter,
  X,
  DollarSign,
  Calendar,
  Dog,
  Wifi,
  Flame,
  Droplet,
  Zap,
  Car,
  MapIcon,
  List,
  User
} from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { ListingsMapView } from "@/components/listings-map-view";

interface Listing {
  id: string;
  title: string;
  price: number;
  city: string;
  area: string | null;
  bedrooms: number;
  bathrooms: number;
  furnished: boolean;
  petAllowed: boolean;
  minTerm: number;
  maxTerm: number | null;
  wifiIncluded: boolean;
  heatingIncluded: boolean;
  hotWaterIncluded: boolean;
  electricityIncluded: boolean;
  parkingIncluded?: boolean;
  images: string[];
  latitude?: number | null;
  longitude?: number | null;
  landlordId?: string;
  landlordName?: string;
}

export default function ListingsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<"list" | "map">("list");
  const [listings, setListings] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [filters, setFilters] = useState({
    minPrice: "",
    maxPrice: "",
    furnished: false,
    petAllowed: false,
    wifiIncluded: false,
    heatingIncluded: false,
    hotWaterIncluded: false,
    electricityIncluded: false,
    parkingIncluded: false,
    minTerm: "",
    maxTerm: "",
  });

  const fetchListings = useCallback(async () => {
    console.log('[Listings] fetchListings appelé');
    setIsLoading(true);
    setError(null);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      console.log('[Listings] Timeout déclenché');
      controller.abort();
    }, 8000);
    
    try {
      console.log('[Listings] Début du fetch');
      const response = await fetch(`/api/listings?t=${Date.now()}`, {
        cache: 'no-store',
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      console.log('[Listings] Réponse reçue:', response.status, response.ok);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.error || 
          (response.status === 504 ? "Le chargement prend trop de temps. Veuillez réessayer." : 
           response.status === 500 ? "Erreur serveur. Veuillez réessayer plus tard." :
           "Erreur lors du chargement des annonces");
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log('[Listings] Données parsées:', data);
      console.log('[Listings] Nombre d\'annonces:', data.listings?.length || 0);
      
      if (data.error && !data.listings) {
        throw new Error(data.error);
      }
      
      setListings(data.listings || []);
      console.log('[Listings] État mis à jour avec succès');
    } catch (err: any) {
      clearTimeout(timeoutId);
      console.error('[Listings] Erreur:', err.name, err.message);
      
      if (err.name === 'AbortError') {
        setError("Le chargement prend trop de temps. Veuillez réessayer.");
      } else {
        setError(err.message || "Erreur lors du chargement des annonces");
      }
      setListings([]);
    } finally {
      console.log('[Listings] setIsLoading(false)');
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    console.log('[Listings] useEffect initial - appel de fetchListings');
    fetchListings();
  }, [fetchListings]);

  // Rafraîchir les données quand la page redevient visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        console.log('[Listings] Page visible - rafraîchissement');
        fetchListings();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [fetchListings]);

  const filteredListings = listings.filter((listing) => {
    // Recherche textuelle (si searchTerm est vide, on accepte tout)
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = 
        listing.title.toLowerCase().includes(searchLower) ||
        (listing.city && listing.city.toLowerCase().includes(searchLower)) ||
        (listing.area && listing.area.toLowerCase().includes(searchLower));
      
      if (!matchesSearch) return false;
    }

    // Filtre prix
    if (filters.minPrice && listing.price < Number(filters.minPrice)) return false;
    if (filters.maxPrice && listing.price > Number(filters.maxPrice)) return false;

    // Filtre durée
    if (filters.minTerm && listing.minTerm && listing.minTerm < Number(filters.minTerm)) return false;
    if (filters.maxTerm && listing.maxTerm && listing.maxTerm > Number(filters.maxTerm)) return false;

    // Filtre meublé
    if (filters.furnished && !listing.furnished) return false;

    // Filtre animaux
    if (filters.petAllowed && !listing.petAllowed) return false;

    // Filtres utilités
    if (filters.wifiIncluded && !listing.wifiIncluded) return false;
    if (filters.heatingIncluded && !listing.heatingIncluded) return false;
    if (filters.hotWaterIncluded && !listing.hotWaterIncluded) return false;
    if (filters.electricityIncluded && !listing.electricityIncluded) return false;
    if (filters.parkingIncluded && !listing.parkingIncluded) return false;

    return true;
  });

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          {/* Search Bar */}
          <div className="max-w-3xl mx-auto mb-8">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-violet-400/40 via-indigo-400/40 to-purple-400/40 rounded-3xl blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative glass-premium rounded-3xl p-2">
                <div className="relative flex items-center">
                  <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 text-violet-600 h-6 w-6 z-10 group-focus-within:text-violet-700 transition-colors" />
                  <input
                    type="text"
                    placeholder="Rechercher par ville, quartier ou type..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-16 pr-6 py-6 rounded-3xl border-2 border-gray-200/50 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/20 focus:outline-none text-lg font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 bg-white/90 backdrop-blur-sm"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Filtres */}
          <div className="max-w-6xl mx-auto mb-8">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white border-2 border-gray-200 hover:border-primary text-gray-700 hover:text-primary font-medium transition-all mb-4 shadow-sm hover:shadow-md"
            >
              <Filter className="h-4 w-4" />
              {showFilters ? "Masquer les filtres" : "Afficher les filtres"}
              {showFilters ? (
                <X className="h-4 w-4" />
              ) : (
                <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                  {Object.values(filters).filter(v => v !== "" && v !== false).length}
                </span>
              )}
            </button>

            {showFilters && (
              <Card className="mb-6 border-2 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10 border-b">
                  <CardTitle className="flex items-center gap-2">
                    <Filter className="h-5 w-5 text-primary" />
                    Filtres de recherche
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-8">
                    {/* Prix et Durée */}
                    <div className="grid md:grid-cols-2 gap-6">
                      {/* Prix */}
                      <div className="space-y-3">
                        <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-primary" />
                          Prix mensuel
                        </label>
                        <div className="flex gap-3">
                          <div className="flex-1">
                            <input
                              type="number"
                              placeholder="Min ($)"
                              value={filters.minPrice}
                              onChange={(e) => setFilters({...filters, minPrice: e.target.value})}
                              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary focus:outline-none transition-colors bg-white"
                            />
                          </div>
                          <div className="flex items-center text-gray-400">—</div>
                          <div className="flex-1">
                            <input
                              type="number"
                              placeholder="Max ($)"
                              value={filters.maxPrice}
                              onChange={(e) => setFilters({...filters, maxPrice: e.target.value})}
                              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary focus:outline-none transition-colors bg-white"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Durée */}
                      <div className="space-y-3">
                        <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-primary" />
                          Durée du bail (mois)
                        </label>
                        <div className="flex gap-3">
                          <div className="flex-1">
                            <input
                              type="number"
                              placeholder="Min"
                              value={filters.minTerm}
                              onChange={(e) => setFilters({...filters, minTerm: e.target.value})}
                              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary focus:outline-none transition-colors bg-white"
                            />
                          </div>
                          <div className="flex items-center text-gray-400">—</div>
                          <div className="flex-1">
                            <input
                              type="number"
                              placeholder="Max"
                              value={filters.maxTerm}
                              onChange={(e) => setFilters({...filters, maxTerm: e.target.value})}
                              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary focus:outline-none transition-colors bg-white"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Caractéristiques */}
                    <div className="space-y-4">
                      <label className="text-sm font-semibold text-gray-700">Caractéristiques</label>
                      <div className="flex flex-wrap gap-3">
                        <label className="relative flex items-center cursor-pointer group">
                          <input
                            type="checkbox"
                            checked={filters.furnished}
                            onChange={(e) => setFilters({...filters, furnished: e.target.checked})}
                            className="sr-only peer"
                          />
                          <div className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 transition-all hover:border-primary/50 group ${
                            filters.furnished 
                              ? "border-primary bg-primary/10 text-primary" 
                              : "border-gray-200 bg-white text-gray-700"
                          }`}>
                            {filters.furnished && (
                              <div className="absolute -top-1 -right-1 bg-primary text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
                                ✓
                              </div>
                            )}
                            <span className="text-sm font-medium">Meublé</span>
                          </div>
                        </label>
                        <label className="relative flex items-center cursor-pointer group">
                          <input
                            type="checkbox"
                            checked={filters.petAllowed}
                            onChange={(e) => setFilters({...filters, petAllowed: e.target.checked})}
                            className="sr-only peer"
                          />
                          <div className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 transition-all hover:border-primary/50 group ${
                            filters.petAllowed 
                              ? "border-primary bg-primary/10 text-primary" 
                              : "border-gray-200 bg-white text-gray-700"
                          }`}>
                            {filters.petAllowed && (
                              <div className="absolute -top-1 -right-1 bg-primary text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
                                ✓
                              </div>
                            )}
                            <Dog className="h-4 w-4" />
                            <span className="text-sm font-medium">Animaux acceptés</span>
                          </div>
                        </label>
                      </div>
                    </div>

                    {/* Utilités */}
                    <div className="space-y-4">
                      <label className="text-sm font-semibold text-gray-700">Utilités incluses</label>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                        <label className="relative flex items-center cursor-pointer group">
                          <input
                            type="checkbox"
                            checked={filters.wifiIncluded}
                            onChange={(e) => setFilters({...filters, wifiIncluded: e.target.checked})}
                            className="sr-only peer"
                          />
                          <div className={`flex flex-col items-center gap-2 w-full px-4 py-3 rounded-xl border-2 transition-all hover:border-primary/50 group ${
                            filters.wifiIncluded 
                              ? "border-primary bg-primary/10 text-primary" 
                              : "border-gray-200 bg-white text-gray-700"
                          }`}>
                            {filters.wifiIncluded && (
                              <div className="absolute -top-1 -right-1 bg-primary text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
                                ✓
                              </div>
                            )}
                            <Wifi className="h-5 w-5" />
                            <span className="text-xs font-medium">WiFi</span>
                          </div>
                        </label>
                        <label className="relative flex items-center cursor-pointer group">
                          <input
                            type="checkbox"
                            checked={filters.heatingIncluded}
                            onChange={(e) => setFilters({...filters, heatingIncluded: e.target.checked})}
                            className="sr-only peer"
                          />
                          <div className={`flex flex-col items-center gap-2 w-full px-4 py-3 rounded-xl border-2 transition-all hover:border-primary/50 group ${
                            filters.heatingIncluded 
                              ? "border-primary bg-primary/10 text-primary" 
                              : "border-gray-200 bg-white text-gray-700"
                          }`}>
                            {filters.heatingIncluded && (
                              <div className="absolute -top-1 -right-1 bg-primary text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
                                ✓
                              </div>
                            )}
                            <Flame className="h-5 w-5" />
                            <span className="text-xs font-medium">Chauffage</span>
                          </div>
                        </label>
                        <label className="relative flex items-center cursor-pointer group">
                          <input
                            type="checkbox"
                            checked={filters.hotWaterIncluded}
                            onChange={(e) => setFilters({...filters, hotWaterIncluded: e.target.checked})}
                            className="sr-only peer"
                          />
                          <div className={`flex flex-col items-center gap-2 w-full px-4 py-3 rounded-xl border-2 transition-all hover:border-primary/50 group ${
                            filters.hotWaterIncluded 
                              ? "border-primary bg-primary/10 text-primary" 
                              : "border-gray-200 bg-white text-gray-700"
                          }`}>
                            {filters.hotWaterIncluded && (
                              <div className="absolute -top-1 -right-1 bg-primary text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
                                ✓
                              </div>
                            )}
                            <Droplet className="h-5 w-5" />
                            <span className="text-xs font-medium">Eau chaude</span>
                          </div>
                        </label>
                        <label className="relative flex items-center cursor-pointer group">
                          <input
                            type="checkbox"
                            checked={filters.electricityIncluded}
                            onChange={(e) => setFilters({...filters, electricityIncluded: e.target.checked})}
                            className="sr-only peer"
                          />
                          <div className={`flex flex-col items-center gap-2 w-full px-4 py-3 rounded-xl border-2 transition-all hover:border-primary/50 group ${
                            filters.electricityIncluded 
                              ? "border-primary bg-primary/10 text-primary" 
                              : "border-gray-200 bg-white text-gray-700"
                          }`}>
                            {filters.electricityIncluded && (
                              <div className="absolute -top-1 -right-1 bg-primary text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
                                ✓
                              </div>
                            )}
                            <Zap className="h-5 w-5" />
                            <span className="text-xs font-medium">Électricité</span>
                          </div>
                        </label>
                        <label className="relative flex items-center cursor-pointer group">
                          <input
                            type="checkbox"
                            checked={filters.parkingIncluded}
                            onChange={(e) => setFilters({...filters, parkingIncluded: e.target.checked})}
                            className="sr-only peer"
                          />
                          <div className={`flex flex-col items-center gap-2 w-full px-4 py-3 rounded-xl border-2 transition-all hover:border-primary/50 group ${
                            filters.parkingIncluded 
                              ? "border-primary bg-primary/10 text-primary" 
                              : "border-gray-200 bg-white text-gray-700"
                          }`}>
                            {filters.parkingIncluded && (
                              <div className="absolute -top-1 -right-1 bg-primary text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
                                ✓
                              </div>
                            )}
                            <Car className="h-5 w-5" />
                            <span className="text-xs font-medium">Parking</span>
                          </div>
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 pt-6 border-t flex justify-between items-center">
                    <div className="text-sm text-gray-500">
                      {Object.values(filters).filter(v => v !== "" && v !== false).length > 0 && (
                        <span>
                          {Object.values(filters).filter(v => v !== "" && v !== false).length} filtre(s) actif(s)
                        </span>
                      )}
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => setFilters({
                        minPrice: "",
                        maxPrice: "",
                        furnished: false,
                        petAllowed: false,
                        wifiIncluded: false,
                        heatingIncluded: false,
                        hotWaterIncluded: false,
                        electricityIncluded: false,
                        parkingIncluded: false,
                        minTerm: "",
                        maxTerm: "",
                      })}
                      className="flex items-center gap-2"
                    >
                      <X className="h-4 w-4" />
                      Réinitialiser
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Toggle Vue Liste / Carte */}
          <div className="max-w-6xl mx-auto mb-6 flex justify-end">
            <div className="inline-flex items-center gap-2 bg-white rounded-xl border-2 border-gray-200 p-1 shadow-sm">
              <button
                onClick={() => setViewMode("list")}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                  viewMode === "list"
                    ? "bg-violet-600 text-white shadow-md"
                    : "text-gray-600 hover:text-violet-600"
                }`}
              >
                <List className="h-4 w-4" />
                Liste
              </button>
              <button
                onClick={() => setViewMode("map")}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                  viewMode === "map"
                    ? "bg-violet-600 text-white shadow-md"
                    : "text-gray-600 hover:text-violet-600"
                }`}
              >
                <MapIcon className="h-4 w-4" />
                Carte
              </button>
            </div>
          </div>

          {/* Loading State - seulement pour la vue liste */}
          {isLoading && viewMode === "list" && (
            <div className="text-center py-20">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-violet-200 border-t-violet-600 mb-4"></div>
              <p className="text-xl font-semibold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
                Chargement des annonces...
              </p>
            </div>
          )}

          {/* Error State - seulement pour la vue liste */}
          {error && !isLoading && viewMode === "list" && (
            <div className="text-center py-20">
              <p className="text-xl text-red-500 mb-4">{error}</p>
              <Button onClick={fetchListings}>Réessayer</Button>
            </div>
          )}

          {/* Vue Liste */}
          {!isLoading && !error && viewMode === "list" && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredListings.map((listing, index) => (
              <Link key={listing.id} href={`/listings/${listing.id}`}>
                <Card className="group relative overflow-hidden listing-card bg-white cursor-pointer border-2 border-transparent hover:border-violet-200 transition-all duration-500 hover:shadow-2xl hover:-translate-y-2">
                  {/* Gradient overlay au hover */}
                  <div className="absolute inset-0 bg-gradient-to-br from-violet-500/0 via-purple-500/0 to-indigo-500/0 group-hover:from-violet-500/5 group-hover:via-purple-500/5 group-hover:to-indigo-500/5 transition-all duration-500 z-0"></div>
                  
                  <div className="relative h-72 w-full overflow-hidden rounded-t-lg">
                    {listing.images && listing.images.length > 0 ? (
                      <>
                        <Image
                          src={listing.images[0]}
                          alt={listing.title}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        <div className="absolute inset-0 bg-gradient-to-br from-violet-500/0 via-transparent to-purple-500/0 opacity-0 group-hover:opacity-30 transition-opacity duration-500"></div>
                      </>
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-violet-100 via-purple-100 to-indigo-100">
                        <div className="text-6xl opacity-30 group-hover:scale-110 transition-transform duration-300">🏠</div>
                      </div>
                    )}
                    <div className="absolute top-5 right-5 flex gap-2 z-10">
                      {listing.furnished && (
                        <Badge className="bg-white/95 backdrop-blur-md text-gray-900 shadow-xl border-0 font-semibold text-xs px-3 py-1.5 rounded-full group-hover:bg-white transition-colors">
                          Meublé
                        </Badge>
                      )}
                    </div>
                    <div className="absolute top-5 left-5 z-10">
                      <div className="bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 text-white px-4 py-2.5 rounded-2xl font-bold shadow-2xl text-sm backdrop-blur-sm group-hover:shadow-violet-500/50 group-hover:scale-105 transition-all duration-300">
                        ${listing.price.toLocaleString('fr-CA')}/mois
                      </div>
                    </div>
                  </div>
                  
                  <CardContent className="p-6 relative z-10 bg-white">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-xl font-bold text-gray-900 line-clamp-2 flex-1 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-violet-600 group-hover:to-purple-600 transition-all duration-300">
                        {listing.title}
                      </h3>
                    </div>
                    
                    <div className="flex items-center text-gray-600 mb-3 group-hover:text-gray-700 transition-colors">
                      <MapPin className="h-4 w-4 mr-1.5 text-violet-500 group-hover:text-purple-600 transition-colors" />
                      <span className="text-sm font-medium">
                        {listing.area ? `${listing.area}, ` : ''}{listing.city}
                      </span>
                    </div>
                    
                    {listing.landlordName && listing.landlordId && (
                      <Link href={`/landlord/${listing.landlordId}`} onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center text-gray-500 mb-4 hover:text-violet-600 transition-colors cursor-pointer group/user">
                          <div className="p-1 rounded-full bg-violet-100 group-hover/user:bg-violet-200 transition-colors mr-2">
                            <User className="h-3 w-3 text-violet-600" />
                          </div>
                          <span className="text-xs font-medium group-hover/user:underline">{listing.landlordName}</span>
                        </div>
                      </Link>
                    )}
                    
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <span className="flex items-center gap-1.5 bg-gradient-to-br from-violet-50 to-purple-50 px-3 py-1.5 rounded-lg font-medium group-hover:from-violet-100 group-hover:to-purple-100 transition-all duration-300">
                        <Bed className="h-4 w-4 text-violet-600" />
                        {listing.bedrooms} ch.
                      </span>
                      <span className="flex items-center gap-1.5 bg-gradient-to-br from-indigo-50 to-blue-50 px-3 py-1.5 rounded-lg font-medium group-hover:from-indigo-100 group-hover:to-blue-100 transition-all duration-300">
                        <Bath className="h-4 w-4 text-indigo-600" />
                        {listing.bathrooms} sdb
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
            </div>
          )}

          {/* Vue Carte */}
          {viewMode === "map" && (
            <div className="max-w-6xl mx-auto mb-8">
              <Card className="border-2 shadow-lg overflow-hidden">
                <CardContent className="p-0">
                  {isLoading ? (
                    <div className="h-[600px] w-full flex items-center justify-center bg-gray-100">
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600 mx-auto mb-4"></div>
                        <p className="text-gray-600">Chargement de la carte...</p>
                      </div>
                    </div>
                  ) : error ? (
                    <div className="h-[600px] w-full flex items-center justify-center bg-gray-100">
                      <div className="text-center">
                        <p className="text-red-500 mb-4">{error}</p>
                        <Button onClick={fetchListings}>Réessayer</Button>
                      </div>
                    </div>
                  ) : (
                    <ListingsMapView 
                      listings={filteredListings.map(l => ({
                        id: l.id,
                        title: l.title,
                        price: l.price,
                        city: l.city,
                        area: l.area || '',
                        latitude: l.latitude,
                        longitude: l.longitude,
                      }))}
                    />
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {!isLoading && !error && filteredListings.length === 0 && (
            <div className="text-center py-20">
              <p className="text-xl text-gray-500 mb-4">
                {listings.length === 0 
                  ? "Aucun logement disponible pour le moment"
                  : "Aucun logement ne correspond à votre recherche"}
              </p>
              {(searchTerm || Object.values(filters).some(v => v !== "" && v !== false)) && (
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSearchTerm("");
                    setFilters({
                      minPrice: "",
                      maxPrice: "",
                      minTerm: "",
                      maxTerm: "",
                      furnished: false,
                      petAllowed: false,
                      wifiIncluded: false,
                      heatingIncluded: false,
                      hotWaterIncluded: false,
                      electricityIncluded: false,
                      parkingIncluded: false,
                    });
                  }}
                >
                  Réinitialiser la recherche
                </Button>
              )}
            </div>
          )}
        </div>
      </main>
    </>
  );
}

