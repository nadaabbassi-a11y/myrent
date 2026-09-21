"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { Heart, Home, MapPin, Bed, Bath, ArrowRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

interface Favorite {
  id: string;
  listing: {
    id: string;
    title: string;
    price: number;
    city: string;
    area: string | null;
    bedrooms: number;
    bathrooms: number;
    images: string | null;
  };
}

export default function FavoritesPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth/signin");
    } else if (user && user.role === "TENANT") {
      fetchFavorites();
    }
  }, [user, authLoading, router]);

  const fetchFavorites = async () => {
    try {
      setIsLoading(true);
      // TODO: Implémenter l'API pour récupérer les favoris
      // Pour l'instant, on simule avec des données vides
      setFavorites([]);
    } catch (err) {
      setError("Erreur lors du chargement des favoris");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading || isLoading) {
    return (
      <>
        <div className="py-10">
          <div className="container mx-auto px-4">
            <div className="text-center">Chargement...</div>
          </div>
        </div>
      </>
    );
  }

  if (!user || user.role !== "TENANT") {
    return null;
  }

  return (
    <>
      <div className="py-10">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-3xl font-bold mb-8 text-ink flex items-center gap-3">
              <Heart className="h-8 w-8 text-ink fill-ink" />
              Mes favoris
            </h1>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
                {error}
              </div>
            )}

            {favorites.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Heart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-ink mb-2">
                    Aucun favori pour le moment
                  </h3>
                  <p className="text-ink-muted mb-6">
                    Commencez à explorer les annonces et ajoutez vos logements préférés à vos favoris.
                  </p>
                  <Link href="/listings">
                    <Button className="bg-ink hover:bg-ink/90 text-white">
                      Parcourir les annonces
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {favorites.map((favorite) => {
                  const images = favorite.listing.images
                    ? JSON.parse(favorite.listing.images)
                    : [];
                  const mainImage = images[0] || "/placeholder-listing.jpg";

                  return (
                    <Link key={favorite.id} href={`/listings/${favorite.listing.id}`}>
                      <Card className="hover:shadow-lg transition-shadow cursor-pointer overflow-hidden">
                        <div className="relative h-48 w-full">
                          <Image
                            src={mainImage}
                            alt={favorite.listing.title}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 100vw, 33vw"
                          />
                          <div className="absolute top-3 right-3">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="bg-white/90 hover:bg-white rounded-full p-2"
                              onClick={(e) => {
                                e.preventDefault();
                                // TODO: Implémenter la suppression du favori
                              }}
                            >
                              <Heart className="h-5 w-5 text-ink fill-ink" />
                            </Button>
                          </div>
                        </div>
                        <CardHeader>
                          <CardTitle className="text-lg mb-2">
                            {favorite.listing.title}
                          </CardTitle>
                          <div className="flex items-center gap-2 text-sm text-ink-muted mb-2">
                            <MapPin className="h-4 w-4" />
                            {favorite.listing.city}
                            {favorite.listing.area && `, ${favorite.listing.area}`}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-ink-muted">
                            <span className="flex items-center gap-1">
                              <Bed className="h-4 w-4" />
                              {favorite.listing.bedrooms} ch.
                            </span>
                            <span className="flex items-center gap-1">
                              <Bath className="h-4 w-4" />
                              {favorite.listing.bathrooms} sdb
                            </span>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center justify-between">
                            <span className="text-xl font-bold text-ink">
                              {favorite.listing.price.toLocaleString('fr-CA')} $ / mois
                            </span>
                            <ArrowRight className="h-5 w-5 text-gray-400" />
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}



