"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { Plus, ArrowLeft, Edit, Trash2, MapPin, DollarSign, Calendar, RefreshCw } from "lucide-react";

interface Listing {
  id: string;
  title: string;
  description: string;
  price: number;
  address: string | null;
  createdAt: string;
  updatedAt: string;
}

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

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div>
                <Link
                  href="/landlord/dashboard"
                  className="inline-flex items-center gap-2 text-gray-600 hover:text-violet-600 mb-4 transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Retour au tableau de bord
                </Link>
                <h1 className="text-3xl font-bold text-gray-900">Mes annonces</h1>
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={handleRegeocode}
                  disabled={isRegeocoding}
                  className="flex items-center gap-2"
                >
                  <RefreshCw className={`h-4 w-4 ${isRegeocoding ? 'animate-spin' : ''}`} />
                  {isRegeocoding ? 'Regéocodage...' : 'Mettre à jour les localisations'}
                </Button>
                <Link href="/landlord/listings/new">
                  <Button className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white">
                    <Plus className="h-4 w-4 mr-2" />
                    Créer une annonce
                  </Button>
                </Link>
              </div>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
                {error}
              </div>
            )}

            {regeocodeResult && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl text-green-700">
                {regeocodeResult}
              </div>
            )}

            {listings.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <p className="text-gray-500 mb-4">Vous n'avez pas encore créé d'annonce.</p>
                  <Link href="/landlord/listings/new">
                    <Button className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white">
                      <Plus className="h-4 w-4 mr-2" />
                      Créer votre première annonce
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {listings.map((listing) => (
                  <Card key={listing.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <h3 className="text-xl font-semibold mb-2 text-gray-900">{listing.title}</h3>
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">{listing.description}</p>
                      
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-2 text-gray-700">
                          <DollarSign className="h-4 w-4 text-violet-600" />
                          <span className="font-semibold">{listing.price} $/mois</span>
                        </div>
                        {listing.address && (
                          <div className="flex items-center gap-2 text-gray-600 text-sm">
                            <MapPin className="h-4 w-4" />
                            <span>{listing.address}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2 pt-4 border-t">
                        <Link href={`/landlord/listings/${listing.id}/edit`} className="flex-1">
                          <Button variant="outline" className="w-full">
                            <Edit className="h-4 w-4 mr-2" />
                            Modifier
                          </Button>
                        </Link>
                        <Link href={`/landlord/listings/${listing.id}/slots`} className="flex-1">
                          <Button variant="outline" className="w-full">
                            <Calendar className="h-4 w-4 mr-2" />
                            Créneaux
                          </Button>
                        </Link>
                        <Button
                          variant="outline"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => handleDelete(listing.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
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

