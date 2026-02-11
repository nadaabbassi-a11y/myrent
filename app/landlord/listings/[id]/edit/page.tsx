"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/hooks/useAuth";
import { 
  Plus, 
  ArrowLeft, 
  Save, 
  Home, 
  MapPin, 
  DollarSign, 
  X, 
  Upload, 
  Image as ImageIcon,
  Bed,
  Bath,
  Wifi,
  Flame,
  Droplet,
  Zap,
  Dog,
  Box,
  MessageSquare,
  ExternalLink,
  Waves,
  Dumbbell,
  Gamepad2,
  ArrowUpDown,
  Car,
  Wind,
  Utensils,
  TreePine,
  Lock,
  Accessibility,
  Package,
  Sparkles
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { AddressAutocomplete } from "@/components/address-autocomplete";

interface Listing {
  id: string;
  title: string;
  description: string;
  price: number;
  city: string;
  area: string | null;
  address: string | null;
  postalCode: string | null;
  bedrooms: number;
  bathrooms: number;
  furnished: boolean;
  petAllowed: boolean;
  wifiIncluded: boolean;
  heatingIncluded: boolean;
  hotWaterIncluded: boolean;
  electricityIncluded: boolean;
  squareFootage: number | null;
  pool: boolean;
  gym: boolean;
  recreationRoom: boolean;
  elevator: boolean;
  parkingIncluded: boolean;
  parkingPaid: boolean;
  washerDryer: boolean;
  airConditioning: boolean;
  balcony: boolean;
  yard: boolean;
  dishwasher: boolean;
  refrigerator: boolean;
  oven: boolean;
  microwave: boolean;
  freezer: boolean;
  stove: boolean;
  storage: boolean;
  security: boolean;
  wheelchairAccessible: boolean;
  images: string[];
  model3dUrl: string | null;
  panoramaUrl: string | null;
  matterportUrl: string | null;
  sketchfabUrl: string | null;
  marketplaceUrl: string | null;
  marketplaceId: string | null;
  marketplaceAutoMessage: string | null;
  marketplaceAutoReplyEnabled: boolean;
}

export default function EditListingPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const listingId = params.id as string;
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    city: "",
    area: "",
    address: "",
    postalCode: "",
    bedrooms: "0",
    bathrooms: "1",
    furnished: false,
    petAllowed: false,
    wifiIncluded: false,
    heatingIncluded: false,
    hotWaterIncluded: false,
    electricityIncluded: false,
    squareFootage: "",
    pool: false,
    gym: false,
    recreationRoom: false,
    elevator: false,
    parkingIncluded: false,
    parkingPaid: false,
    washerDryer: false,
    airConditioning: false,
    balcony: false,
    yard: false,
    dishwasher: false,
    refrigerator: false,
    oven: false,
    microwave: false,
    freezer: false,
    stove: false,
    storage: false,
    security: false,
    wheelchairAccessible: false,
    model3dUrl: "",
    panoramaUrl: "",
    matterportUrl: "",
    sketchfabUrl: "",
    marketplaceUrl: "",
    marketplaceId: "",
    marketplaceAutoMessage: "Bonjour ! Merci pour votre intérêt pour cette propriété.\n\nPour réserver une visite et voir tous les détails (photos, caractéristiques, disponibilités), visitez notre page MyRent : [LIEN]\n\nVous pourrez y :\n• Réserver une visite en ligne\n• Poser vos questions\n• Consulter tous les détails de la propriété\n\nÀ bientôt !",
    marketplaceAutoReplyEnabled: false,
  });
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [addressCoordinates, setAddressCoordinates] = useState<{ latitude: number; longitude: number } | null>(null);

  useEffect(() => {
    if (!authLoading && (!user || user.role !== "LANDLORD")) {
      router.push("/auth/signin");
    } else if (user && user.role === "LANDLORD" && listingId) {
      fetchListing();
    }
  }, [user, authLoading, router, listingId]);

  const fetchListing = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/listings/${listingId}`, {
        cache: 'no-store',
      });
      
      if (!response.ok) {
        throw new Error("Erreur lors du chargement de l'annonce");
      }

      const data = await response.json();
      const listing = data.listing;
      
      setFormData({
        title: listing.title || "",
        description: listing.description || "",
        price: listing.price?.toString() || "",
        city: listing.city || "",
        area: listing.area || "",
        address: listing.address || "",
        postalCode: listing.postalCode || "",
        bedrooms: listing.bedrooms?.toString() || "0",
        bathrooms: listing.bathrooms?.toString() || "1",
        furnished: listing.furnished || false,
        petAllowed: listing.petAllowed || false,
        wifiIncluded: listing.wifiIncluded || false,
        heatingIncluded: listing.heatingIncluded || false,
        hotWaterIncluded: listing.hotWaterIncluded || false,
        electricityIncluded: listing.electricityIncluded || false,
        squareFootage: listing.squareFootage?.toString() || "",
        pool: listing.pool || false,
        gym: listing.gym || false,
        recreationRoom: listing.recreationRoom || false,
        elevator: listing.elevator || false,
        parkingIncluded: listing.parkingIncluded || false,
        parkingPaid: listing.parkingPaid || false,
        washerDryer: listing.washerDryer || false,
        airConditioning: listing.airConditioning || false,
        balcony: listing.balcony || false,
        yard: listing.yard || false,
        dishwasher: listing.dishwasher || false,
        refrigerator: listing.refrigerator || false,
        oven: listing.oven || false,
        microwave: listing.microwave || false,
        freezer: listing.freezer || false,
        stove: listing.stove || false,
        storage: listing.storage || false,
        security: listing.security || false,
        wheelchairAccessible: listing.wheelchairAccessible || false,
        model3dUrl: listing.model3dUrl || "",
        panoramaUrl: listing.panoramaUrl || "",
        matterportUrl: listing.matterportUrl || "",
        sketchfabUrl: listing.sketchfabUrl || "",
        marketplaceUrl: listing.marketplaceUrl || "",
        marketplaceId: listing.marketplaceId || "",
        marketplaceAutoMessage: listing.marketplaceAutoMessage || "Bonjour ! Merci pour votre intérêt pour cette propriété.\n\nPour réserver une visite et voir tous les détails (photos, caractéristiques, disponibilités), visitez notre page MyRent : [LIEN]\n\nVous pourrez y :\n• Réserver une visite en ligne\n• Poser vos questions\n• Consulter tous les détails de la propriété\n\nÀ bientôt !",
        marketplaceAutoReplyEnabled: listing.marketplaceAutoReplyEnabled || false,
      });
      
      setImageUrls(listing.images || []);
    } catch (err) {
      setError("Erreur lors du chargement de l'annonce");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setError(null);

    try {
      const uploadPromises = Array.from(files).map(async (file, index) => {
        try {
          // Vérifier le type de fichier
          if (!file.type.startsWith('image/')) {
            throw new Error(`${file.name} n'est pas une image`);
          }

          // Vérifier la taille (max 5MB)
          const maxSize = 5 * 1024 * 1024; // 5MB
          if (file.size > maxSize) {
            throw new Error(`${file.name} est trop volumineux (max 5MB)`);
          }

          const formData = new FormData();
          formData.append("file", file);

          const response = await fetch("/api/upload", {
            method: "POST",
            body: formData,
          });

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || `Erreur lors de l'upload de ${file.name}`);
          }

          const data = await response.json();
          return { success: true, url: data.url, fileName: file.name };
        } catch (err: any) {
          return { success: false, error: err.message || `Erreur pour ${file.name}`, fileName: file.name };
        }
      });

      const results = await Promise.all(uploadPromises);
      const successful = results.filter(r => r.success);
      const failed = results.filter(r => !r.success);

      if (successful.length > 0) {
        const newUrls = successful.map(r => r.url);
        setImageUrls([...imageUrls, ...newUrls]);
      }

      if (failed.length > 0) {
        const errorMessages = failed.map(r => r.error).join(', ');
        setError(`Erreurs: ${errorMessages}`);
      }
    } catch (err: any) {
      const errorMessage = err.message || "Erreur lors de l'upload des images";
      setError(errorMessage);
      console.error("Erreur upload:", err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileUpload(e.target.files);
    e.target.value = '';
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (isUploading) return;
    handleFileUpload(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleAddImageUrl = () => {
    const url = prompt("Entrez l'URL de l'image:");
    if (url && url.trim()) {
      setImageUrls([...imageUrls, url.trim()]);
    }
  };

  const handleRemoveImage = (index: number) => {
    setImageUrls(imageUrls.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setIsSaving(true);

    try {
      if (!formData.title.trim()) {
        setError("Le titre est requis");
        setIsSaving(false);
        return;
      }
      if (!formData.description.trim()) {
        setError("La description est requise");
        setIsSaving(false);
        return;
      }
      if (!formData.price || parseFloat(formData.price) <= 0) {
        setError("Le prix doit être supérieur à 0");
        setIsSaving(false);
        return;
      }
      if (!formData.city.trim()) {
        setError("La ville est requise");
        setIsSaving(false);
        return;
      }
      if (!formData.address.trim()) {
        setError("L'adresse est requise");
        setIsSaving(false);
        return;
      }

      const payload: any = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        price: parseFloat(formData.price),
        city: formData.city.trim(),
        area: formData.area.trim() || null,
        address: formData.address.trim(),
        postalCode: formData.postalCode.trim() || undefined,
        bedrooms: parseInt(formData.bedrooms) || 0,
        bathrooms: parseInt(formData.bathrooms) || 1,
        furnished: formData.furnished,
        petAllowed: formData.petAllowed,
        wifiIncluded: formData.wifiIncluded,
        heatingIncluded: formData.heatingIncluded,
        hotWaterIncluded: formData.hotWaterIncluded,
        electricityIncluded: formData.electricityIncluded,
        squareFootage: formData.squareFootage ? parseFloat(formData.squareFootage) : null,
        pool: formData.pool,
        gym: formData.gym,
        recreationRoom: formData.recreationRoom,
        elevator: formData.elevator,
        parkingIncluded: formData.parkingIncluded,
        parkingPaid: formData.parkingPaid,
        washerDryer: formData.washerDryer,
        airConditioning: formData.airConditioning,
        balcony: formData.balcony,
        yard: formData.yard,
        dishwasher: formData.dishwasher,
        refrigerator: formData.refrigerator,
        oven: formData.oven,
        microwave: formData.microwave,
        freezer: formData.freezer,
        stove: formData.stove,
        storage: formData.storage,
        security: formData.security,
        wheelchairAccessible: formData.wheelchairAccessible,
        images: imageUrls,
      };

      // Ajouter les coordonnées si disponibles (depuis l'autocomplétion)
      if (addressCoordinates && addressCoordinates.latitude && addressCoordinates.longitude) {
        payload.latitude = addressCoordinates.latitude;
        payload.longitude = addressCoordinates.longitude;
      }

      // Ajouter les URLs 3D seulement si elles ne sont pas vides
      if (formData.model3dUrl.trim()) {
        payload.model3dUrl = formData.model3dUrl.trim();
      } else {
        payload.model3dUrl = null;
      }
      if (formData.panoramaUrl.trim()) {
        payload.panoramaUrl = formData.panoramaUrl.trim();
      } else {
        payload.panoramaUrl = null;
      }
      if (formData.matterportUrl.trim()) {
        payload.matterportUrl = formData.matterportUrl.trim();
      } else {
        payload.matterportUrl = null;
      }
      if (formData.sketchfabUrl.trim()) {
        payload.sketchfabUrl = formData.sketchfabUrl.trim();
      } else {
        payload.sketchfabUrl = null;
      }

      // Ajouter les informations Marketplace
      if (formData.marketplaceUrl.trim()) {
        payload.marketplaceUrl = formData.marketplaceUrl.trim();
      } else {
        payload.marketplaceUrl = null;
      }
      if (formData.marketplaceId.trim()) {
        payload.marketplaceId = formData.marketplaceId.trim();
      } else {
        payload.marketplaceId = null;
      }
      if (formData.marketplaceAutoMessage.trim()) {
        payload.marketplaceAutoMessage = formData.marketplaceAutoMessage.trim();
      } else {
        payload.marketplaceAutoMessage = null;
      }
      payload.marketplaceAutoReplyEnabled = formData.marketplaceAutoReplyEnabled;

      const response = await fetch(`/api/listings/${listingId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      let data;
      try {
        data = await response.json();
      } catch (parseError) {
        setError("Une erreur est survenue. Veuillez réessayer.");
        setIsSaving(false);
        return;
      }

      if (!response.ok) {
        let errorMessage = data?.error || data?.message || "Erreur lors de la mise à jour de l'annonce";
        if (data?.details && Array.isArray(data.details)) {
          const validationErrors = data.details.map((err: any) => 
            `${err.path?.join('.') || 'champ'}: ${err.message}`
          ).join(', ');
          if (validationErrors) {
            errorMessage = `Erreur de validation: ${validationErrors}`;
          }
        }
        setError(errorMessage);
        setIsSaving(false);
        return;
      }
      
      setSuccess(true);
      setTimeout(() => {
        router.push("/landlord/listings");
      }, 1500);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Une erreur est survenue. Veuillez réessayer.";
      setError(errorMessage);
    } finally {
      setIsSaving(false);
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
          <div className="max-w-4xl mx-auto">
            <Link
              href="/landlord/listings"
              className="inline-flex items-center gap-2 text-gray-600 hover:text-violet-600 mb-6 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Retour aux annonces
            </Link>

            <h1 className="text-3xl font-bold mb-8 text-gray-900 flex items-center gap-3">
              <Home className="h-8 w-8 text-violet-600" />
              Modifier l'annonce
            </h1>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border-2 border-red-300 rounded-xl text-red-700 flex items-start gap-3">
                <div className="flex-1">
                  <p className="font-semibold">Erreur</p>
                  <p className="text-sm mt-1">{error}</p>
                </div>
                <button
                  onClick={() => setError(null)}
                  className="text-red-500 hover:text-red-700"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}

            {success && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl text-green-700">
                Annonce mise à jour avec succès ! Redirection...
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Informations de base */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Home className="h-5 w-5 text-slate-700" />
                    Informations de base
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                      Titre de l'annonce *
                    </label>
                    <Input
                      id="title"
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="Ex: Appartement moderne 2 chambres"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                      Description *
                    </label>
                    <textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Décrivez votre logement..."
                      className="w-full min-h-[120px] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-600"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
                        <DollarSign className="h-4 w-4 inline mr-1" />
                        Prix mensuel (CAD) *
                      </label>
                      <Input
                        id="price"
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                        placeholder="1500"
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
                        <MapPin className="h-4 w-4 inline mr-1" />
                        Ville *
                      </label>
                      <Input
                        id="city"
                        type="text"
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        placeholder="Montréal"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="area" className="block text-sm font-medium text-gray-700 mb-2">
                      Quartier
                    </label>
                    <Input
                      id="area"
                      type="text"
                      value={formData.area}
                      onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                      placeholder="Ex: Plateau Mont-Royal"
                    />
                  </div>

                  <div>
                    <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                      <MapPin className="h-4 w-4 inline mr-1" />
                      Adresse complète *
                    </label>
                    <AddressAutocomplete
                      value={formData.address}
                      onChange={(address, latitude, longitude, postalCode, area, city) => {
                        setFormData({ 
                          ...formData, 
                          address,
                          // Remplir automatiquement le code postal si disponible
                          postalCode: postalCode || formData.postalCode,
                          // Remplir automatiquement le quartier si disponible
                          area: area || formData.area,
                          // Remplir automatiquement la ville si disponible
                          city: city || formData.city
                        });
                        setAddressCoordinates({ latitude, longitude });
                      }}
                      placeholder="Rechercher une adresse (ex: 123 Rue Example, Montréal)"
                      required
                      city={formData.city}
                      area={formData.area}
                      postalCode={formData.postalCode}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Commencez à taper pour voir des suggestions d'adresses valides
                    </p>
                  </div>

                  <div>
                    <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700 mb-2">
                      <MapPin className="h-4 w-4 inline mr-1" />
                      Code postal (optionnel)
                    </label>
                    <Input
                      id="postalCode"
                      type="text"
                      value={formData.postalCode}
                      onChange={(e) => {
                        // Formater automatiquement le code postal (A1A 1A1)
                        let value = e.target.value.toUpperCase().replace(/[^A-Z0-9\s-]/g, '');
                        // Limiter à 7 caractères (A1A 1A1)
                        if (value.length > 7) value = value.slice(0, 7);
                        // Ajouter un espace après le 3ème caractère si nécessaire
                        if (value.length > 3 && value[3] !== ' ') {
                          value = value.slice(0, 3) + ' ' + value.slice(3);
                        }
                        setFormData({ ...formData, postalCode: value });
                      }}
                      placeholder="A1A 1A1"
                      maxLength={7}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Format canadien: A1A 1A1 (améliore la précision de la localisation sur la carte)
                    </p>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div>
                      <label htmlFor="bedrooms" className="block text-sm font-medium text-gray-700 mb-2">
                        <Bed className="h-4 w-4 inline mr-1" />
                        Chambres
                      </label>
                      <Input
                        id="bedrooms"
                        type="number"
                        min="0"
                        value={formData.bedrooms}
                        onChange={(e) => setFormData({ ...formData, bedrooms: e.target.value })}
                      />
                    </div>

                    <div>
                      <label htmlFor="bathrooms" className="block text-sm font-medium text-gray-700 mb-2">
                        <Bath className="h-4 w-4 inline mr-1" />
                        Salles de bain
                      </label>
                      <Input
                        id="bathrooms"
                        type="number"
                        min="1"
                        value={formData.bathrooms}
                        onChange={(e) => setFormData({ ...formData, bathrooms: e.target.value })}
                      />
                    </div>

                    <div>
                      <label htmlFor="squareFootage" className="block text-sm font-medium text-gray-700 mb-2">
                        Superficie (pi²)
                      </label>
                      <Input
                        id="squareFootage"
                        type="number"
                        min="0"
                        value={formData.squareFootage}
                        onChange={(e) => setFormData({ ...formData, squareFootage: e.target.value })}
                        placeholder="Ex: 1200"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Photos */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ImageIcon className="h-5 w-5 text-slate-700" />
                    Photos
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Uploader des photos
                    </label>
                    <div
                      onDrop={handleDrop}
                      onDragOver={handleDragOver}
                      className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                        isUploading
                          ? "border-gray-300 bg-gray-50"
                          : "border-gray-300 hover:border-violet-500 hover:bg-violet-50/50 cursor-pointer"
                      }`}
                    >
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleFileInputChange}
                        disabled={isUploading}
                        className="hidden"
                        id="file-upload"
                      />
                      <label
                        htmlFor="file-upload"
                        className="cursor-pointer flex flex-col items-center gap-2"
                      >
                        <Upload className={`h-8 w-8 ${isUploading ? "text-gray-400 animate-pulse" : "text-gray-400"}`} />
                        <span className="text-sm text-gray-600">
                          {isUploading ? (
                            <span className="flex items-center gap-2">
                              <span className="animate-spin">⏳</span>
                              Upload en cours...
                            </span>
                          ) : (
                            "Cliquez pour uploader ou glissez-déposez des images"
                          )}
                        </span>
                        {!isUploading && (
                          <span className="text-xs text-gray-500 mt-1">
                            Formats acceptés: JPG, PNG, GIF (max 5MB par image)
                          </span>
                        )}
                      </label>
                    </div>
                  </div>

                  <div>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleAddImageUrl}
                      className="w-full"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Ajouter une image par URL
                    </Button>
                  </div>

                  {imageUrls.length > 0 && (
                    <div className="grid grid-cols-3 gap-4">
                      {imageUrls.map((url, index) => (
                        <div key={index} className="relative group">
                          <div className="aspect-square relative rounded-lg overflow-hidden border-2 border-gray-200">
                            <Image
                              src={url}
                              alt={`Image ${index + 1}`}
                              fill
                              className="object-cover"
                              sizes="(max-width: 768px) 33vw, 200px"
                            />
                            <button
                              type="button"
                              onClick={() => handleRemoveImage(index)}
                              className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Options */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Home className="h-5 w-5 text-slate-700" />
                    Options
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-8">
                    {/* Services publics */}
                    <div>
                      <h4 className="text-sm font-medium text-neutral-500 uppercase tracking-wide mb-4">Services publics</h4>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <label className={`flex items-center gap-3 cursor-pointer p-3 rounded-lg transition-all bg-blue-50 border border-blue-200 ${
                          formData.wifiIncluded ? "opacity-100" : "opacity-50 hover:opacity-70"
                        }`}>
                          <input
                            type="checkbox"
                            checked={formData.wifiIncluded}
                            onChange={(e) => setFormData({ ...formData, wifiIncluded: e.target.checked })}
                            className="rounded w-4 h-4 text-blue-600 focus:ring-blue-500"
                          />
                          <Wifi className="h-5 w-5 text-blue-600" />
                          <span className="text-sm font-medium text-blue-700">WiFi inclus</span>
                        </label>

                        <label className={`flex items-center gap-3 cursor-pointer p-3 rounded-lg transition-all bg-red-50 border border-red-200 ${
                          formData.heatingIncluded ? "opacity-100" : "opacity-50 hover:opacity-70"
                        }`}>
                          <input
                            type="checkbox"
                            checked={formData.heatingIncluded}
                            onChange={(e) => setFormData({ ...formData, heatingIncluded: e.target.checked })}
                            className="rounded w-4 h-4 text-red-600 focus:ring-red-500"
                          />
                          <Flame className="h-5 w-5 text-red-600" />
                          <span className="text-sm font-medium text-red-700">Chauffage inclus</span>
                        </label>

                        <label className={`flex items-center gap-3 cursor-pointer p-3 rounded-lg transition-all bg-cyan-50 border border-cyan-200 ${
                          formData.hotWaterIncluded ? "opacity-100" : "opacity-50 hover:opacity-70"
                        }`}>
                          <input
                            type="checkbox"
                            checked={formData.hotWaterIncluded}
                            onChange={(e) => setFormData({ ...formData, hotWaterIncluded: e.target.checked })}
                            className="rounded w-4 h-4 text-cyan-600 focus:ring-cyan-500"
                          />
                          <Droplet className="h-5 w-5 text-cyan-600" />
                          <span className="text-sm font-medium text-cyan-700">Eau chaude incluse</span>
                        </label>

                        <label className={`flex items-center gap-3 cursor-pointer p-3 rounded-lg transition-all bg-yellow-50 border border-yellow-200 ${
                          formData.electricityIncluded ? "opacity-100" : "opacity-50 hover:opacity-70"
                        }`}>
                          <input
                            type="checkbox"
                            checked={formData.electricityIncluded}
                            onChange={(e) => setFormData({ ...formData, electricityIncluded: e.target.checked })}
                            className="rounded w-4 h-4 text-yellow-600 focus:ring-yellow-500"
                          />
                          <Zap className="h-5 w-5 text-yellow-600" />
                          <span className="text-sm font-medium text-yellow-700">Électricité incluse</span>
                        </label>
                      </div>
                    </div>

                    {/* Caractéristiques du bâtiment */}
                    <div>
                      <h4 className="text-sm font-medium text-neutral-500 uppercase tracking-wide mb-4">Caractéristiques du bâtiment</h4>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <label className={`flex items-center gap-3 cursor-pointer p-3 rounded-lg transition-all bg-blue-50 border border-blue-200 ${
                          formData.pool ? "opacity-100" : "opacity-50 hover:opacity-70"
                        }`}>
                          <input
                            type="checkbox"
                            checked={formData.pool}
                            onChange={(e) => setFormData({ ...formData, pool: e.target.checked })}
                            className="rounded w-4 h-4 text-blue-600 focus:ring-blue-500"
                          />
                          <Waves className="h-5 w-5 text-blue-600" />
                          <span className="text-sm font-medium text-blue-700">Piscine</span>
                        </label>

                        <label className={`flex items-center gap-3 cursor-pointer p-3 rounded-lg transition-all bg-orange-50 border border-orange-200 ${
                          formData.gym ? "opacity-100" : "opacity-50 hover:opacity-70"
                        }`}>
                          <input
                            type="checkbox"
                            checked={formData.gym}
                            onChange={(e) => setFormData({ ...formData, gym: e.target.checked })}
                            className="rounded w-4 h-4 text-orange-600 focus:ring-orange-500"
                          />
                          <Dumbbell className="h-5 w-5 text-orange-600" />
                          <span className="text-sm font-medium text-orange-700">Salle de sport</span>
                        </label>

                        <label className={`flex items-center gap-3 cursor-pointer p-3 rounded-lg transition-all bg-pink-50 border border-pink-200 ${
                          formData.recreationRoom ? "opacity-100" : "opacity-50 hover:opacity-70"
                        }`}>
                          <input
                            type="checkbox"
                            checked={formData.recreationRoom}
                            onChange={(e) => setFormData({ ...formData, recreationRoom: e.target.checked })}
                            className="rounded w-4 h-4 text-pink-600 focus:ring-pink-500"
                          />
                          <Gamepad2 className="h-5 w-5 text-pink-600" />
                          <span className="text-sm font-medium text-pink-700">Salle de loisirs</span>
                        </label>

                        <label className={`flex items-center gap-3 cursor-pointer p-3 rounded-lg transition-all bg-gray-50 border border-gray-200 ${
                          formData.elevator ? "opacity-100" : "opacity-50 hover:opacity-70"
                        }`}>
                          <input
                            type="checkbox"
                            checked={formData.elevator}
                            onChange={(e) => setFormData({ ...formData, elevator: e.target.checked })}
                            className="rounded w-4 h-4 text-gray-600 focus:ring-gray-500"
                          />
                          <ArrowUpDown className="h-5 w-5 text-gray-600" />
                          <span className="text-sm font-medium text-gray-700">Ascenseur</span>
                        </label>

                        <label className={`flex items-center gap-3 cursor-pointer p-3 rounded-lg transition-all bg-red-50 border border-red-200 ${
                          formData.security ? "opacity-100" : "opacity-50 hover:opacity-70"
                        }`}>
                          <input
                            type="checkbox"
                            checked={formData.security}
                            onChange={(e) => setFormData({ ...formData, security: e.target.checked })}
                            className="rounded w-4 h-4 text-red-600 focus:ring-red-500"
                          />
                          <Lock className="h-5 w-5 text-red-600" />
                          <span className="text-sm font-medium text-red-700">Sécurité</span>
                        </label>

                        <label className={`flex items-center gap-3 cursor-pointer p-3 rounded-lg transition-all bg-teal-50 border border-teal-200 ${
                          formData.wheelchairAccessible ? "opacity-100" : "opacity-50 hover:opacity-70"
                        }`}>
                          <input
                            type="checkbox"
                            checked={formData.wheelchairAccessible}
                            onChange={(e) => setFormData({ ...formData, wheelchairAccessible: e.target.checked })}
                            className="rounded w-4 h-4 text-teal-600 focus:ring-teal-500"
                          />
                          <Accessibility className="h-5 w-5 text-teal-600" />
                          <span className="text-sm font-medium text-teal-700">Accès handicapé</span>
                        </label>
                      </div>
                    </div>

                    {/* Stationnement */}
                    <div>
                      <h4 className="text-sm font-medium text-neutral-500 uppercase tracking-wide mb-4">Stationnement</h4>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <label className={`flex items-center gap-3 cursor-pointer p-3 rounded-lg transition-all bg-green-50 border border-green-200 ${
                          formData.parkingIncluded ? "opacity-100" : "opacity-50 hover:opacity-70"
                        }`}>
                          <input
                            type="checkbox"
                            checked={formData.parkingIncluded}
                            onChange={(e) => setFormData({ ...formData, parkingIncluded: e.target.checked })}
                            className="rounded w-4 h-4 text-green-600 focus:ring-green-500"
                          />
                          <Car className="h-5 w-5 text-green-600" />
                          <span className="text-sm font-medium text-green-700">
                            Garage inclus
                          </span>
                        </label>

                        <label className={`flex items-center gap-3 cursor-pointer p-3 rounded-lg transition-all bg-amber-100 border-2 border-amber-300 ${
                          formData.parkingPaid ? "opacity-100 ring-2 ring-amber-200" : "opacity-50 hover:opacity-70"
                        }`}>
                          <input
                            type="checkbox"
                            checked={formData.parkingPaid}
                            onChange={(e) => setFormData({ ...formData, parkingPaid: e.target.checked })}
                            className="rounded w-4 h-4 text-amber-600 focus:ring-amber-500"
                          />
                          <Car className="h-5 w-5 text-amber-700" />
                          <span className="text-sm font-medium text-amber-800">
                            Garage payant
                          </span>
                          {formData.parkingPaid && (
                            <span className="ml-auto text-xs bg-amber-200 text-amber-800 px-2 py-1 rounded-full font-semibold">
                              Payant
                            </span>
                          )}
                        </label>
                      </div>
                    </div>

                    {/* Électroménagers */}
                    <div>
                      <h4 className="text-sm font-medium text-neutral-500 uppercase tracking-wide mb-4">Électroménagers</h4>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <label className={`flex items-center gap-3 cursor-pointer p-3 rounded-lg transition-all bg-indigo-50 border border-indigo-200 ${
                          formData.washerDryer ? "opacity-100" : "opacity-50 hover:opacity-70"
                        }`}>
                          <input
                            type="checkbox"
                            checked={formData.washerDryer}
                            onChange={(e) => setFormData({ ...formData, washerDryer: e.target.checked })}
                            className="rounded w-4 h-4 text-indigo-600 focus:ring-indigo-500"
                          />
                          <Package className="h-5 w-5 text-indigo-600" />
                          <span className="text-sm font-medium text-indigo-700">Laveuse/sécheuse</span>
                        </label>

                        <label className={`flex items-center gap-3 cursor-pointer p-3 rounded-lg transition-all bg-violet-50 border border-violet-200 ${
                          formData.dishwasher ? "opacity-100" : "opacity-50 hover:opacity-70"
                        }`}>
                          <input
                            type="checkbox"
                            checked={formData.dishwasher}
                            onChange={(e) => setFormData({ ...formData, dishwasher: e.target.checked })}
                            className="rounded w-4 h-4 text-violet-600 focus:ring-violet-500"
                          />
                          <Sparkles className="h-5 w-5 text-violet-600" />
                          <span className="text-sm font-medium text-violet-700">Lave-vaisselle</span>
                        </label>

                        <label className={`flex items-center gap-3 cursor-pointer p-3 rounded-lg transition-all bg-blue-50 border border-blue-200 ${
                          formData.refrigerator ? "opacity-100" : "opacity-50 hover:opacity-70"
                        }`}>
                          <input
                            type="checkbox"
                            checked={formData.refrigerator}
                            onChange={(e) => setFormData({ ...formData, refrigerator: e.target.checked })}
                            className="rounded w-4 h-4 text-blue-600 focus:ring-blue-500"
                          />
                          <Box className="h-5 w-5 text-blue-600" />
                          <span className="text-sm font-medium text-blue-700">Réfrigérateur</span>
                        </label>

                        <label className={`flex items-center gap-3 cursor-pointer p-3 rounded-lg transition-all bg-orange-50 border border-orange-200 ${
                          formData.oven ? "opacity-100" : "opacity-50 hover:opacity-70"
                        }`}>
                          <input
                            type="checkbox"
                            checked={formData.oven}
                            onChange={(e) => setFormData({ ...formData, oven: e.target.checked })}
                            className="rounded w-4 h-4 text-orange-600 focus:ring-orange-500"
                          />
                          <Flame className="h-5 w-5 text-orange-600" />
                          <span className="text-sm font-medium text-orange-700">Four</span>
                        </label>

                        <label className={`flex items-center gap-3 cursor-pointer p-3 rounded-lg transition-all bg-pink-50 border border-pink-200 ${
                          formData.microwave ? "opacity-100" : "opacity-50 hover:opacity-70"
                        }`}>
                          <input
                            type="checkbox"
                            checked={formData.microwave}
                            onChange={(e) => setFormData({ ...formData, microwave: e.target.checked })}
                            className="rounded w-4 h-4 text-pink-600 focus:ring-pink-500"
                          />
                          <Box className="h-5 w-5 text-pink-600" />
                          <span className="text-sm font-medium text-pink-700">Micro-ondes</span>
                        </label>

                        <label className={`flex items-center gap-3 cursor-pointer p-3 rounded-lg transition-all bg-cyan-50 border border-cyan-200 ${
                          formData.freezer ? "opacity-100" : "opacity-50 hover:opacity-70"
                        }`}>
                          <input
                            type="checkbox"
                            checked={formData.freezer}
                            onChange={(e) => setFormData({ ...formData, freezer: e.target.checked })}
                            className="rounded w-4 h-4 text-cyan-600 focus:ring-cyan-500"
                          />
                          <Package className="h-5 w-5 text-cyan-600" />
                          <span className="text-sm font-medium text-cyan-700">Congélateur</span>
                        </label>

                        <label className={`flex items-center gap-3 cursor-pointer p-3 rounded-lg transition-all bg-red-50 border border-red-200 ${
                          formData.stove ? "opacity-100" : "opacity-50 hover:opacity-70"
                        }`}>
                          <input
                            type="checkbox"
                            checked={formData.stove}
                            onChange={(e) => setFormData({ ...formData, stove: e.target.checked })}
                            className="rounded w-4 h-4 text-red-600 focus:ring-red-500"
                          />
                          <Utensils className="h-5 w-5 text-red-600" />
                          <span className="text-sm font-medium text-red-700">Plaque de cuisson</span>
                        </label>

                        <label className={`flex items-center gap-3 cursor-pointer p-3 rounded-lg transition-all bg-sky-50 border border-sky-200 ${
                          formData.airConditioning ? "opacity-100" : "opacity-50 hover:opacity-70"
                        }`}>
                          <input
                            type="checkbox"
                            checked={formData.airConditioning}
                            onChange={(e) => setFormData({ ...formData, airConditioning: e.target.checked })}
                            className="rounded w-4 h-4 text-sky-600 focus:ring-sky-500"
                          />
                          <Wind className="h-5 w-5 text-sky-600" />
                          <span className="text-sm font-medium text-sky-700">Climatisation</span>
                        </label>
                      </div>
                    </div>

                    {/* Extérieur */}
                    <div>
                      <h4 className="text-sm font-medium text-neutral-500 uppercase tracking-wide mb-4">Extérieur</h4>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <label className={`flex items-center gap-3 cursor-pointer p-3 rounded-lg transition-all bg-emerald-50 border border-emerald-200 ${
                          formData.balcony ? "opacity-100" : "opacity-50 hover:opacity-70"
                        }`}>
                          <input
                            type="checkbox"
                            checked={formData.balcony}
                            onChange={(e) => setFormData({ ...formData, balcony: e.target.checked })}
                            className="rounded w-4 h-4 text-emerald-600 focus:ring-emerald-500"
                          />
                          <Home className="h-5 w-5 text-emerald-600" />
                          <span className="text-sm font-medium text-emerald-700">Balcon/terrasse</span>
                        </label>

                        <label className={`flex items-center gap-3 cursor-pointer p-3 rounded-lg transition-all bg-green-50 border border-green-200 ${
                          formData.yard ? "opacity-100" : "opacity-50 hover:opacity-70"
                        }`}>
                          <input
                            type="checkbox"
                            checked={formData.yard}
                            onChange={(e) => setFormData({ ...formData, yard: e.target.checked })}
                            className="rounded w-4 h-4 text-green-600 focus:ring-green-500"
                          />
                          <TreePine className="h-5 w-5 text-green-600" />
                          <span className="text-sm font-medium text-green-700">Jardin/cour</span>
                        </label>
                      </div>
                    </div>

                    {/* Autres */}
                    <div>
                      <h4 className="text-sm font-medium text-neutral-500 uppercase tracking-wide mb-4">Autres</h4>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <label className={`flex items-center gap-3 cursor-pointer p-3 rounded-lg transition-all bg-amber-50 border border-amber-200 ${
                          formData.furnished ? "opacity-100" : "opacity-50 hover:opacity-70"
                        }`}>
                          <input
                            type="checkbox"
                            checked={formData.furnished}
                            onChange={(e) => setFormData({ ...formData, furnished: e.target.checked })}
                            className="rounded w-4 h-4 text-amber-600 focus:ring-amber-500"
                          />
                          <Home className="h-5 w-5 text-amber-600" />
                          <span className="text-sm font-medium text-amber-700">Meublé</span>
                        </label>

                        <label className={`flex items-center gap-3 cursor-pointer p-3 rounded-lg transition-all bg-purple-50 border border-purple-200 ${
                          formData.petAllowed ? "opacity-100" : "opacity-50 hover:opacity-70"
                        }`}>
                          <input
                            type="checkbox"
                            checked={formData.petAllowed}
                            onChange={(e) => setFormData({ ...formData, petAllowed: e.target.checked })}
                            className="rounded w-4 h-4 text-purple-600 focus:ring-purple-500"
                          />
                          <Dog className="h-5 w-5 text-purple-600" />
                          <span className="text-sm font-medium text-purple-700">Animaux acceptés</span>
                        </label>

                        <label className={`flex items-center gap-3 cursor-pointer p-3 rounded-lg transition-all bg-slate-50 border border-slate-200 ${
                          formData.storage ? "opacity-100" : "opacity-50 hover:opacity-70"
                        }`}>
                          <input
                            type="checkbox"
                            checked={formData.storage}
                            onChange={(e) => setFormData({ ...formData, storage: e.target.checked })}
                            className="rounded w-4 h-4 text-slate-600 focus:ring-slate-500"
                          />
                          <Home className="h-5 w-5 text-slate-600" />
                          <span className="text-sm font-medium text-slate-700">Cave/entreposage</span>
                        </label>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Modèles 3D */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Box className="h-5 w-5 text-slate-700" />
                    Modèles 3D (optionnel)
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label htmlFor="model3dUrl" className="block text-sm font-medium text-gray-700 mb-2">
                      URL Modèle 3D
                    </label>
                    <Input
                      id="model3dUrl"
                      type="url"
                      value={formData.model3dUrl}
                      onChange={(e) => setFormData({ ...formData, model3dUrl: e.target.value })}
                      placeholder="https://..."
                    />
                  </div>

                  <div>
                    <label htmlFor="panoramaUrl" className="block text-sm font-medium text-gray-700 mb-2">
                      URL Panorama
                    </label>
                    <Input
                      id="panoramaUrl"
                      type="url"
                      value={formData.panoramaUrl}
                      onChange={(e) => setFormData({ ...formData, panoramaUrl: e.target.value })}
                      placeholder="https://..."
                    />
                  </div>

                  <div>
                    <label htmlFor="matterportUrl" className="block text-sm font-medium text-gray-700 mb-2">
                      URL Matterport
                    </label>
                    <Input
                      id="matterportUrl"
                      type="url"
                      value={formData.matterportUrl}
                      onChange={(e) => setFormData({ ...formData, matterportUrl: e.target.value })}
                      placeholder="https://..."
                    />
                  </div>

                  <div>
                    <label htmlFor="sketchfabUrl" className="block text-sm font-medium text-gray-700 mb-2">
                      URL Sketchfab
                    </label>
                    <Input
                      id="sketchfabUrl"
                      type="url"
                      value={formData.sketchfabUrl}
                      onChange={(e) => setFormData({ ...formData, sketchfabUrl: e.target.value })}
                      placeholder="https://..."
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Marketplace */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-slate-700" />
                    Facebook Marketplace
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <Label htmlFor="marketplace-auto-reply" className="text-base font-medium text-gray-900 cursor-pointer">
                        Activer les réponses automatiques pour cette annonce
                      </Label>
                      <p className="text-sm text-gray-600 mt-1">
                        Envoie automatiquement le message ci-dessous aux personnes intéressées par cette annonce sur Facebook Marketplace
                      </p>
                    </div>
                    <Switch
                      checked={formData.marketplaceAutoReplyEnabled}
                      onCheckedChange={(checked) => 
                        setFormData({ ...formData, marketplaceAutoReplyEnabled: checked })
                      }
                    />
                  </div>

                  {formData.marketplaceAutoReplyEnabled && (
                    <>
                      <div>
                        <Label htmlFor="marketplaceUrl" className="block text-sm font-medium text-gray-700 mb-2">
                          URL de l'annonce Marketplace (optionnel)
                        </Label>
                        <Input
                          id="marketplaceUrl"
                          type="url"
                          value={formData.marketplaceUrl}
                          onChange={(e) => setFormData({ ...formData, marketplaceUrl: e.target.value })}
                          placeholder="https://www.facebook.com/marketplace/item/..."
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Lien vers votre annonce sur Facebook Marketplace
                        </p>
                      </div>

                      <div>
                        <Label htmlFor="marketplaceId" className="block text-sm font-medium text-gray-700 mb-2">
                          ID de l'annonce Marketplace (optionnel)
                        </Label>
                        <Input
                          id="marketplaceId"
                          type="text"
                          value={formData.marketplaceId}
                          onChange={(e) => setFormData({ ...formData, marketplaceId: e.target.value })}
                          placeholder="1234567890"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Identifiant unique de l'annonce (si disponible)
                        </p>
                      </div>

                      <div>
                        <Label htmlFor="marketplaceAutoMessage" className="block text-sm font-medium text-gray-700 mb-2">
                          Message automatique pour cette publication
                        </Label>
                        <Textarea
                          id="marketplaceAutoMessage"
                          value={formData.marketplaceAutoMessage}
                          onChange={(e) => setFormData({ ...formData, marketplaceAutoMessage: e.target.value })}
                          placeholder="Votre message automatique avec [LIEN] comme placeholder pour le lien MyRent"
                          rows={6}
                          className="resize-none"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Utilisez <code className="bg-gray-100 px-1 rounded">[LIEN]</code> pour insérer automatiquement le lien vers cette annonce MyRent. Ce message sera utilisé pour les réponses automatiques sur Facebook Marketplace.
                        </p>
                      </div>
                      <div className="mt-3 p-4 bg-blue-50 border border-blue-200 rounded-lg space-y-3">
                      <div>
                        <p className="text-sm font-semibold text-blue-900 mb-2">📋 Étapes pour configurer :</p>
                        <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside ml-2">
                          <li>Cliquez sur "📋 Copier le message complet" ci-dessous (le lien sera déjà remplacé)</li>
                          <li>Allez sur <a href="https://business.facebook.com" target="_blank" rel="noopener noreferrer" className="underline font-medium">Facebook Business Suite</a></li>
                          <li>Inbox → Paramètres → Réponses automatiques</li>
                          <li>Activez "Réponses instantanées" et collez votre message</li>
                          <li>Sauvegardez</li>
                        </ol>
                      </div>
                      <div className="pt-2 border-t border-blue-200">
                        <p className="text-xs font-medium text-blue-900 mb-2">💾 Copier le message complet :</p>
                        <button
                          type="button"
                          onClick={() => {
                            const link = `${typeof window !== 'undefined' ? window.location.origin : ''}/listings/${listingId}`;
                            const message = formData.marketplaceAutoMessage || '';
                            const messageWithLink = message.replace(/\[LIEN\]/g, link);
                            
                            if (messageWithLink.trim()) {
                              navigator.clipboard.writeText(messageWithLink);
                              alert('✅ Message complet copié dans le presse-papiers !\n\nVous pouvez maintenant le coller directement dans Facebook Business Suite.');
                            } else {
                              alert('⚠️ Veuillez d\'abord remplir le message automatique ci-dessus.');
                            }
                          }}
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                        >
                          📋 Copier le message complet (avec lien)
                        </button>
                        <p className="text-xs text-blue-700 mt-2">
                          Le message avec le lien MyRent déjà remplacé sera copié. Collez-le directement dans Facebook Business Suite.
                        </p>
                      </div>
                      <div className="pt-2 border-t border-blue-200">
                        <p className="text-xs font-medium text-blue-900 mb-1">Lien MyRent pour cette annonce :</p>
                        <code className="block bg-white px-2 py-1 rounded text-xs text-blue-900 break-all">
                          {typeof window !== 'undefined' ? window.location.origin : ''}/listings/{listingId}
                        </code>
                        <button
                          type="button"
                          onClick={() => {
                            const link = `${typeof window !== 'undefined' ? window.location.origin : ''}/listings/${listingId}`;
                            navigator.clipboard.writeText(link);
                            alert('Lien copié dans le presse-papiers !');
                          }}
                          className="mt-2 text-xs text-blue-600 hover:text-blue-800 underline"
                        >
                          📋 Copier uniquement le lien
                        </button>
                      </div>
                      <div className="pt-2 border-t border-blue-200">
                        <a
                          href="/GUIDE_FACEBOOK_BUSINESS_SUITE.md"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 font-medium"
                        >
                          📖 Voir le guide complet
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    </div>
                    </>
                  )}
                </CardContent>
              </Card>

              <div className="flex justify-end gap-4">
                <Link href="/landlord/listings">
                  <Button type="button" variant="ghost">
                    Annuler
                  </Button>
                </Link>
                <Button
                  type="submit"
                  disabled={isSaving}
                  className="bg-slate-700 hover:bg-slate-800 text-white"
                >
                  {isSaving ? (
                    <>
                      <span className="animate-spin mr-2">⏳</span>
                      Enregistrement...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Enregistrer les modifications
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </>
  );
}
