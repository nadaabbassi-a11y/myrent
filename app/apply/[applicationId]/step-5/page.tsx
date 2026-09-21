"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { AppleFormField } from "@/components/apple-form-field";
import { AppleButton } from "@/components/apple-button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowRight, ArrowLeft, Plus, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const RELATION_OPTIONS = [
  "Conjoint(e)",
  "Enfant",
  "Colocataire",
  "Parent",
  "Ami(e)",
  "Autre",
] as const;

type RelationOption = (typeof RELATION_OPTIONS)[number];

export default function Step5OccupantsPage() {
  const params = useParams();
  const router = useRouter();
  const applicationId = params.applicationId as string;

  const [occupants, setOccupants] = useState<
    Array<{ name: string; age: string; relationship: string }>
  >([]);
  const [hasCoApplicants, setHasCoApplicants] = useState(false);
  const [coApplicants, setCoApplicants] = useState<
    Array<{ name: string; email: string; role: "CO_TENANT" | "GUARANTOR" | "OTHER" }>
  >([]);
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
      if (data.answers?.occupants) {
        setOccupants(data.answers.occupants || []);
      }
      if (data.answers?.coApplicants) {
        setHasCoApplicants(data.answers.coApplicants.hasCoApplicants || false);
        setCoApplicants(data.answers.coApplicants.list || []);
      }
    } catch (err) {
      console.error("Error fetching application:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const addOccupant = () => {
    setOccupants([...occupants, { name: "", age: "", relationship: "" }]);
  };

  const removeOccupant = (index: number) => {
    setOccupants(occupants.filter((_, i) => i !== index));
  };

  const updateOccupant = (index: number, field: string, value: string) => {
    const updated = [...occupants];
    updated[index] = { ...updated[index], [field]: value };
    setOccupants(updated);
  };

  const addCoApplicant = () => {
    setCoApplicants([...coApplicants, { name: "", email: "", role: "CO_TENANT" }]);
  };

  const removeCoApplicant = (index: number) => {
    setCoApplicants(coApplicants.filter((_, i) => i !== index));
  };

  const updateCoApplicant = (index: number, field: string, value: string) => {
    const updated = [...coApplicants];
    updated[index] = { ...updated[index], [field]: value };
    setCoApplicants(updated);
  };

  const handleNext = async () => {
    setIsSaving(true);
    setError(null);

    // Validation des co-applicants si hasCoApplicants est true
    if (hasCoApplicants) {
      for (const coApp of coApplicants) {
        if (!coApp.name || !coApp.email) {
          setError("Veuillez remplir le nom et l'email pour tous les co-applicants");
          setIsSaving(false);
          return;
        }
        // Validation email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(coApp.email)) {
          setError(`L'email "${coApp.email}" n'est pas valide`);
          setIsSaving(false);
          return;
        }
      }
    }

    try {
      // Sauvegarder les données dans le step
      const response = await fetch(
        `/api/applications/${applicationId}/steps/occupants`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            data: {
              occupants,
              coApplicants: {
                hasCoApplicants,
                list: hasCoApplicants ? coApplicants : [],
              },
            },
          }),
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Erreur lors de la sauvegarde");
      }

      // Si des co-applicants ont été ajoutés, les créer dans la base de données
      if (hasCoApplicants && coApplicants.length > 0) {
        const createResponse = await fetch(
          `/api/applications/${applicationId}/co-applicants/batch`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ coApplicants }),
          }
        );

        if (!createResponse.ok) {
          const data = await createResponse.json();
          throw new Error(data.error || "Erreur lors de la création des co-applicants");
        }
      }

      router.push(`/apply/${applicationId}/step-6`);
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
            Occupants
          </h1>
          <p className="text-xl text-neutral-600 font-light">
            Qui habitera dans le logement avec vous ?
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

        {/* Occupants Section */}
        <div className="space-y-8 mb-16">
          <AnimatePresence>
            {occupants.map((occupant, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="p-6 border border-neutral-200 rounded-2xl bg-neutral-50/50 space-y-6"
              >
                <div className="flex justify-between items-center">
                  <h4 className="text-lg font-light text-neutral-900">
                    Occupant {index + 1}
                  </h4>
                  <button
                    onClick={() => removeOccupant(index)}
                    className="p-2 hover:bg-neutral-200 rounded-full transition-colors"
                  >
                    <X className="h-4 w-4 text-neutral-600" />
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <AppleFormField
                    id={`occupant-name-${index}`}
                    label="Nom"
                    value={occupant.name}
                    onChange={(value) => updateOccupant(index, "name", value)}
                    placeholder="Nom complet"
                  />
                  <AppleFormField
                    id={`occupant-age-${index}`}
                    label="Âge"
                    value={occupant.age}
                    onChange={(value) => updateOccupant(index, "age", value)}
                    placeholder="25"
                    type="number"
                    inputMode="numeric"
                  />
                  <div className="relative mb-8">
                    <label className="absolute left-0 top-0 text-xs text-neutral-600 font-light pointer-events-none">
                      Relation
                    </label>
                    <select
                      className="mt-6 w-full pt-6 pb-3 px-0 border-0 border-b-2 rounded-none bg-transparent font-light text-lg text-neutral-900 border-neutral-200 focus:outline-none focus:ring-0 focus:border-neutral-900 transition-colors"
                      value={
                        RELATION_OPTIONS.includes(
                          occupant.relationship as RelationOption
                        )
                          ? (occupant.relationship as RelationOption)
                          : "Autre"
                      }
                      onChange={(e) => {
                        const value = e.target.value as RelationOption;
                        if (value === "Autre") {
                          if (
                            RELATION_OPTIONS.includes(
                              occupant.relationship as RelationOption
                            )
                          ) {
                            updateOccupant(index, "relationship", "");
                          }
                        } else {
                          updateOccupant(index, "relationship", value);
                        }
                      }}
                    >
                      <option value="">Sélectionner</option>
                      {RELATION_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                    {(!RELATION_OPTIONS.includes(
                      occupant.relationship as RelationOption
                    ) ||
                      (RELATION_OPTIONS.includes(
                        occupant.relationship as RelationOption
                      ) &&
                        (occupant.relationship as RelationOption) === "Autre")) && (
                      <AppleFormField
                        id={`occupant-relationship-${index}`}
                        label="Précisez la relation"
                        value={
                          RELATION_OPTIONS.includes(
                            occupant.relationship as RelationOption
                          ) && occupant.relationship === "Autre"
                            ? ""
                            : occupant.relationship
                        }
                        onChange={(value) =>
                          updateOccupant(index, "relationship", value)
                        }
                        placeholder="ex: cousin, ami de longue date"
                      />
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={addOccupant}
            className="w-full py-4 border-2 border-dashed border-neutral-300 rounded-2xl text-neutral-600 font-light hover:border-neutral-900 hover:text-neutral-900 transition-colors flex items-center justify-center gap-2"
          >
            <Plus className="h-5 w-5" />
            Ajouter un occupant
          </motion.button>
        </div>

        {/* Co-applicants Section */}
        <div className="pt-12 border-t border-neutral-200">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mb-8"
          >
            <h3 className="text-2xl font-light text-neutral-900 mb-2">
              Co-applicants
            </h3>
            <p className="text-lg text-neutral-600 font-light mb-6">
              Y a-t-il d'autres personnes qui seront sur le bail ?
            </p>
            <p className="text-sm text-neutral-500 font-light mb-6">
              Co-locataires ou garants qui doivent également signer le bail
            </p>
            <div className="flex gap-6">
              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="radio"
                  name="hasCoApplicants"
                  checked={hasCoApplicants === true}
                  onChange={() => setHasCoApplicants(true)}
                  className="w-5 h-5 text-neutral-900 border-neutral-300 focus:ring-neutral-900 focus:ring-2"
                />
                <span className="text-base font-light text-neutral-700 group-hover:text-neutral-900 transition-colors">
                  Oui
                </span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="radio"
                  name="hasCoApplicants"
                  checked={hasCoApplicants === false}
                  onChange={() => {
                    setHasCoApplicants(false);
                    setCoApplicants([]);
                  }}
                  className="w-5 h-5 text-neutral-900 border-neutral-300 focus:ring-neutral-900 focus:ring-2"
                />
                <span className="text-base font-light text-neutral-700 group-hover:text-neutral-900 transition-colors">
                  Non
                </span>
              </label>
            </div>
          </motion.div>

          <AnimatePresence>
            {hasCoApplicants && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-8"
              >
                {coApplicants.map((coApp, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="p-6 border border-neutral-200 rounded-2xl bg-neutral-50/50 space-y-6"
                  >
                    <div className="flex justify-between items-center">
                      <h4 className="text-lg font-light text-neutral-900">
                        Co-applicant {index + 1}
                      </h4>
                      <button
                        onClick={() => removeCoApplicant(index)}
                        className="p-2 hover:bg-neutral-200 rounded-full transition-colors"
                      >
                        <X className="h-4 w-4 text-neutral-600" />
                      </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <AppleFormField
                        id={`coapp-name-${index}`}
                        label="Nom complet"
                        value={coApp.name}
                        onChange={(value) => updateCoApplicant(index, "name", value)}
                        placeholder="Jean Dupont"
                        required
                      />
                      <AppleFormField
                        id={`coapp-email-${index}`}
                        label="Email"
                        value={coApp.email}
                        onChange={(value) => updateCoApplicant(index, "email", value)}
                        placeholder="jean@example.com"
                        type="email"
                        inputMode="email"
                        required
                      />
                      <div className="relative mb-8">
                        <label className="absolute left-0 top-0 text-xs text-neutral-600 font-light pointer-events-none">
                          Rôle
                        </label>
                        <Select
                          value={coApp.role}
                          onValueChange={(value: "CO_TENANT" | "GUARANTOR" | "OTHER") =>
                            updateCoApplicant(index, "role", value)
                          }
                        >
                          <SelectTrigger className="mt-6 pt-6 pb-3 px-0 border-0 border-b-2 rounded-none bg-transparent font-light text-lg text-neutral-900 border-neutral-200 focus:ring-0 focus:border-neutral-900">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="CO_TENANT">Co-locataire</SelectItem>
                            <SelectItem value="GUARANTOR">Garant</SelectItem>
                            <SelectItem value="OTHER">Autre</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <p className="text-xs text-neutral-500 font-light -mt-4">
                      Une invitation sera envoyée à cet email
                    </p>
                  </motion.div>
                ))}

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={addCoApplicant}
                  className="w-full py-4 border-2 border-dashed border-neutral-300 rounded-2xl text-neutral-600 font-light hover:border-neutral-900 hover:text-neutral-900 transition-colors flex items-center justify-center gap-2"
                >
                  <Plus className="h-5 w-5" />
                  Ajouter un co-applicant
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex justify-between items-center pt-12 mt-8 border-t border-neutral-100"
        >
          <AppleButton
            variant="ghost"
            onClick={() => router.push(`/apply/${applicationId}/step-4`)}
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
