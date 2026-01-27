"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  Mail, 
  Phone, 
  Building, 
  MapPin, 
  Bed, 
  Bath, 
  DollarSign,
  Calendar,
  Home
} from "lucide-react";

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
  images: string[];
  description?: string;
  minTerm?: number;
  maxTerm?: number;
}

interface Landlord {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  company: string | null;
  image: string | null;
  listingsCount: number;
  listings: Listing[];
}

export default function LandlordProfilePage() {
  const params = useParams();
  const router = useRouter();
  const landlordId = params.id as string;
  const [landlord, setLandlord] = useState<Landlord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchLandlord();
  }, [landlordId]);

  const fetchLandlord = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch(`/api/landlord/${landlordId}?t=${Date.now()}`, {
        cache: 'no-store',
      });
      
      if (!response.ok) {
        if (response.status === 404) {
          setError("Propriétaire non trouvé");
        } else {
          setError("Erreur lors du chargement du profil");
        }
        setIsLoading(false);
        return;
      }

      const data = await response.json();
      setLandlord(data.landlord);
    } catch (err) {
      setError("Erreur lors du chargement du profil");
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
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Chargement du profil...</p>
            </div>
          </div>
        </main>
      </>
    );
  }

  if (error || !landlord) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-gray-50 py-8">
          <div className="container mx-auto px-4">
            <div className="text-center py-20">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">Erreur</h1>
              <p className="text-gray-600 mb-8">{error || "Le profil que vous recherchez n'existe pas."}</p>
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
      <main className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            {/* Bouton retour */}
            <Link href="/listings">
              <Button variant="ghost" className="mb-6">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour aux annonces
              </Button>
            </Link>

            {/* Profil du propriétaire */}
            <Card className="mb-8 border-2">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
                  {landlord.image ? (
                    <div className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-violet-100">
                      <Image
                        src={landlord.image}
                        alt={landlord.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center text-white text-3xl font-bold">
                      {landlord.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  
                  <div className="flex-1">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">{landlord.name}</h1>
                    {landlord.company && (
                      <div className="flex items-center gap-2 text-gray-600 mb-3">
                        <Building className="h-4 w-4" />
                        <span>{landlord.company}</span>
                      </div>
                    )}
                    <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-violet-600" />
                        <a href={`mailto:${landlord.email}`} className="hover:text-violet-600 hover:underline">
                          {landlord.email}
                        </a>
                      </div>
                      {landlord.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-violet-600" />
                          <a href={`tel:${landlord.phone}`} className="hover:text-violet-600 hover:underline">
                            {landlord.phone}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-3xl font-bold text-violet-600">{landlord.listingsCount}</div>
                    <div className="text-sm text-gray-600">Annonce{landlord.listingsCount > 1 ? 's' : ''}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Autres annonces */}
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Autres annonces de {landlord.name}
              </h2>
              
              {landlord.listings.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center text-gray-500">
                    <Home className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p>Aucune autre annonce disponible</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {landlord.listings.map((listing) => (
                    <Link key={listing.id} href={`/listings/${listing.id}`}>
                      <Card className="group overflow-hidden cursor-pointer hover:shadow-lg transition-shadow border-2">
                        <div className="relative h-48 w-full overflow-hidden">
                          {listing.images && listing.images.length > 0 ? (
                            <Image
                              src={listing.images[0]}
                              alt={listing.title}
                              fill
                              className="object-cover group-hover:scale-110 transition-transform duration-500"
                              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            />
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                              <Home className="h-12 w-12 text-gray-400" />
                            </div>
                          )}
                          <div className="absolute top-3 left-3">
                            <div className="bg-gradient-to-r from-violet-600 to-purple-600 text-white px-3 py-1.5 rounded-lg font-bold text-sm shadow-lg">
                              ${listing.price}/mois
                            </div>
                          </div>
                        </div>
                        
                        <CardContent className="p-4">
                          <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-1 group-hover:text-violet-600 transition-colors">
                            {listing.title}
                          </h3>
                          
                          <div className="flex items-center text-gray-600 mb-3 text-sm">
                            <MapPin className="h-3.5 w-3.5 mr-1.5 text-violet-500" />
                            <span>
                              {listing.area ? `${listing.area}, ` : ''}{listing.city}
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-3 text-sm text-gray-600">
                            <span className="flex items-center gap-1">
                              <Bed className="h-4 w-4 text-violet-500" />
                              {listing.bedrooms}
                            </span>
                            <span className="flex items-center gap-1">
                              <Bath className="h-4 w-4 text-violet-500" />
                              {listing.bathrooms}
                            </span>
                            {listing.furnished && (
                              <Badge className="bg-violet-100 text-violet-800 text-xs">
                                Meublé
                              </Badge>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

