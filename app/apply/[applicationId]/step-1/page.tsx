"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { AppleFormField } from "@/components/apple-form-field";
import { AppleButton } from "@/components/apple-button";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";

export default function Step1IdentityPage() {
  const params = useParams();
  const router = useRouter();
  const applicationId = params.applicationId as string;

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    phone: "",
    email: "",
    sin: "", // Optionnel selon CORPIQ
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
      if (data.answers?.identity) {
        const identity = data.answers.identity;
        // Support pour l'ancien format (legalName) et le nouveau format (firstName/lastName)
        if (identity.legalName && !identity.firstName) {
          const nameParts = identity.legalName.split(' ');
          setFormData({
            firstName: nameParts[0] || "",
            lastName: nameParts.slice(1).join(' ') || "",
            dateOfBirth: identity.dateOfBirth || "",
            phone: identity.phone || "",
            email: identity.email || "",
            sin: identity.sin || "",
          });
        } else {
          setFormData({
            firstName: identity.firstName || "",
            lastName: identity.lastName || "",
            dateOfBirth: identity.dateOfBirth || "",
            phone: identity.phone || "",
            email: identity.email || "",
            sin: identity.sin || "",
          });
        }
      }
    } catch (err) {
      console.error("Error fetching application:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNext = async () => {
    if (!formData.firstName || !formData.lastName || !formData.dateOfBirth || !formData.phone || !formData.email) {
      setError("Veuillez remplir tous les champs obligatoires");
      return;
    }

    // Validation de l'email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email.trim())) {
      setError("L'adresse email n'est pas valide");
      return;
    }

    // Validation du format de la date de naissance (jj/mm/aaaa)
    const dobRegex =
      /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/;
    if (!dobRegex.test(formData.dateOfBirth.trim())) {
      setError(
        "La date de naissance doit être au format jj/mm/aaaa (ex: 05/09/1995)."
      );
      return;
    }

    // Validation du format du numéro de téléphone (format nord-américain assez souple)
    const phoneRegex =
      /^(\+1[\s\-]?)?(\(?\d{3}\)?[\s\-]?)\d{3}[\s\-]?\d{4}$/;
    if (!phoneRegex.test(formData.phone.trim())) {
      setError(
        "Le numéro de téléphone doit être au format valide (ex: 514-123-4567)."
      );
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/applications/${applicationId}/steps/identity`,
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

      router.push(`/apply/${applicationId}/step-2`);
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
            Informations personnelles
          </h1>
          <p className="text-xl text-neutral-600 font-light">
            Veuillez fournir vos informations d'identité
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
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            <AppleFormField
              id="firstName"
              label="Prénom"
              value={formData.firstName}
              onChange={(value) =>
                setFormData({ ...formData, firstName: value })
              }
              placeholder="Jean"
              required
              error={
                !formData.firstName && error ? "Le prénom est requis" : undefined
              }
            />
            <AppleFormField
              id="lastName"
              label="Nom de famille"
              value={formData.lastName}
              onChange={(value) =>
                setFormData({ ...formData, lastName: value })
              }
              placeholder="Dupont"
              required
              error={
                !formData.lastName && error ? "Le nom est requis" : undefined
              }
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <AppleFormField
              id="dateOfBirth"
              label="Date de naissance"
              value={formData.dateOfBirth}
              onChange={(value) =>
                setFormData({ ...formData, dateOfBirth: value })
              }
              placeholder="jj/mm/aaaa"
              inputMode="numeric"
              required
              error={
                formData.dateOfBirth &&
                !/^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/.test(
                  formData.dateOfBirth.trim()
                )
                  ? "Format invalide (jj/mm/aaaa)"
                  : !formData.dateOfBirth && error
                  ? "La date de naissance est requise"
                  : undefined
              }
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <AppleFormField
              id="phone"
              label="Téléphone"
              value={formData.phone}
              onChange={(value) =>
                setFormData({ ...formData, phone: value })
              }
              placeholder="514-123-4567"
              type="tel"
              inputMode="tel"
              pattern="^(\+1[\s\-]?)?(\(?\d{3}\)?[\s\-]?)\d{3}[\s\-]?\d{4}$"
              required
              error={
                formData.phone &&
                !/^(\+1[\s\-]?)?(\(?\d{3}\)?[\s\-]?)\d{3}[\s\-]?\d{4}$/.test(
                  formData.phone.trim()
                )
                  ? "Format invalide"
                  : !formData.phone && error
                  ? "Le téléphone est requis"
                  : undefined
              }
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <AppleFormField
              id="email"
              label="Email"
              value={formData.email}
              onChange={(value) =>
                setFormData({ ...formData, email: value })
              }
              placeholder="jean.dupont@example.com"
              type="email"
              inputMode="email"
              required
              error={
                formData.email &&
                !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())
                  ? "Format d'email invalide"
                  : !formData.email && error
                  ? "L'email est requis"
                  : undefined
              }
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <AppleFormField
              id="sin"
              label="SIN (optionnel)"
              value={formData.sin}
              onChange={(value) =>
                setFormData({ ...formData, sin: value })
              }
              placeholder="123 456 789"
              inputMode="numeric"
              helperText="Le numéro d'assurance sociale peut aider à éviter toute confusion concernant votre identité et votre dossier de crédit. Si non inclus, cela ne constituera pas un motif de refus."
            />
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
            onClick={() => router.push("/me/appointments")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Annuler
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

