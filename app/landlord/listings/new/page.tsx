"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  Car,
  Dog,
  Box
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { AddressAutocomplete } from "@/components/address-autocomplete";

export default function NewListingPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
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
    model3dUrl: "",
    panoramaUrl: "",
    matterportUrl: "",
    sketchfabUrl: "",
  });
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [addressCoordinates, setAddressCoordinates] = useState<{ latitude: number; longitude: number } | null>(null);

  useEffect(() => {
    if (!authLoading && (!user || user.role !== "LANDLORD")) {
      router.push("/auth/signin");
    }
  }, [user, authLoading, router]);

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
    // Réinitialiser l'input pour permettre de sélectionner le même fichier à nouveau
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
      }
      if (formData.panoramaUrl.trim()) {
        payload.panoramaUrl = formData.panoramaUrl.trim();
      }
      if (formData.matterportUrl.trim()) {
        payload.matterportUrl = formData.matterportUrl.trim();
      }
      if (formData.sketchfabUrl.trim()) {
        payload.sketchfabUrl = formData.sketchfabUrl.trim();
      }

      const response = await fetch("/api/listings", {
        method: "POST",
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
        let errorMessage = data?.error || data?.message || "Erreur lors de la création de l'annonce";
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

  if (authLoading) {
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
              <Plus className="h-8 w-8 text-violet-600" />
              Créer une annonce
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
                Annonce créée avec succès ! Redirection...
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Informations de base */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Home className="h-5 w-5 text-violet-600" />
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
                        step="50"
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

                  <div className="grid grid-cols-2 gap-4">
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
                  </div>
                </CardContent>
              </Card>

              {/* Photos */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ImageIcon className="h-5 w-5 text-violet-600" />
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
                    <Home className="h-5 w-5 text-violet-600" />
                    Options
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.furnished}
                        onChange={(e) => setFormData({ ...formData, furnished: e.target.checked })}
                        className="rounded"
                      />
                      <span className="text-sm text-gray-700">Meublé</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.petAllowed}
                        onChange={(e) => setFormData({ ...formData, petAllowed: e.target.checked })}
                        className="rounded"
                      />
                      <Dog className="h-4 w-4 text-gray-600" />
                      <span className="text-sm text-gray-700">Animaux acceptés</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.wifiIncluded}
                        onChange={(e) => setFormData({ ...formData, wifiIncluded: e.target.checked })}
                        className="rounded"
                      />
                      <Wifi className="h-4 w-4 text-gray-600" />
                      <span className="text-sm text-gray-700">WiFi inclus</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.heatingIncluded}
                        onChange={(e) => setFormData({ ...formData, heatingIncluded: e.target.checked })}
                        className="rounded"
                      />
                      <Flame className="h-4 w-4 text-gray-600" />
                      <span className="text-sm text-gray-700">Chauffage inclus</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.hotWaterIncluded}
                        onChange={(e) => setFormData({ ...formData, hotWaterIncluded: e.target.checked })}
                        className="rounded"
                      />
                      <Droplet className="h-4 w-4 text-gray-600" />
                      <span className="text-sm text-gray-700">Eau chaude incluse</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.electricityIncluded}
                        onChange={(e) => setFormData({ ...formData, electricityIncluded: e.target.checked })}
                        className="rounded"
                      />
                      <Zap className="h-4 w-4 text-gray-600" />
                      <span className="text-sm text-gray-700">Électricité incluse</span>
                    </label>
                  </div>
                </CardContent>
              </Card>

              {/* Modèles 3D */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Box className="h-5 w-5 text-violet-600" />
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

              <div className="flex justify-end gap-4">
                <Link href="/landlord/listings">
                  <Button type="button" variant="ghost">
                    Annuler
                  </Button>
                </Link>
                <Button
                  type="submit"
                  disabled={isSaving}
                  className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white"
                >
                  {isSaving ? (
                    <>
                      <span className="animate-spin mr-2">⏳</span>
                      Création...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Créer l'annonce
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
