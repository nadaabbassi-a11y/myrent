"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { AppleFormField } from "@/components/apple-form-field";
import { AppleButton } from "@/components/apple-button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";

export default function Step2AddressPage() {
  const params = useParams();
  const router = useRouter();
  const applicationId = params.applicationId as string;

  const [formData, setFormData] = useState({
    currentAddress: "",
    city: "",
    postalCode: "",
    rent: "",
    heated: false,
    electricity: false,
    referencePeriodFrom: "",
    referencePeriodTo: "",
    currentLandlordName: "",
    currentLandlordPhone: "",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchApplication();
  }, [applicationId]);

  const fetchApplication = async () => {
    try {
      const response = await fetch(`/api/applications/${applicationId}`);
      if (!response.ok) throw new Error("Failed to fetch application");
      const data = await response.json();
      if (data.answers?.address) {
        setFormData(data.answers.address);
      }
    } catch (err) {
      console.error("Error fetching application:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNext = async () => {
    if (!formData.currentAddress || !formData.postalCode) {
      setError("L'adresse et le code postal sont requis");
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/applications/${applicationId}/steps/address`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ data: formData }),
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Erreur lors de la sauvegarde");
      }

      router.push(`/apply/${applicationId}/step-3`);
    } catch (err: any) {
      setError(err.message || "Erreur lors de la sauvegarde");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-neutral-300 border-t-neutral-900 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-neutral-600 font-light">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="bg-white rounded-3xl p-12 md:p-16 shadow-sm"
    >
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="mb-12"
        >
          <h1 className="text-5xl md:text-6xl font-light text-neutral-900 mb-4 tracking-tight">
            Adresse actuelle
          </h1>
          <p className="text-xl text-neutral-600 font-light">
            Informations sur votre logement actuel
          </p>
        </motion.div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 font-light"
          >
            {error}
          </motion.div>
        )}

        <div className="space-y-2">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <AppleFormField
              id="currentAddress"
              label="Adresse"
              value={formData.currentAddress}
              onChange={(value) =>
                setFormData({ ...formData, currentAddress: value })
              }
              placeholder="123 Rue Example"
              required
              error={
                !formData.currentAddress && error ? "L'adresse est requise" : undefined
              }
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <AppleFormField
              id="city"
              label="Ville"
              value={formData.city}
              onChange={(value) =>
                setFormData({ ...formData, city: value })
              }
              placeholder="Montréal"
              required
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <AppleFormField
              id="postalCode"
              label="Code postal"
              value={formData.postalCode}
              onChange={(value) =>
                setFormData({ ...formData, postalCode: value })
              }
              placeholder="H1A 1A1"
              required
              error={
                !formData.postalCode && error ? "Le code postal est requis" : undefined
              }
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <AppleFormField
              id="rent"
              label="Loyer"
              value={formData.rent}
              onChange={(value) =>
                setFormData({ ...formData, rent: value })
              }
              placeholder="1200"
              type="number"
              inputMode="numeric"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex gap-6 mb-8"
          >
            <label className="flex items-center gap-3 cursor-pointer group">
              <Checkbox
                checked={formData.heated}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, heated: checked === true })
                }
              />
              <span className="text-base font-light text-neutral-700 group-hover:text-neutral-900 transition-colors">
                Chauffé
              </span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer group">
              <Checkbox
                checked={formData.electricity}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, electricity: checked === true })
                }
              />
              <span className="text-base font-light text-neutral-700 group-hover:text-neutral-900 transition-colors">
                Électricité
              </span>
            </label>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            <AppleFormField
              id="referencePeriodFrom"
              label="Période de référence - De"
              value={formData.referencePeriodFrom}
              onChange={(value) =>
                setFormData({ ...formData, referencePeriodFrom: value })
              }
              placeholder="aaaa-mm-jj"
              type="date"
            />
            <AppleFormField
              id="referencePeriodTo"
              label="Période de référence - À"
              value={formData.referencePeriodTo}
              onChange={(value) =>
                setFormData({ ...formData, referencePeriodTo: value })
              }
              placeholder="aaaa-mm-jj"
              type="date"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="pt-8 border-t border-neutral-200"
          >
            <h3 className="text-2xl font-light text-neutral-900 mb-6">Propriétaire actuel</h3>
            <div className="space-y-2">
              <AppleFormField
                id="currentLandlordName"
                label="Nom"
                value={formData.currentLandlordName}
                onChange={(value) =>
                  setFormData({ ...formData, currentLandlordName: value })
                }
                placeholder="Nom du propriétaire"
              />
              <AppleFormField
                id="currentLandlordPhone"
                label="Téléphone"
                value={formData.currentLandlordPhone}
                onChange={(value) =>
                  setFormData({ ...formData, currentLandlordPhone: value })
                }
                placeholder="514-123-4567"
                type="tel"
                inputMode="tel"
              />
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="flex justify-between items-center pt-12 mt-8 border-t border-neutral-100"
        >
          <AppleButton
            variant="ghost"
            onClick={() => router.push(`/apply/${applicationId}/step-1`)}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Précédent
          </AppleButton>
          <AppleButton
            variant="primary"
            onClick={handleNext}
            isLoading={isSaving}
          >
            Suivant
            <ArrowRight className="h-4 w-4 ml-2" />
          </AppleButton>
        </motion.div>
      </div>
    </motion.div>
  );
}


