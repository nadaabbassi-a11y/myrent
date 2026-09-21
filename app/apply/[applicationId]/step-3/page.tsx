"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { AppleFormField } from "@/components/apple-form-field";
import { AppleButton } from "@/components/apple-button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";

export default function Step3PreviousAddressPage() {
  const params = useParams();
  const router = useRouter();
  const applicationId = params.applicationId as string;

  const [formData, setFormData] = useState({
    previousAddress: "",
    previousCity: "",
    previousPostalCode: "",
    previousRent: "",
    previousHeated: false,
    previousElectricity: false,
    previousReferencePeriodFrom: "",
    previousReferencePeriodTo: "",
    previousLandlordName: "",
    previousLandlordPhone: "",
    owesUtilityDebt: false, // Question sur les dettes d'électricité/gaz
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
      if (data.answers?.previousAddress) {
        setFormData(data.answers.previousAddress);
      }
      if (data.answers?.utilityDebt !== undefined) {
        setFormData((prev) => ({ ...prev, owesUtilityDebt: data.answers.utilityDebt }));
      }
    } catch (err) {
      console.error("Error fetching application:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNext = async () => {
    setIsSaving(true);
    setError(null);

    try {
      // Sauvegarder l'adresse précédente
      const addressResponse = await fetch(
        `/api/applications/${applicationId}/steps/previousAddress`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            data: {
              previousAddress: formData.previousAddress,
              previousCity: formData.previousCity,
              previousPostalCode: formData.previousPostalCode,
              previousRent: formData.previousRent,
              previousHeated: formData.previousHeated,
              previousElectricity: formData.previousElectricity,
              previousReferencePeriodFrom: formData.previousReferencePeriodFrom,
              previousReferencePeriodTo: formData.previousReferencePeriodTo,
              previousLandlordName: formData.previousLandlordName,
              previousLandlordPhone: formData.previousLandlordPhone,
            }
          }),
        }
      );

      if (!addressResponse.ok) {
        const data = await addressResponse.json();
        throw new Error(data.error || "Erreur lors de la sauvegarde");
      }

      // Sauvegarder la réponse sur les dettes d'utilités
      const utilityResponse = await fetch(
        `/api/applications/${applicationId}/steps/utilityDebt`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            data: { owesUtilityDebt: formData.owesUtilityDebt }
          }),
        }
      );

      if (!utilityResponse.ok) {
        const data = await utilityResponse.json();
        throw new Error(data.error || "Erreur lors de la sauvegarde");
      }

      router.push(`/apply/${applicationId}/step-4`);
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
            Informations requises
          </h1>
          <p className="text-xl text-neutral-600 font-light">
            Dettes d'utilités et adresse précédente
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
          {/* Question sur les dettes d'utilités */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8 p-6 border-2 border-neutral-200 rounded-2xl bg-neutral-50/50"
          >
            <Label className="text-lg font-light text-neutral-900 mb-4 block">
              Devez-vous de l'argent à un fournisseur d'électricité, de gaz naturel, de mazout de chauffage ou de chauffe-eau loué ?
            </Label>
            <div className="flex gap-6">
              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="radio"
                  name="owesUtilityDebt"
                  checked={formData.owesUtilityDebt === true}
                  onChange={() => setFormData({ ...formData, owesUtilityDebt: true })}
                  className="w-5 h-5 text-neutral-900 border-neutral-300 focus:ring-neutral-900 focus:ring-2"
                />
                <span className="text-base font-light text-neutral-700 group-hover:text-neutral-900 transition-colors">
                  Oui
                </span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="radio"
                  name="owesUtilityDebt"
                  checked={formData.owesUtilityDebt === false}
                  onChange={() => setFormData({ ...formData, owesUtilityDebt: false })}
                  className="w-5 h-5 text-neutral-900 border-neutral-300 focus:ring-neutral-900 focus:ring-2"
                />
                <span className="text-base font-light text-neutral-700 group-hover:text-neutral-900 transition-colors">
                  Non
                </span>
              </label>
            </div>
          </motion.div>

          {/* Adresse précédente */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="pt-8 border-t border-neutral-200"
          >
            <h3 className="text-2xl font-light text-neutral-900 mb-6">Adresse précédente</h3>
            <div className="space-y-2">
              <AppleFormField
                id="previousAddress"
                label="Adresse"
                value={formData.previousAddress}
                onChange={(value) =>
                  setFormData({ ...formData, previousAddress: value })
                }
                placeholder="123 Rue Example"
              />
              <AppleFormField
                id="previousCity"
                label="Ville"
                value={formData.previousCity}
                onChange={(value) =>
                  setFormData({ ...formData, previousCity: value })
                }
                placeholder="Montréal"
              />
              <AppleFormField
                id="previousPostalCode"
                label="Code postal"
                value={formData.previousPostalCode}
                onChange={(value) =>
                  setFormData({ ...formData, previousPostalCode: value })
                }
                placeholder="H1A 1A1"
              />
              <AppleFormField
                id="previousRent"
                label="Loyer"
                value={formData.previousRent}
                onChange={(value) =>
                  setFormData({ ...formData, previousRent: value })
                }
                placeholder="1200"
                type="number"
                inputMode="numeric"
              />
              <div className="flex gap-6 mb-8">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <Checkbox
                    checked={formData.previousHeated}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, previousHeated: checked === true })
                    }
                  />
                  <span className="text-base font-light text-neutral-700 group-hover:text-neutral-900 transition-colors">
                    Chauffé
                  </span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer group">
                  <Checkbox
                    checked={formData.previousElectricity}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, previousElectricity: checked === true })
                    }
                  />
                  <span className="text-base font-light text-neutral-700 group-hover:text-neutral-900 transition-colors">
                    Électricité
                  </span>
                </label>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <AppleFormField
                  id="previousReferencePeriodFrom"
                  label="Période de référence - De"
                  value={formData.previousReferencePeriodFrom}
                  onChange={(value) =>
                    setFormData({ ...formData, previousReferencePeriodFrom: value })
                  }
                  placeholder="aaaa-mm-jj"
                  type="date"
                />
                <AppleFormField
                  id="previousReferencePeriodTo"
                  label="Période de référence - À"
                  value={formData.previousReferencePeriodTo}
                  onChange={(value) =>
                    setFormData({ ...formData, previousReferencePeriodTo: value })
                  }
                  placeholder="aaaa-mm-jj"
                  type="date"
                />
              </div>
            </div>
          </motion.div>

          {/* Propriétaire précédent */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="pt-8 border-t border-neutral-200"
          >
            <h3 className="text-2xl font-light text-neutral-900 mb-6">Propriétaire précédent</h3>
            <div className="space-y-2">
              <AppleFormField
                id="previousLandlordName"
                label="Nom"
                value={formData.previousLandlordName}
                onChange={(value) =>
                  setFormData({ ...formData, previousLandlordName: value })
                }
                placeholder="Nom du propriétaire"
              />
              <AppleFormField
                id="previousLandlordPhone"
                label="Téléphone"
                value={formData.previousLandlordPhone}
                onChange={(value) =>
                  setFormData({ ...formData, previousLandlordPhone: value })
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
          transition={{ delay: 0.5 }}
          className="flex justify-between items-center pt-12 mt-8 border-t border-neutral-100"
        >
          <AppleButton
            variant="ghost"
            onClick={() => router.push(`/apply/${applicationId}/step-2`)}
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

