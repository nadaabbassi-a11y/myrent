"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
  ArrowRight,
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
  Box,
  MessageSquare,
  ExternalLink,
  CheckCircle,
  ChevronRight,
  Waves,
  Dumbbell,
  Gamepad2,
  ArrowUpDown,
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
import { motion, AnimatePresence } from "framer-motion";

const STEPS = [
  { key: "basics", number: 1, label: "Informations de base", icon: Home },
  { key: "location", number: 2, label: "Localisation", icon: MapPin },
  { key: "features", number: 3, label: "Caractéristiques", icon: Bed },
  { key: "photos", number: 4, label: "Photos", icon: ImageIcon },
  { key: "3d", number: 5, label: "Modèles 3D", icon: Box },
  { key: "marketplace", number: 6, label: "Marketplace", icon: MessageSquare },
];

export default function NewListingPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
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
    squareFootage: "",
    furnished: false,
    petAllowed: false,
    wifiIncluded: false,
    heatingIncluded: false,
    hotWaterIncluded: false,
    electricityIncluded: false,
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
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [expandedHelp, setExpandedHelp] = useState<string | null>(null);

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
          if (!file.type.startsWith('image/')) {
            throw new Error(`${file.name} n'est pas une image`);
          }

          const maxSize = 5 * 1024 * 1024;
          if (file.size > maxSize) {
            throw new Error(`${file.name} est trop volumineux (max 5MB)`);
          }

          const formData = new FormData();
          formData.append('file', file);

          const response = await fetch('/api/upload', {
            method: 'POST',
            body: formData,
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `Erreur lors de l'upload de ${file.name}`);
          }

          const data = await response.json();
          return data.url;
        } catch (err) {
          console.error(`Erreur upload ${file.name}:`, err);
          throw err;
        }
      });

      const uploadedUrls = await Promise.all(uploadPromises);
      setImageUrls(prev => [...prev, ...uploadedUrls]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erreur lors de l'upload";
      setError(errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileUpload(e.target.files);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    handleFileUpload(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
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

  const validateStep = (stepIndex: number): boolean => {
    const step = STEPS[stepIndex];
    if (!step) return false;

    switch (step.key) {
      case "basics":
        return !!(formData.title.trim() && formData.description.trim() && formData.price);
      case "location":
        return !!(formData.address.trim() && formData.city.trim());
      case "features":
        return true; // Always valid
      case "photos":
        return true; // Optional
      case "3d":
        return true; // Optional
      case "marketplace":
        return true; // Optional
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (!completedSteps.includes(currentStep)) {
        setCompletedSteps([...completedSteps, currentStep]);
      }
      if (currentStep < STEPS.length - 1) {
        setCurrentStep(currentStep + 1);
      }
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
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

      if (addressCoordinates && addressCoordinates.latitude && addressCoordinates.longitude) {
        payload.latitude = addressCoordinates.latitude;
        payload.longitude = addressCoordinates.longitude;
      }

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

      if (formData.marketplaceUrl.trim()) {
        payload.marketplaceUrl = formData.marketplaceUrl.trim();
      }
      if (formData.marketplaceId.trim()) {
        payload.marketplaceId = formData.marketplaceId.trim();
      }
      if (formData.marketplaceAutoMessage.trim()) {
        payload.marketplaceAutoMessage = formData.marketplaceAutoMessage.trim();
      }
      payload.marketplaceAutoReplyEnabled = formData.marketplaceAutoReplyEnabled;

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
      // Ne pas rediriger automatiquement - laisser l'utilisateur voir le message de succès
      // et décider quand continuer
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
        <main className="min-h-screen bg-white py-12">
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

  const progress = ((currentStep + 1) / STEPS.length) * 100;
  const currentStepData = STEPS[currentStep];
  const StepIcon = currentStepData?.icon || Home;

  const renderStepContent = () => {
    switch (currentStepData?.key) {
      case "basics":
        return (
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-light text-neutral-900 mb-2">
                Informations de base
              </h2>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <Label htmlFor="title" className="text-sm font-light text-neutral-600 mb-2 block">
                Titre de l'annonce *
              </Label>
              <Input
                id="title"
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Ex: Appartement moderne 2 chambres"
                className="h-14 text-lg font-light border-neutral-200 focus:border-neutral-900 focus:ring-neutral-900 rounded-xl"
                required
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              <Label htmlFor="description" className="text-sm font-light text-neutral-600 mb-2 block">
                Description *
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Décrivez votre logement..."
                rows={6}
                className="text-lg font-light border-neutral-200 focus:border-neutral-900 focus:ring-neutral-900 resize-none rounded-xl"
                required
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              <Label htmlFor="price" className="text-sm font-light text-neutral-600 mb-2 block">
                Prix mensuel (CAD) *
              </Label>
              <Input
                id="price"
                type="number"
                min="0"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="1500"
                className="h-14 text-2xl font-light border-neutral-200 focus:border-neutral-900 focus:ring-neutral-900 rounded-xl"
                required
              />
            </motion.div>
          </div>
        );

      case "location":
        return (
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-light text-neutral-900 mb-2">
                Localisation
              </h2>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <Label htmlFor="address" className="text-sm font-light text-neutral-600 mb-2 block">
                Adresse complète *
              </Label>
              <AddressAutocomplete
                value={formData.address}
                onChange={(address, latitude, longitude, postalCode, area, city) => {
                  setFormData({ 
                    ...formData, 
                    address,
                    postalCode: postalCode || formData.postalCode,
                    area: area || formData.area,
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
            </motion.div>

            <div className="grid grid-cols-2 gap-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
              >
                <Label htmlFor="city" className="text-sm font-light text-neutral-600 mb-2 block">
                  Ville *
                </Label>
                <Input
                  id="city"
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  placeholder="Montréal"
                  className="h-14 text-lg font-light border-neutral-200 focus:border-neutral-900 focus:ring-neutral-900 rounded-xl"
                  required
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
              >
                <Label htmlFor="postalCode" className="text-sm font-light text-neutral-600 mb-2 block">
                  Code postal
                </Label>
                <Input
                  id="postalCode"
                  type="text"
                  value={formData.postalCode}
                  onChange={(e) => {
                    let value = e.target.value.toUpperCase().replace(/[^A-Z0-9\s-]/g, '');
                    if (value.length > 7) value = value.slice(0, 7);
                    if (value.length > 3 && value[3] !== ' ') {
                      value = value.slice(0, 3) + ' ' + value.slice(3);
                    }
                    setFormData({ ...formData, postalCode: value });
                  }}
                  placeholder="A1A 1A1"
                  maxLength={7}
                  className="h-14 text-lg font-light border-neutral-200 focus:border-neutral-900 focus:ring-neutral-900 rounded-xl"
                />
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
            >
              <Label htmlFor="area" className="text-sm font-light text-neutral-600 mb-2 block">
                Quartier
              </Label>
              <Input
                id="area"
                type="text"
                value={formData.area}
                onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                placeholder="Ex: Plateau Mont-Royal"
                className="h-14 text-lg font-light border-neutral-200 focus:border-neutral-900 focus:ring-neutral-900 rounded-xl"
              />
            </motion.div>
          </div>
        );

      case "features":
        return (
          <div className="space-y-8">
            {/* Taille */}
            <div>
              <h3 className="text-lg font-light text-neutral-700 mb-4">Taille</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="border-2 border-neutral-200 rounded-2xl p-6 cursor-pointer hover:border-neutral-900 transition-all"
                >
                  <Label htmlFor="bedrooms" className="text-sm font-light text-neutral-600 mb-2 block">
                    Chambres
                  </Label>
                  <Input
                    id="bedrooms"
                    type="number"
                    min="0"
                    value={formData.bedrooms}
                    onChange={(e) => setFormData({ ...formData, bedrooms: e.target.value })}
                    className="h-12 text-2xl font-light border-0 p-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                  />
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="border-2 border-neutral-200 rounded-2xl p-6 cursor-pointer hover:border-neutral-900 transition-all"
                >
                  <Label htmlFor="bathrooms" className="text-sm font-light text-neutral-600 mb-2 block">
                    Salles de bain
                  </Label>
                  <Input
                    id="bathrooms"
                    type="number"
                    min="1"
                    value={formData.bathrooms}
                    onChange={(e) => setFormData({ ...formData, bathrooms: e.target.value })}
                    className="h-12 text-2xl font-light border-0 p-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                  />
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="border-2 border-neutral-200 rounded-2xl p-6 cursor-pointer hover:border-neutral-900 transition-all"
                >
                  <Label htmlFor="squareFootage" className="text-sm font-light text-neutral-600 mb-2 block">
                    Superficie (pi²)
                  </Label>
                  <Input
                    id="squareFootage"
                    type="number"
                    min="0"
                    value={formData.squareFootage}
                    onChange={(e) => setFormData({ ...formData, squareFootage: e.target.value })}
                    className="h-12 text-2xl font-light border-0 p-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                    placeholder="Ex: 1200"
                  />
                </motion.div>
              </div>
            </div>

            {/* Options incluses */}
            <div className="space-y-8">
              <h3 className="text-lg font-light text-neutral-700 mb-6">Options incluses</h3>
              
              {/* Services publics */}
              <div>
                <h4 className="text-sm font-medium text-neutral-500 uppercase tracking-wide mb-4">Services publics</h4>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { key: "wifiIncluded", label: "WiFi inclus", icon: Wifi, color: "bg-blue-50 border-blue-200 text-blue-700", iconColor: "text-blue-600" },
                    { key: "heatingIncluded", label: "Chauffage inclus", icon: Flame, color: "bg-red-50 border-red-200 text-red-700", iconColor: "text-red-600" },
                    { key: "hotWaterIncluded", label: "Eau chaude incluse", icon: Droplet, color: "bg-cyan-50 border-cyan-200 text-cyan-700", iconColor: "text-cyan-600" },
                    { key: "electricityIncluded", label: "Électricité incluse", icon: Zap, color: "bg-yellow-50 border-yellow-200 text-yellow-700", iconColor: "text-yellow-600" },
                  ].map((option, index) => {
                    const Icon = option.icon;
                    const isChecked = formData[option.key as keyof typeof formData] as boolean;
                    return (
                      <motion.div
                        key={option.key}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setFormData({ ...formData, [option.key]: !isChecked })}
                        className={`border-2 rounded-2xl p-6 cursor-pointer transition-all ${option.color} ${
                          isChecked ? "opacity-100" : "opacity-50 hover:opacity-70"
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                            isChecked
                              ? "border-neutral-900 bg-neutral-900"
                              : `${option.iconColor.replace('text-', 'border-').replace('-600', '-300').replace('-700', '-300')} bg-transparent`
                          }`}>
                            {isChecked && <CheckCircle className="h-4 w-4 text-white" />}
                          </div>
                          {Icon && <Icon className={`h-6 w-6 transition-colors ${option.iconColor}`} />}
                          <span className={`text-base font-light transition-colors ${option.color.split(' ')[2]}`}>
                            {option.label}
                          </span>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              {/* Caractéristiques du bâtiment */}
              <div>
                <h4 className="text-sm font-medium text-neutral-500 uppercase tracking-wide mb-4">Caractéristiques du bâtiment</h4>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { key: "pool", label: "Piscine", icon: Waves, color: "bg-blue-50 border-blue-200 text-blue-700", iconColor: "text-blue-600" },
                    { key: "gym", label: "Salle de sport", icon: Dumbbell, color: "bg-orange-50 border-orange-200 text-orange-700", iconColor: "text-orange-600" },
                    { key: "recreationRoom", label: "Salle de loisirs", icon: Gamepad2, color: "bg-pink-50 border-pink-200 text-pink-700", iconColor: "text-pink-600" },
                    { key: "elevator", label: "Ascenseur", icon: ArrowUpDown, color: "bg-gray-50 border-gray-200 text-gray-700", iconColor: "text-gray-600" },
                    { key: "security", label: "Sécurité", icon: Lock, color: "bg-red-50 border-red-200 text-red-700", iconColor: "text-red-600" },
                    { key: "wheelchairAccessible", label: "Accès handicapé", icon: Accessibility, color: "bg-teal-50 border-teal-200 text-teal-700", iconColor: "text-teal-600" },
                  ].map((option, index) => {
                    const Icon = option.icon;
                    const isChecked = formData[option.key as keyof typeof formData] as boolean;
                    return (
                      <motion.div
                        key={option.key}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setFormData({ ...formData, [option.key]: !isChecked })}
                        className={`border-2 rounded-2xl p-6 cursor-pointer transition-all ${option.color} ${
                          isChecked 
                            ? `${option.highlight ? "ring-2 ring-amber-400 ring-offset-2" : ""} opacity-100` 
                            : "opacity-50 hover:opacity-70"
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                            isChecked
                              ? `${option.highlight ? "border-amber-600 bg-amber-600" : "border-neutral-900 bg-neutral-900"}`
                              : `${option.iconColor.replace('text-', 'border-').replace('-600', '-300').replace('-700', '-300')} bg-transparent`
                          }`}>
                            {isChecked && <CheckCircle className="h-4 w-4 text-white" />}
                          </div>
                          {Icon && <Icon className={`h-6 w-6 transition-colors ${option.iconColor}`} />}
                          <span className={`text-base font-light transition-colors ${option.color.split(' ')[2]}`}>
                            {option.label}
                            {option.highlight && isChecked && <span className="ml-2 text-xs bg-amber-200 text-amber-800 px-2 py-0.5 rounded-full">Payant</span>}
                          </span>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              {/* Stationnement */}
              <div>
                <h4 className="text-sm font-medium text-neutral-500 uppercase tracking-wide mb-4">Stationnement</h4>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { key: "parkingIncluded", label: "Garage inclus", icon: Car, color: "bg-green-50 border-green-200 text-green-700", iconColor: "text-green-600" },
                    { key: "parkingPaid", label: "Garage payant", icon: Car, color: "bg-amber-100 border-amber-300 text-amber-800", iconColor: "text-amber-700", highlight: true },
                  ].map((option, index) => {
                    const Icon = option.icon;
                    const isChecked = formData[option.key as keyof typeof formData] as boolean;
                    return (
                      <motion.div
                        key={option.key}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      onClick={() => setFormData({ ...formData, [option.key]: !isChecked })}
                      className={`border-2 rounded-2xl p-6 cursor-pointer transition-all ${
                        isChecked
                          ? `${option.color} ${option.highlight ? "ring-2 ring-amber-400 ring-offset-2" : ""}`
                          : `${option.color.replace('bg-', 'bg-').replace('border-', 'border-').replace('-50', '-50').replace('-100', '-100')} opacity-40 hover:opacity-60`
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                          isChecked
                            ? `${option.highlight ? "border-amber-600 bg-amber-600" : "border-neutral-900 bg-neutral-900"}`
                            : option.iconColor.replace('text-', 'border-').replace('-600', '-300').replace('-700', '-300')
                        }`}>
                          {isChecked && <CheckCircle className="h-4 w-4 text-white" />}
                        </div>
                        {Icon && <Icon className={`h-6 w-6 transition-colors ${isChecked ? option.iconColor : option.iconColor.replace('-600', '-400').replace('-700', '-400')}`} />}
                        <span className={`text-base font-light transition-colors ${
                          isChecked ? (option.highlight ? "text-amber-800 font-medium" : option.color.split(' ')[2]) : option.color.split(' ')[2].replace('-700', '-500').replace('-800', '-600')
                        }`}>
                          {option.label}
                          {option.highlight && isChecked && <span className="ml-2 text-xs bg-amber-200 text-amber-800 px-2 py-0.5 rounded-full">Payant</span>}
                        </span>
                      </div>
                    </motion.div>
                    );
                  })}
                </div>
              </div>

              {/* Électroménagers */}
              <div>
                <h4 className="text-sm font-medium text-neutral-500 uppercase tracking-wide mb-4">Électroménagers</h4>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { key: "washerDryer", label: "Laveuse/sécheuse", icon: Package, color: "bg-indigo-50 border-indigo-200 text-indigo-700", iconColor: "text-indigo-600" },
                    { key: "dishwasher", label: "Lave-vaisselle", icon: Sparkles, color: "bg-violet-50 border-violet-200 text-violet-700", iconColor: "text-violet-600" },
                    { key: "refrigerator", label: "Réfrigérateur", icon: Box, color: "bg-blue-50 border-blue-200 text-blue-700", iconColor: "text-blue-600" },
                    { key: "oven", label: "Four", icon: Flame, color: "bg-orange-50 border-orange-200 text-orange-700", iconColor: "text-orange-600" },
                    { key: "microwave", label: "Micro-ondes", icon: Box, color: "bg-pink-50 border-pink-200 text-pink-700", iconColor: "text-pink-600" },
                    { key: "freezer", label: "Congélateur", icon: Package, color: "bg-cyan-50 border-cyan-200 text-cyan-700", iconColor: "text-cyan-600" },
                    { key: "stove", label: "Plaque de cuisson", icon: Utensils, color: "bg-red-50 border-red-200 text-red-700", iconColor: "text-red-600" },
                    { key: "airConditioning", label: "Climatisation", icon: Wind, color: "bg-sky-50 border-sky-200 text-sky-700", iconColor: "text-sky-600" },
                  ].map((option, index) => {
                    const Icon = option.icon;
                    const isChecked = formData[option.key as keyof typeof formData] as boolean;
                    return (
                      <motion.div
                        key={option.key}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setFormData({ ...formData, [option.key]: !isChecked })}
                        className={`border-2 rounded-2xl p-6 cursor-pointer transition-all ${option.color} ${
                          isChecked 
                            ? `${option.highlight ? "ring-2 ring-amber-400 ring-offset-2" : ""} opacity-100` 
                            : "opacity-50 hover:opacity-70"
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                            isChecked
                              ? `${option.highlight ? "border-amber-600 bg-amber-600" : "border-neutral-900 bg-neutral-900"}`
                              : `${option.iconColor.replace('text-', 'border-').replace('-600', '-300').replace('-700', '-300')} bg-transparent`
                          }`}>
                            {isChecked && <CheckCircle className="h-4 w-4 text-white" />}
                          </div>
                          {Icon && <Icon className={`h-6 w-6 transition-colors ${option.iconColor}`} />}
                          <span className={`text-base font-light transition-colors ${option.color.split(' ')[2]}`}>
                            {option.label}
                            {option.highlight && isChecked && <span className="ml-2 text-xs bg-amber-200 text-amber-800 px-2 py-0.5 rounded-full">Payant</span>}
                          </span>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              {/* Extérieur */}
              <div>
                <h4 className="text-sm font-medium text-neutral-500 uppercase tracking-wide mb-4">Extérieur</h4>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { key: "balcony", label: "Balcon/terrasse", icon: Home, color: "bg-emerald-50 border-emerald-200 text-emerald-700", iconColor: "text-emerald-600" },
                    { key: "yard", label: "Jardin/cour", icon: TreePine, color: "bg-green-50 border-green-200 text-green-700", iconColor: "text-green-600" },
                  ].map((option, index) => {
                    const Icon = option.icon;
                    const isChecked = formData[option.key as keyof typeof formData] as boolean;
                    return (
                      <motion.div
                        key={option.key}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setFormData({ ...formData, [option.key]: !isChecked })}
                        className={`border-2 rounded-2xl p-6 cursor-pointer transition-all ${option.color} ${
                          isChecked 
                            ? `${option.highlight ? "ring-2 ring-amber-400 ring-offset-2" : ""} opacity-100` 
                            : "opacity-50 hover:opacity-70"
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                            isChecked
                              ? `${option.highlight ? "border-amber-600 bg-amber-600" : "border-neutral-900 bg-neutral-900"}`
                              : `${option.iconColor.replace('text-', 'border-').replace('-600', '-300').replace('-700', '-300')} bg-transparent`
                          }`}>
                            {isChecked && <CheckCircle className="h-4 w-4 text-white" />}
                          </div>
                          {Icon && <Icon className={`h-6 w-6 transition-colors ${option.iconColor}`} />}
                          <span className={`text-base font-light transition-colors ${option.color.split(' ')[2]}`}>
                            {option.label}
                            {option.highlight && isChecked && <span className="ml-2 text-xs bg-amber-200 text-amber-800 px-2 py-0.5 rounded-full">Payant</span>}
                          </span>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              {/* Autres */}
              <div>
                <h4 className="text-sm font-medium text-neutral-500 uppercase tracking-wide mb-4">Autres</h4>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { key: "furnished", label: "Meublé", icon: Home, color: "bg-amber-50 border-amber-200 text-amber-700", iconColor: "text-amber-600" },
                    { key: "petAllowed", label: "Animaux acceptés", icon: Dog, color: "bg-purple-50 border-purple-200 text-purple-700", iconColor: "text-purple-600" },
                    { key: "storage", label: "Cave/entreposage", icon: Home, color: "bg-slate-50 border-slate-200 text-slate-700", iconColor: "text-slate-600" },
                  ].map((option, index) => {
                    const Icon = option.icon;
                    const isChecked = formData[option.key as keyof typeof formData] as boolean;
                    return (
                      <motion.div
                        key={option.key}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setFormData({ ...formData, [option.key]: !isChecked })}
                        className={`border-2 rounded-2xl p-6 cursor-pointer transition-all ${option.color} ${
                          isChecked 
                            ? `${option.highlight ? "ring-2 ring-amber-400 ring-offset-2" : ""} opacity-100` 
                            : "opacity-50 hover:opacity-70"
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                            isChecked
                              ? `${option.highlight ? "border-amber-600 bg-amber-600" : "border-neutral-900 bg-neutral-900"}`
                              : `${option.iconColor.replace('text-', 'border-').replace('-600', '-300').replace('-700', '-300')} bg-transparent`
                          }`}>
                            {isChecked && <CheckCircle className="h-4 w-4 text-white" />}
                          </div>
                          {Icon && <Icon className={`h-6 w-6 transition-colors ${option.iconColor}`} />}
                          <span className={`text-base font-light transition-colors ${option.color.split(' ')[2]}`}>
                            {option.label}
                            {option.highlight && isChecked && <span className="ml-2 text-xs bg-amber-200 text-amber-800 px-2 py-0.5 rounded-full">Payant</span>}
                          </span>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Help Section */}
            <div className="border-t border-neutral-200 pt-6">
              <button
                type="button"
                onClick={() => setExpandedHelp(expandedHelp === "features" ? null : "features")}
                className="flex items-center justify-between w-full text-left"
              >
                <span className="text-base font-light text-neutral-600">
                  Besoin d'aide pour choisir les caractéristiques ?
                </span>
                <span className={`text-2xl text-neutral-400 transition-transform ${
                  expandedHelp === "features" ? "rotate-45" : ""
                }`}>
                  +
                </span>
              </button>
              {expandedHelp === "features" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-4 text-sm text-neutral-600 font-light"
                >
                  <p>Les caractéristiques aident les locataires à trouver le logement qui correspond à leurs besoins. Cochez toutes les options qui s'appliquent à votre propriété.</p>
                </motion.div>
              )}
            </div>
          </div>
        );

      case "photos":
        return (
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all ${
                  isUploading
                    ? "border-neutral-300 bg-neutral-50"
                    : "border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50/50 cursor-pointer"
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
                  className="cursor-pointer flex flex-col items-center gap-4"
                >
                  <Upload className={`h-12 w-12 ${isUploading ? "text-neutral-400 animate-pulse" : "text-neutral-400"}`} />
                  <div>
                    <p className="text-base font-medium text-neutral-900 mb-1">
                      {isUploading ? "Upload en cours..." : "Cliquez pour uploader ou glissez-déposez"}
                    </p>
                    <p className="text-sm text-neutral-500">
                      Formats: JPG, PNG, GIF (max 5MB par image)
                    </p>
                  </div>
                  </label>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              <Button
                type="button"
                variant="outline"
                onClick={handleAddImageUrl}
                className="w-full h-12 border-neutral-200 hover:border-neutral-900 hover:bg-neutral-50"
              >
                <Plus className="h-4 w-4 mr-2" />
                Ajouter une image par URL
              </Button>
            </motion.div>

            {imageUrls.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="grid grid-cols-3 gap-4"
              >
                {imageUrls.map((url, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="relative group aspect-square rounded-xl overflow-hidden border-2 border-neutral-200"
                  >
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
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </div>
        );

      case "3d":
        return (
          <div className="space-y-6">
            {[
              { key: "model3dUrl", label: "URL Modèle 3D", placeholder: "https://..." },
              { key: "panoramaUrl", label: "URL Panorama", placeholder: "https://..." },
              { key: "matterportUrl", label: "URL Matterport", placeholder: "https://..." },
              { key: "sketchfabUrl", label: "URL Sketchfab", placeholder: "https://..." },
            ].map((field, index) => (
              <motion.div
                key={field.key}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <Label htmlFor={field.key} className="text-base font-medium text-neutral-900 mb-3 block">
                  {field.label}
                </Label>
                <Input
                  id={field.key}
                  type="url"
                  value={formData[field.key as keyof typeof formData] as string}
                  onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                  placeholder={field.placeholder}
                  className="h-12 text-base border-neutral-200 focus:border-neutral-900 focus:ring-neutral-900"
                />
              </motion.div>
            ))}
          </div>
        );

      case "marketplace":
        return (
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-light text-neutral-900 mb-2">
                Facebook Marketplace
              </h2>
              <p className="text-base text-neutral-600 font-light">
                Connectez votre annonce Facebook Marketplace pour automatiser les réponses aux personnes intéressées
              </p>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="border-2 border-neutral-200 rounded-2xl p-8 hover:border-neutral-900 transition-all"
            >
              <div className="flex items-start justify-between mb-6">
                <div className="flex-1">
                  <h3 className="text-lg font-light text-neutral-900 mb-2">
                    Réponses automatiques
                  </h3>
                  <p className="text-sm text-neutral-600 mb-4">
                    Activez cette fonctionnalité pour envoyer automatiquement un message aux personnes qui s'intéressent à votre annonce sur Facebook Marketplace. Elles recevront un lien direct vers votre annonce MyRent.
                  </p>
                  <div className="flex items-center gap-3 text-sm text-neutral-600">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Gagnez du temps</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-neutral-600 mt-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Augmentez vos visites</span>
                  </div>
                </div>
                <Switch
                  checked={formData.marketplaceAutoReplyEnabled}
                  onCheckedChange={(checked) => 
                    setFormData({ ...formData, marketplaceAutoReplyEnabled: checked })
                  }
                />
              </div>
            </motion.div>

            {formData.marketplaceAutoReplyEnabled && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-6 pt-6 border-t border-neutral-200"
                >
                <div>
                  <Label htmlFor="marketplaceUrl" className="text-sm font-light text-neutral-600 mb-2 block">
                    URL de l'annonce Marketplace
                  </Label>
                  <Input
                    id="marketplaceUrl"
                    type="url"
                    value={formData.marketplaceUrl}
                    onChange={(e) => setFormData({ ...formData, marketplaceUrl: e.target.value })}
                    placeholder="https://www.facebook.com/marketplace/item/..."
                    className="h-14 text-lg font-light border-neutral-200 focus:border-neutral-900 focus:ring-neutral-900 rounded-xl"
                  />
                  <p className="text-xs text-neutral-500 mt-2">
                    Collez le lien de votre annonce sur Facebook Marketplace
                  </p>
                </div>

                <div>
                  <Label htmlFor="marketplaceId" className="text-sm font-light text-neutral-600 mb-2 block">
                    ID de l'annonce Marketplace (optionnel)
                  </Label>
                  <Input
                    id="marketplaceId"
                    type="text"
                    value={formData.marketplaceId}
                    onChange={(e) => setFormData({ ...formData, marketplaceId: e.target.value })}
                    placeholder="1234567890"
                    className="h-14 text-lg font-light border-neutral-200 focus:border-neutral-900 focus:ring-neutral-900 rounded-xl"
                  />
                </div>

                <div>
                  <Label htmlFor="marketplaceAutoMessage" className="text-sm font-light text-neutral-600 mb-2 block">
                    Message automatique
                  </Label>
                  <Textarea
                    id="marketplaceAutoMessage"
                    value={formData.marketplaceAutoMessage}
                    onChange={(e) => setFormData({ ...formData, marketplaceAutoMessage: e.target.value })}
                    placeholder="Votre message avec [LIEN] comme placeholder"
                    rows={10}
                    className="text-lg font-light border-neutral-200 focus:border-neutral-900 focus:ring-neutral-900 resize-none rounded-xl"
                  />
                  <p className="text-xs text-neutral-500 mt-2">
                    Utilisez <code className="bg-neutral-100 px-1.5 py-0.5 rounded">[LIEN]</code> pour insérer automatiquement le lien vers votre annonce MyRent
                  </p>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mt-4">
                  <p className="text-sm text-blue-900 font-medium mb-2">💡 Comment ça fonctionne ?</p>
                  <ol className="text-xs text-blue-800 space-y-1 list-decimal list-inside ml-2">
                    <li>Après la création, copiez le message complet depuis la page d'édition</li>
                    <li>Allez sur Facebook Business Suite → Inbox → Paramètres</li>
                    <li>Activez les réponses automatiques et collez votre message</li>
                    <li>Les personnes intéressées recevront automatiquement le lien MyRent</li>
                  </ol>
                </div>
              </motion.div>
            )}

            {!formData.marketplaceAutoReplyEnabled && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="border-t border-neutral-200 pt-6"
              >
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, marketplaceAutoReplyEnabled: true })}
                  className="text-sm text-neutral-600 hover:text-neutral-900 font-light underline"
                >
                  Activer plus tard dans les paramètres de l'annonce
                </button>
              </motion.div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Header - Apple Style */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <Link
              href="/landlord/listings"
              className="inline-flex items-center gap-2 text-neutral-600 hover:text-neutral-900 mb-6 transition-colors text-sm"
            >
              <ArrowLeft className="h-4 w-4" />
              Retour
            </Link>
            <div className="flex items-start justify-between mb-8">
              <div>
                <h1 className="text-5xl font-light text-neutral-900 mb-2">
                  Créer une annonce
                </h1>
                <p className="text-xl text-neutral-600 font-light">
                  {currentStepData?.label}
                </p>
              </div>
              {formData.price && (
                <div className="text-right">
                  <p className="text-2xl font-light text-neutral-900">
                    À partir de {parseFloat(formData.price).toLocaleString('fr-CA')} $/mois
                  </p>
                  <p className="text-sm text-neutral-600 mt-1">
                    ou {Math.round(parseFloat(formData.price) / 24).toLocaleString('fr-CA')} $/mois sur 24 mois
                  </p>
                </div>
              )}
            </div>
          </motion.div>

          {/* Two Column Layout - Apple Style */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            {/* Left Column - Visualization */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="sticky top-8"
            >
              <div className="bg-neutral-50 rounded-3xl p-8 min-h-[600px]">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-light text-neutral-600 mb-4">Aperçu</h3>
                  </div>
                  
                  {/* Image Preview */}
                  {imageUrls.length > 0 ? (
                    <div className="relative aspect-square rounded-2xl overflow-hidden bg-white shadow-lg">
                      <Image
                        src={imageUrls[currentImageIndex]}
                        alt="Preview"
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 50vw"
                      />
                      {imageUrls.length > 1 && (
                        <>
                          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                            {imageUrls.map((_, index) => (
                              <div
                                key={index}
                                className={`h-2 rounded-full transition-all ${
                                  index === currentImageIndex
                                    ? "w-6 bg-white"
                                    : "w-2 bg-white/50"
                                }`}
                              />
                            ))}
                          </div>
                          <button
                            type="button"
                            onClick={() => setCurrentImageIndex((prev) => (prev + 1) % imageUrls.length)}
                            className="absolute right-4 top-1/2 transform -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 hover:bg-white shadow-lg flex items-center justify-center transition-all"
                          >
                            <ChevronRight className="h-5 w-5 text-neutral-900" />
                          </button>
                        </>
                      )}
                    </div>
                  ) : (
                    <div className="aspect-square rounded-2xl bg-neutral-200 flex items-center justify-center">
                      <ImageIcon className="h-16 w-16 text-neutral-400" />
                    </div>
                  )}

                  {/* Preview Content */}
                  <div className="space-y-4">
                    {formData.title && (
                      <div>
                        <h4 className="text-2xl font-light text-neutral-900 mb-1">
                          {formData.title}
                        </h4>
                      </div>
                    )}

                    {(formData.address || formData.city) && (
                      <div className="flex items-center gap-2 text-neutral-600">
                        <MapPin className="h-4 w-4" />
                        <span className="text-sm">
                          {[formData.address, formData.city, formData.area].filter(Boolean).join(", ")}
                        </span>
                      </div>
                    )}

                    {formData.price && (
                      <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-light text-neutral-900">
                          {parseFloat(formData.price).toLocaleString('fr-CA')} $
                        </span>
                        <span className="text-neutral-600">/mois</span>
                      </div>
                    )}

                    {(formData.bedrooms !== "0" || formData.bathrooms !== "1") && (
                      <div className="flex items-center gap-4 text-sm text-neutral-600">
                        {formData.bedrooms !== "0" && (
                          <div className="flex items-center gap-1">
                            <Bed className="h-4 w-4" />
                            <span>{formData.bedrooms} ch.</span>
                          </div>
                        )}
                        {formData.bathrooms !== "1" && (
                          <div className="flex items-center gap-1">
                            <Bath className="h-4 w-4" />
                            <span>{formData.bathrooms} sdb</span>
                          </div>
                        )}
                      </div>
                    )}

                    {formData.description && (
                      <div>
                        <p className="text-sm text-neutral-600 line-clamp-3">
                          {formData.description}
                        </p>
                      </div>
                    )}

                    {(formData.furnished || formData.petAllowed || formData.wifiIncluded || formData.heatingIncluded || formData.hotWaterIncluded || formData.electricityIncluded) && (
                      <div className="flex flex-wrap gap-2 pt-2">
                        {formData.furnished && (
                          <span className="text-xs px-2 py-1 bg-neutral-200 rounded-full text-neutral-700">Meublé</span>
                        )}
                        {formData.petAllowed && (
                          <span className="text-xs px-2 py-1 bg-neutral-200 rounded-full text-neutral-700 flex items-center gap-1">
                            <Dog className="h-3 w-3" /> Animaux
                          </span>
                        )}
                        {formData.wifiIncluded && (
                          <span className="text-xs px-2 py-1 bg-neutral-200 rounded-full text-neutral-700 flex items-center gap-1">
                            <Wifi className="h-3 w-3" /> WiFi
                          </span>
                        )}
                        {formData.heatingIncluded && (
                          <span className="text-xs px-2 py-1 bg-neutral-200 rounded-full text-neutral-700 flex items-center gap-1">
                            <Flame className="h-3 w-3" /> Chauffage
                          </span>
                        )}
                        {formData.hotWaterIncluded && (
                          <span className="text-xs px-2 py-1 bg-neutral-200 rounded-full text-neutral-700 flex items-center gap-1">
                            <Droplet className="h-3 w-3" /> Eau chaude
                          </span>
                        )}
                        {formData.electricityIncluded && (
                          <span className="text-xs px-2 py-1 bg-neutral-200 rounded-full text-neutral-700 flex items-center gap-1">
                            <Zap className="h-3 w-3" /> Électricité
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Right Column - Form */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-8"
            >
              {/* Progress Indicator - Minimal */}
              <div className="flex items-center gap-2 mb-6">
                {STEPS.map((_, index) => (
                  <div
                    key={index}
                    className={`h-1 flex-1 rounded-full transition-all ${
                      index <= currentStep
                        ? "bg-neutral-900"
                        : "bg-neutral-200"
                    }`}
                  />
                ))}
              </div>

              {/* Error Message */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 flex items-start gap-3"
                >
                  <div className="flex-1">
                    <p className="font-medium">Erreur</p>
                    <p className="text-sm mt-1">{error}</p>
                  </div>
                  <button
                    onClick={() => setError(null)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </motion.div>
              )}

              {/* Success Message */}
              {success && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-8 bg-green-50 border-2 border-green-300 rounded-2xl"
                >
                  <div className="flex items-start gap-4 mb-6">
                    <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-light text-green-900 mb-2">
                        Annonce créée avec succès !
                      </h3>
                      <p className="text-base text-green-700 font-light">
                        Votre annonce a été publiée. Vous pouvez maintenant la gérer depuis la liste de vos annonces.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Button
                      type="button"
                      onClick={() => router.push("/landlord/listings")}
                      className="h-12 px-8 bg-neutral-900 hover:bg-neutral-800 text-white font-light"
                    >
                      Voir mes annonces
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => {
                        setSuccess(false);
                        setFormData({
                          title: "",
                          description: "",
                          price: "",
                          city: "",
                          area: "",
                          address: "",
                          postalCode: "",
                          bedrooms: "0",
                          bathrooms: "1",
                          squareFootage: "",
                          furnished: false,
                          petAllowed: false,
                          wifiIncluded: false,
                          heatingIncluded: false,
                          hotWaterIncluded: false,
                          electricityIncluded: false,
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
                        setImageUrls([]);
                        setCurrentStep(0);
                        setCompletedSteps([]);
                        setAddressCoordinates(null);
                      }}
                      className="h-12 px-6 text-neutral-600 hover:text-neutral-900 font-light"
                    >
                      Créer une autre annonce
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* Step Content - Hidden when success */}
              {!success && (
                <form onSubmit={handleSubmit} className="space-y-8">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentStep}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                    >
                      {renderStepContent()}
                    </motion.div>
                  </AnimatePresence>

                  {/* Navigation Buttons */}
                  <div className="flex items-center justify-between pt-8 border-t border-neutral-200">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={handlePrevious}
                      disabled={currentStep === 0}
                      className="h-12 px-6 text-neutral-600 hover:text-neutral-900 disabled:opacity-30 font-light"
                    >
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Précédent
                    </Button>

                    {currentStep < STEPS.length - 1 ? (
                      <Button
                        type="button"
                        onClick={handleNext}
                        disabled={!validateStep(currentStep)}
                        className="h-12 px-8 bg-neutral-900 hover:bg-neutral-800 text-white disabled:opacity-50 disabled:cursor-not-allowed font-light"
                      >
                        Suivant
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    ) : (
                      <Button
                        type="submit"
                        disabled={isSaving || !validateStep(currentStep)}
                        className="h-12 px-8 bg-neutral-900 hover:bg-neutral-800 text-white disabled:opacity-50 disabled:cursor-not-allowed font-light"
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
                    )}
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        </div>
      </main>
    </>
  );
}
