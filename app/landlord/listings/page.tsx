"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { Plus, ArrowLeft, Edit, Trash2, DollarSign, Calendar, RefreshCw, MoreVertical, ImageIcon } from "lucide-react";
import { motion } from "framer-motion";
import Image from "next/image";

interface Listing {
  id: string;
  title: string;
  description: string;
  price: number;
  address: string | null;
  city: string | null;
  area: string | null;
  images: string[];
  createdAt: string;
  updatedAt: string;
}

// Fonction pour raccourcir l'adresse
const shortenAddress = (address: string | null, city: string | null = null, area: string | null = null): string => {
  if (!address) return "";
  
  // Si on a city et area, utiliser ceux-ci pour un format plus court
  if (city) {
    const streetPart = address.split(",")[0].trim();
    if (area) {
      return `${streetPart}, ${area}, ${city}`;
    }
    return `${streetPart}, ${city}`;
  }
  
  // Sinon, parser l'adresse complète
  const parts = address.split(",");
  if (parts.length > 1) {
    // Prendre le numéro et le nom de la rue (première partie)
    const firstPart = parts[0].trim();
    // Chercher la ville dans les parties suivantes
    const cityPart = parts.find(part => 
      part.includes("Montréal") || 
      part.includes("Québec") || 
      part.includes("Nouvelle-Écosse") ||
      part.includes("Halifax")
    );
    if (cityPart) {
      const cityName = cityPart.trim().split(",")[0].trim();
      return `${firstPart}, ${cityName}`;
    }
    return firstPart;
  }
  
  // Si l'adresse est très longue, la tronquer
  if (address.length > 60) {
    return address.substring(0, 60) + "...";
  }
  
  return address;
};

export default function LandlordListingsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [listings, setListings] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRegeocoding, setIsRegeocoding] = useState(false);
  const [regeocodeResult, setRegeocodeResult] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && (!user || user.role !== "LANDLORD")) {
      router.push("/auth/signin");
    } else if (user && user.role === "LANDLORD") {
      fetchListings();
    }
  }, [user, authLoading, router]);

  const fetchListings = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/landlord/listings", {
        cache: 'no-store',
      });
      
      if (!response.ok) {
        throw new Error("Erreur lors du chargement des annonces");
      }

      const data = await response.json();
      setListings(data.listings || []);
    } catch (err) {
      setError("Erreur lors du chargement des annonces");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegeocode = async () => {
    if (!confirm("Voulez-vous regéocoder toutes vos annonces ? Cela peut prendre quelques instants.")) {
      return;
    }

    setIsRegeocoding(true);
    setRegeocodeResult(null);
    setError(null);

    try {
      const response = await fetch("/api/listings/regeocode", {
        method: "POST",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erreur lors du regéocodage");
      }

      setRegeocodeResult(
        `Regéocodage terminé: ${data.success} succès, ${data.errors} erreurs sur ${data.total} annonces.`
      );

      // Rafraîchir la liste des listings
      fetchListings();
    } catch (err: any) {
      setError(err.message || "Erreur lors du regéocodage");
    } finally {
      setIsRegeocoding(false);
    }
  };

  const handleDelete = async (listingId: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette annonce ?")) {
      return;
    }

    try {
      const response = await fetch(`/api/listings/${listingId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        alert(data.error || "Erreur lors de la suppression");
        return;
      }

      // Rafraîchir la liste
      fetchListings();
    } catch (err) {
      alert("Erreur lors de la suppression");
      console.error(err);
    }
  };

  if (authLoading || isLoading) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-white py-12">
          <div className="container mx-auto px-4">
            <div className="text-center text-neutral-600 font-light">Chargement...</div>
          </div>
        </main>
      </>
    );
  }

  if (!user || user.role !== "LANDLORD") {
    return null;
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-6 py-12">
          {/* Header - Apple Style */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12"
          >
            <Link
              href="/landlord/dashboard"
              className="inline-flex items-center gap-2 text-neutral-600 hover:text-neutral-900 mb-6 transition-colors text-sm font-light"
            >
              <ArrowLeft className="h-4 w-4" />
              Retour au tableau de bord
            </Link>
            
            <div className="flex items-start justify-between mb-8">
              <div>
                <h1 className="text-5xl font-light text-neutral-900 mb-2">
                  Mes annonces
                </h1>
                <p className="text-xl text-neutral-600 font-light">
                  {listings.length} {listings.length === 1 ? "annonce" : "annonces"}
                </p>
              </div>
              
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  onClick={handleRegeocode}
                  disabled={isRegeocoding}
                  className="h-12 px-6 text-neutral-600 hover:text-neutral-900 font-light"
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${isRegeocoding ? 'animate-spin' : ''}`} />
                  {isRegeocoding ? 'Regéocodage...' : 'Mettre à jour les localisations'}
                </Button>
                <Link href="/landlord/listings/new">
                  <Button className="h-12 px-8 bg-neutral-900 hover:bg-neutral-800 text-white font-light">
                    <Plus className="h-4 w-4 mr-2" />
                    Créer une annonce
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>

          {/* Messages */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700"
            >
              {error}
            </motion.div>
          )}

          {regeocodeResult && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl text-green-700"
            >
              {regeocodeResult}
            </motion.div>
          )}

          {/* Listings Grid - Apple Style */}
          {listings.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <p className="text-2xl font-light text-neutral-600 mb-6">
                Vous n'avez pas encore créé d'annonce.
              </p>
              <Link href="/landlord/listings/new">
                <Button className="h-12 px-8 bg-neutral-900 hover:bg-neutral-800 text-white font-light">
                  <Plus className="h-4 w-4 mr-2" />
                  Créer votre première annonce
                </Button>
              </Link>
            </motion.div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {listings.map((listing, index) => (
                <motion.div
                  key={listing.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="group"
                >
                  <div className="bg-neutral-50 rounded-2xl overflow-hidden hover:bg-neutral-100 transition-all border border-neutral-200 hover:border-neutral-300 h-full flex flex-col">
                    {/* Image Preview */}
                    {listing.images && listing.images.length > 0 ? (
                      <div className="relative w-full aspect-[4/3] bg-neutral-200">
                        <Image
                          src={listing.images[0]}
                          alt={listing.title}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                      </div>
                    ) : (
                      <div className="relative w-full aspect-[4/3] bg-neutral-200 flex items-center justify-center">
                        <ImageIcon className="h-12 w-12 text-neutral-400" />
                      </div>
                    )}

                    {/* Content */}
                    <div className="p-8 flex flex-col flex-1">
                      {/* Title */}
                      <div className="mb-6">
                        <h3 className="text-2xl font-light text-neutral-900 mb-2">
                          {listing.title}
                        </h3>
                        {listing.description && (
                          <p className="text-base text-neutral-600 font-light line-clamp-2">
                            {listing.description}
                          </p>
                        )}
                      </div>
                    
                      {/* Price and Address */}
                      <div className="space-y-3 mb-6 flex-1">
                        <div className="flex items-baseline gap-2">
                          <span className="text-3xl font-light text-neutral-900">
                            {listing.price.toLocaleString('fr-CA')} $
                          </span>
                          <span className="text-neutral-600 font-light">/mois</span>
                        </div>
                        
                        {listing.address && (
                          <div className="text-sm text-neutral-600 font-light">
                            {shortenAddress(listing.address, listing.city, listing.area)}
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 pt-6 border-t border-neutral-200">
                      <Link href={`/landlord/listings/${listing.id}/edit`} className="flex-1">
                        <Button 
                          variant="ghost" 
                          className="w-full h-11 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-200 font-light"
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Modifier
                        </Button>
                      </Link>
                      <Link href={`/landlord/listings/${listing.id}/slots`} className="flex-1">
                        <Button 
                          variant="ghost" 
                          className="w-full h-11 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-200 font-light"
                        >
                          <Calendar className="h-4 w-4 mr-2" />
                          Créneaux
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        className="h-11 w-11 text-neutral-600 hover:text-red-600 hover:bg-red-50 font-light p-0"
                        onClick={() => handleDelete(listing.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
}
