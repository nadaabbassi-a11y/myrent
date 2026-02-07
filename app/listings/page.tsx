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
  User,
  ArrowRight
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

      let data;
      try {
        data = await response.json();
      } catch (parseError) {
        console.error('[Listings] Erreur de parsing JSON:', parseError);
        throw new Error('Erreur lors de la lecture des données');
      }
      
      console.log('[Listings] Données parsées:', data);
      console.log('[Listings] Nombre d\'annonces:', data.listings?.length || 0);
      
      if (data.error && !data.listings) {
        throw new Error(data.error);
      }
      
      // S'assurer que listings est un tableau
      const listingsArray = Array.isArray(data.listings) ? data.listings : (data.listings || []);
      setListings(listingsArray);
      console.log('[Listings] État mis à jour avec succès,', listingsArray.length, 'annonces');
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Ne pas inclure fetchListings dans les dépendances pour éviter les boucles infinies

  // Rafraîchir les données quand la page redevient visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && !isLoading) {
        console.log('[Listings] Page visible - rafraîchissement');
        fetchListings();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading]); // Ne pas inclure fetchListings pour éviter les boucles

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
      <main className="min-h-screen">
        {/* Hero Section avec barre de recherche - Style accueil */}
        <section className="relative bg-white py-12 md:py-16 overflow-hidden">
          <div className="container mx-auto px-6 relative z-10">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-8">
                <h1 className="text-4xl md:text-5xl font-light mb-4 text-neutral-900 leading-[1.05] tracking-tight">
                  Découvrez des logements disponibles
                </h1>
                <p className="text-lg md:text-xl text-neutral-600 max-w-2xl mx-auto font-light leading-relaxed">
                  Recherchez parmi des milliers d'annonces de locations long terme
                </p>
              </div>

              {/* Barre de recherche - Style Apple amélioré */}
              <div className="max-w-4xl mx-auto">
                <div className="flex flex-col md:flex-row gap-2 bg-white rounded-3xl p-3 shadow-2xl border border-neutral-100 hover:shadow-3xl transition-all duration-500">
                  <div className="relative flex-1 group">
                    <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 h-5 w-5 text-neutral-400 transition-colors group-focus-within:text-neutral-900" />
                    <input
                      type="text"
                      placeholder="Rechercher par ville, quartier ou type..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-14 pr-5 py-5 rounded-2xl border-0 focus:outline-none text-neutral-900 bg-neutral-50 focus:bg-white transition-all duration-300 text-lg font-light placeholder:text-neutral-400"
                    />
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowFilters(!showFilters)}
                      className="bg-neutral-900 hover:bg-neutral-800 text-white font-light py-5 px-6 rounded-2xl transition-all duration-300 flex items-center justify-center gap-2 text-lg hover:scale-[1.02] active:scale-[0.98]"
                    >
                      <Filter className="h-5 w-5" />
                      Filtres
                    </button>
                    
                    {/* Toggle Vue Liste / Carte - Compact */}
                    <div className="inline-flex items-center gap-1 bg-neutral-100 rounded-2xl p-1">
                      <button
                        onClick={() => setViewMode("list")}
                        className={`flex items-center justify-center p-3 rounded-xl font-light text-sm transition-all ${
                          viewMode === "list"
                            ? "bg-neutral-900 text-white shadow-sm"
                            : "text-neutral-600 hover:text-neutral-900"
                        }`}
                      >
                        <List className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setViewMode("map")}
                        className={`flex items-center justify-center p-3 rounded-xl font-light text-sm transition-all ${
                          viewMode === "map"
                            ? "bg-neutral-900 text-white shadow-sm"
                            : "text-neutral-600 hover:text-neutral-900"
                        }`}
                      >
                        <MapIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

          {/* Filtres */}
          <div className="max-w-6xl mx-auto mb-8 pt-8">

            {showFilters && (
              <Card className="mb-6 border-2 border-neutral-100 shadow-lg bg-white">
                <CardHeader className="border-b border-neutral-100">
                  <CardTitle className="flex items-center gap-2 text-neutral-900 font-light text-2xl">
                    <Filter className="h-5 w-5 text-neutral-600" />
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
                        <label className="text-sm font-medium text-neutral-700 flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-neutral-600" />
                          Durée du bail (mois)
                        </label>
                        <div className="flex gap-3">
                          <div className="flex-1">
                            <input
                              type="number"
                              placeholder="Min"
                              value={filters.minTerm}
                              onChange={(e) => setFilters({...filters, minTerm: e.target.value})}
                              className="w-full px-4 py-3 rounded-xl border-2 border-neutral-200 focus:border-neutral-900 focus:outline-none transition-colors bg-white text-neutral-900 font-light"
                            />
                          </div>
                          <div className="flex items-center text-neutral-400">—</div>
                          <div className="flex-1">
                            <input
                              type="number"
                              placeholder="Max"
                              value={filters.maxTerm}
                              onChange={(e) => setFilters({...filters, maxTerm: e.target.value})}
                              className="w-full px-4 py-3 rounded-xl border-2 border-neutral-200 focus:border-neutral-900 focus:outline-none transition-colors bg-white text-neutral-900 font-light"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Caractéristiques */}
                    <div className="space-y-4">
                      <label className="text-sm font-medium text-neutral-700">Caractéristiques</label>
                      <div className="flex flex-wrap gap-3">
                        <label className="relative flex items-center cursor-pointer group">
                          <input
                            type="checkbox"
                            checked={filters.furnished}
                            onChange={(e) => setFilters({...filters, furnished: e.target.checked})}
                            className="sr-only peer"
                          />
                          <div className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 transition-all hover:border-neutral-300 group ${
                            filters.furnished 
                              ? "border-neutral-900 bg-neutral-900 text-white" 
                              : "border-neutral-200 bg-white text-neutral-700"
                          }`}>
                            {filters.furnished && (
                              <div className="absolute -top-1 -right-1 bg-white text-neutral-900 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
                                ✓
                              </div>
                            )}
                            <span className="text-sm font-light">Meublé</span>
                          </div>
                        </label>
                        <label className="relative flex items-center cursor-pointer group">
                          <input
                            type="checkbox"
                            checked={filters.petAllowed}
                            onChange={(e) => setFilters({...filters, petAllowed: e.target.checked})}
                            className="sr-only peer"
                          />
                          <div className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 transition-all hover:border-neutral-300 group ${
                            filters.petAllowed 
                              ? "border-neutral-900 bg-neutral-900 text-white" 
                              : "border-neutral-200 bg-white text-neutral-700"
                          }`}>
                            {filters.petAllowed && (
                              <div className="absolute -top-1 -right-1 bg-white text-neutral-900 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
                                ✓
                              </div>
                            )}
                            <Dog className="h-4 w-4" />
                            <span className="text-sm font-light">Animaux acceptés</span>
                          </div>
                        </label>
                      </div>
                    </div>

                    {/* Utilités */}
                    <div className="space-y-4">
                      <label className="text-sm font-medium text-neutral-700">Utilités incluses</label>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                        <label className="relative flex items-center cursor-pointer group">
                          <input
                            type="checkbox"
                            checked={filters.wifiIncluded}
                            onChange={(e) => setFilters({...filters, wifiIncluded: e.target.checked})}
                            className="sr-only peer"
                          />
                          <div className={`flex flex-col items-center gap-2 w-full px-4 py-3 rounded-xl border-2 transition-all hover:border-neutral-300 group ${
                            filters.wifiIncluded 
                              ? "border-neutral-900 bg-neutral-900 text-white" 
                              : "border-neutral-200 bg-white text-neutral-700"
                          }`}>
                            {filters.wifiIncluded && (
                              <div className="absolute -top-1 -right-1 bg-white text-neutral-900 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
                                ✓
                              </div>
                            )}
                            <Wifi className="h-5 w-5" />
                            <span className="text-xs font-light">WiFi</span>
                          </div>
                        </label>
                        <label className="relative flex items-center cursor-pointer group">
                          <input
                            type="checkbox"
                            checked={filters.heatingIncluded}
                            onChange={(e) => setFilters({...filters, heatingIncluded: e.target.checked})}
                            className="sr-only peer"
                          />
                          <div className={`flex flex-col items-center gap-2 w-full px-4 py-3 rounded-xl border-2 transition-all hover:border-neutral-300 group ${
                            filters.heatingIncluded 
                              ? "border-neutral-900 bg-neutral-900 text-white" 
                              : "border-neutral-200 bg-white text-neutral-700"
                          }`}>
                            {filters.heatingIncluded && (
                              <div className="absolute -top-1 -right-1 bg-white text-neutral-900 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
                                ✓
                              </div>
                            )}
                            <Flame className="h-5 w-5" />
                            <span className="text-xs font-light">Chauffage</span>
                          </div>
                        </label>
                        <label className="relative flex items-center cursor-pointer group">
                          <input
                            type="checkbox"
                            checked={filters.hotWaterIncluded}
                            onChange={(e) => setFilters({...filters, hotWaterIncluded: e.target.checked})}
                            className="sr-only peer"
                          />
                          <div className={`flex flex-col items-center gap-2 w-full px-4 py-3 rounded-xl border-2 transition-all hover:border-neutral-300 group ${
                            filters.hotWaterIncluded 
                              ? "border-neutral-900 bg-neutral-900 text-white" 
                              : "border-neutral-200 bg-white text-neutral-700"
                          }`}>
                            {filters.hotWaterIncluded && (
                              <div className="absolute -top-1 -right-1 bg-white text-neutral-900 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
                                ✓
                              </div>
                            )}
                            <Droplet className="h-5 w-5" />
                            <span className="text-xs font-light">Eau chaude</span>
                          </div>
                        </label>
                        <label className="relative flex items-center cursor-pointer group">
                          <input
                            type="checkbox"
                            checked={filters.electricityIncluded}
                            onChange={(e) => setFilters({...filters, electricityIncluded: e.target.checked})}
                            className="sr-only peer"
                          />
                          <div className={`flex flex-col items-center gap-2 w-full px-4 py-3 rounded-xl border-2 transition-all hover:border-neutral-300 group ${
                            filters.electricityIncluded 
                              ? "border-neutral-900 bg-neutral-900 text-white" 
                              : "border-neutral-200 bg-white text-neutral-700"
                          }`}>
                            {filters.electricityIncluded && (
                              <div className="absolute -top-1 -right-1 bg-white text-neutral-900 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
                                ✓
                              </div>
                            )}
                            <Zap className="h-5 w-5" />
                            <span className="text-xs font-light">Électricité</span>
                          </div>
                        </label>
                        <label className="relative flex items-center cursor-pointer group">
                          <input
                            type="checkbox"
                            checked={filters.parkingIncluded}
                            onChange={(e) => setFilters({...filters, parkingIncluded: e.target.checked})}
                            className="sr-only peer"
                          />
                          <div className={`flex flex-col items-center gap-2 w-full px-4 py-3 rounded-xl border-2 transition-all hover:border-neutral-300 group ${
                            filters.parkingIncluded 
                              ? "border-neutral-900 bg-neutral-900 text-white" 
                              : "border-neutral-200 bg-white text-neutral-700"
                          }`}>
                            {filters.parkingIncluded && (
                              <div className="absolute -top-1 -right-1 bg-white text-neutral-900 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
                                ✓
                              </div>
                            )}
                            <Car className="h-5 w-5" />
                            <span className="text-xs font-light">Parking</span>
                          </div>
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 pt-6 border-t border-neutral-100 flex justify-between items-center">
                    <div className="text-sm text-neutral-500 font-light">
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
                      className="flex items-center gap-2 border-neutral-200 text-neutral-700 hover:bg-neutral-50 font-light"
                    >
                      <X className="h-4 w-4" />
                      Réinitialiser
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>


          {/* Loading State - seulement pour la vue liste */}
          {isLoading && viewMode === "list" && (
            <div className="text-center py-20">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-neutral-200 border-t-neutral-900 mb-4"></div>
              <p className="text-xl font-light text-neutral-600">
                Chargement des annonces...
              </p>
            </div>
          )}

          {/* Error State - seulement pour la vue liste */}
          {error && !isLoading && viewMode === "list" && (
            <div className="text-center py-20">
              <p className="text-xl text-neutral-600 mb-4 font-light">{error}</p>
              <Button onClick={fetchListings} className="bg-neutral-900 hover:bg-neutral-800 text-white font-light">Réessayer</Button>
            </div>
          )}

          {/* Vue Liste - Style accueil */}
          {!isLoading && !error && viewMode === "list" && (
            <section className="py-16 bg-white">
              <div className="container mx-auto px-6">
                <div className="grid md:grid-cols-3 gap-12 max-w-6xl mx-auto">
                  {filteredListings.map((listing, index) => (
                    <Link key={listing.id} href={`/listings/${listing.id}`}>
                      <div className="group relative bg-white overflow-hidden transition-all duration-500 hover:opacity-100 hover:-translate-y-3">
                        <div className="relative h-80 w-full overflow-hidden rounded-2xl mb-6 shadow-lg group-hover:shadow-2xl transition-all duration-500">
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10"></div>
                          {listing.images && listing.images.length > 0 ? (
                            <Image
                              src={listing.images[0]}
                              alt={listing.title}
                              fill
                              className="object-cover transition-transform duration-700 group-hover:scale-110"
                              sizes="(max-width: 768px) 100vw, 33vw"
                              quality={90}
                              unoptimized={listing.images[0]?.startsWith('/uploads/')}
                            />
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center bg-neutral-100">
                              <div className="text-6xl opacity-30">🏠</div>
                            </div>
                          )}
                          <div className="absolute bottom-4 left-4 right-4 z-20 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-4 group-hover:translate-y-0">
                            <div className="bg-white/95 backdrop-blur-sm rounded-xl p-3">
                              <p className="text-neutral-900 font-light text-sm">
                                Voir les détails →
                              </p>
                            </div>
                          </div>
                          <div className="absolute top-4 left-4 z-20">
                            <div className="bg-neutral-900 text-white px-4 py-2 rounded-xl font-light text-sm shadow-xl">
                              {listing.price.toLocaleString('fr-CA')} $ / mois
                            </div>
                          </div>
                        </div>
                        
                        <div className="px-2">
                          <div className="mb-3 transform group-hover:translate-x-1 transition-transform duration-300">
                            <span className="text-2xl font-light text-neutral-900">
                              {listing.price.toLocaleString('fr-CA')} $ / mois
                            </span>
                          </div>
                          
                          <h3 className="text-2xl font-light mb-2 text-neutral-900 leading-tight group-hover:text-neutral-700 transition-colors duration-300">{listing.title}</h3>
                          <p className="text-lg text-neutral-600 mb-6 flex items-center gap-2 font-light group-hover:text-neutral-500 transition-colors duration-300">
                            <MapPin className="h-4 w-4 text-neutral-400 group-hover:text-neutral-600 transition-colors duration-300" />
                            {listing.area ? `${listing.area}, ` : ""}{listing.city}
                          </p>
                          
                          <div className="flex items-center gap-6 text-base text-neutral-500 mb-8">
                            <span className="flex items-center gap-2 font-light group-hover:text-neutral-600 transition-colors duration-300">
                              <Bed className="h-5 w-5 text-neutral-400 group-hover:text-neutral-600 transition-colors duration-300" />
                              {listing.bedrooms} ch.
                            </span>
                            <span className="flex items-center gap-2 font-light group-hover:text-neutral-600 transition-colors duration-300">
                              <Bath className="h-5 w-5 text-neutral-400 group-hover:text-neutral-600 transition-colors duration-300" />
                              {listing.bathrooms} sdb
                            </span>
                          </div>
                          
                          <div className="text-lg text-neutral-900 font-light group-hover:underline transform group-hover:translate-x-2 transition-all duration-300 inline-flex items-center gap-2">
                            En savoir plus
                            <ArrowRight className="h-5 w-5 opacity-0 group-hover:opacity-100 transform -translate-x-2 group-hover:translate-x-0 transition-all duration-300" />
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </section>
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
            <section className="py-20 bg-white">
              <div className="text-center">
                <p className="text-xl text-neutral-600 mb-4 font-light">
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
                    className="border-neutral-200 text-neutral-700 hover:bg-neutral-50 font-light"
                  >
                    Réinitialiser la recherche
                  </Button>
                )}
              </div>
            </section>
          )}
      </main>
    </>
  );
}

