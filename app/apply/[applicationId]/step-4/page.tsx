"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { AppleFormField } from "@/components/apple-form-field";
import { AppleButton } from "@/components/apple-button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { ArrowRight, ArrowLeft, Plus, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const EMPLOYMENT_STATUS_OPTIONS = [
  { value: "FULL_TIME", label: "Temps plein" },
  { value: "PART_TIME", label: "Temps partiel" },
  { value: "PERMANENT", label: "Permanent" },
  { value: "CONTRACT", label: "Sous contrat" },
] as const;

interface EmployerData {
  company: string;
  phone: string;
  extension: string;
  address: string;
  position: string;
  supervisorName: string;
  annualSalary: string;
  hourlyRate: string;
  salaryType: "annual" | "hourly" | "";
  employmentStatus: string;
  employedSince: string;
}

export default function Step4EmployersPage() {
  const params = useParams();
  const router = useRouter();
  const applicationId = params.applicationId as string;

  const [employer1, setEmployer1] = useState<EmployerData>({
    company: "",
    phone: "",
    extension: "",
    address: "",
    position: "",
    supervisorName: "",
    annualSalary: "",
    hourlyRate: "",
    salaryType: "",
    employmentStatus: "",
    employedSince: "",
  });
  const [employer2, setEmployer2] = useState<EmployerData>({
    company: "",
    phone: "",
    extension: "",
    address: "",
    position: "",
    supervisorName: "",
    annualSalary: "",
    hourlyRate: "",
    salaryType: "",
    employmentStatus: "",
    employedSince: "",
  });
  const [hasSecondEmployer, setHasSecondEmployer] = useState(false);
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
      if (data.answers?.employers) {
        if (data.answers.employers.employer1) {
          setEmployer1(data.answers.employers.employer1);
        }
        if (data.answers.employers.employer2) {
          setEmployer2(data.answers.employers.employer2);
          setHasSecondEmployer(true);
        }
      }
    } catch (err) {
      console.error("Error fetching application:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const updateEmployer = (employerNum: 1 | 2, field: keyof EmployerData, value: string) => {
    if (employerNum === 1) {
      setEmployer1((prev) => ({ ...prev, [field]: value }));
    } else {
      setEmployer2((prev) => ({ ...prev, [field]: value }));
    }
  };

  const handleNext = async () => {
    // Validation employeur 1 (requis)
    if (!employer1.company || !employer1.position || !employer1.employedSince) {
      setError("Veuillez remplir au moins les champs obligatoires pour l'employeur 1");
      return;
    }

    if (hasSecondEmployer && !employer2.company) {
      setError("Si vous avez un deuxième employeur, veuillez remplir au moins le nom de l'entreprise");
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/applications/${applicationId}/steps/income`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            data: {
              employer1,
              employer2: hasSecondEmployer ? employer2 : null,
            },
          }),
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Erreur lors de la sauvegarde");
      }

      router.push(`/apply/${applicationId}/step-5`);
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

  const renderEmployerForm = (employer: EmployerData, employerNum: 1 | 2, updateFn: (field: keyof EmployerData, value: string) => void) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-8 border-2 border-neutral-200 rounded-3xl bg-neutral-50/30 space-y-6"
    >
      <h3 className="text-3xl font-light text-neutral-900 mb-6">Employeur {employerNum}</h3>
      
      <div className="space-y-2">
        <AppleFormField
          id={`employer${employerNum}-company`}
          label="Entreprise"
          value={employer.company}
          onChange={(value) => updateFn("company", value)}
          placeholder="Nom de l'entreprise"
          required={employerNum === 1}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <AppleFormField
            id={`employer${employerNum}-phone`}
            label="Téléphone"
            value={employer.phone}
            onChange={(value) => updateFn("phone", value)}
            placeholder="514-123-4567"
            type="tel"
            inputMode="tel"
          />
          <AppleFormField
            id={`employer${employerNum}-extension`}
            label="Poste"
            value={employer.extension}
            onChange={(value) => updateFn("extension", value)}
            placeholder="1234"
            inputMode="numeric"
          />
        </div>

        <AppleFormField
          id={`employer${employerNum}-address`}
          label="Adresse"
          value={employer.address}
          onChange={(value) => updateFn("address", value)}
          placeholder="123 Rue Example, Montréal"
        />

        <AppleFormField
          id={`employer${employerNum}-position`}
          label="Poste occupé"
          value={employer.position}
          onChange={(value) => updateFn("position", value)}
          placeholder="Développeur web"
          required={employerNum === 1}
        />

        <AppleFormField
          id={`employer${employerNum}-supervisorName`}
          label="Nom du superviseur"
          value={employer.supervisorName}
          onChange={(value) => updateFn("supervisorName", value)}
          placeholder="Jean Dupont"
        />

        <div className="mb-8">
          <Label className="text-base font-light text-neutral-600 mb-4 block">
            Salaire annuel ou taux horaire
          </Label>
          <div className="flex gap-6 mb-4">
            <label className="flex items-center gap-3 cursor-pointer group">
              <input
                type="radio"
                name={`salaryType${employerNum}`}
                checked={employer.salaryType === "annual"}
                onChange={() => updateFn("salaryType", "annual")}
                className="w-5 h-5 text-neutral-900 border-neutral-300 focus:ring-neutral-900 focus:ring-2"
              />
              <span className="text-base font-light text-neutral-700 group-hover:text-neutral-900 transition-colors">
                Salaire annuel
              </span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer group">
              <input
                type="radio"
                name={`salaryType${employerNum}`}
                checked={employer.salaryType === "hourly"}
                onChange={() => updateFn("salaryType", "hourly")}
                className="w-5 h-5 text-neutral-900 border-neutral-300 focus:ring-neutral-900 focus:ring-2"
              />
              <span className="text-base font-light text-neutral-700 group-hover:text-neutral-900 transition-colors">
                Taux horaire
              </span>
            </label>
          </div>
          {employer.salaryType === "annual" && (
            <AppleFormField
              id={`employer${employerNum}-annualSalary`}
              label="Salaire annuel ($)"
              value={employer.annualSalary}
              onChange={(value) => updateFn("annualSalary", value)}
              placeholder="60000"
              type="number"
              inputMode="numeric"
            />
          )}
          {employer.salaryType === "hourly" && (
            <AppleFormField
              id={`employer${employerNum}-hourlyRate`}
              label="Taux horaire ($/heure)"
              value={employer.hourlyRate}
              onChange={(value) => updateFn("hourlyRate", value)}
              placeholder="30"
              type="number"
              inputMode="numeric"
            />
          )}
        </div>

        <div className="mb-8">
          <Label className="text-base font-light text-neutral-600 mb-4 block">
            Statut d'emploi
          </Label>
          <Select
            value={employer.employmentStatus}
            onValueChange={(value) => updateFn("employmentStatus", value)}
          >
            <SelectTrigger className="pt-6 pb-3 px-0 border-0 border-b-2 rounded-none bg-transparent font-light text-lg text-neutral-900 border-neutral-200 focus:ring-0 focus:border-neutral-900">
              <SelectValue placeholder="Sélectionnez" />
            </SelectTrigger>
            <SelectContent>
              {EMPLOYMENT_STATUS_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <AppleFormField
          id={`employer${employerNum}-employedSince`}
          label="Employé depuis"
          value={employer.employedSince}
          onChange={(value) => updateFn("employedSince", value)}
          placeholder="aaaa-mm-jj"
          type="date"
          required={employerNum === 1}
        />
      </div>
    </motion.div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="bg-white rounded-3xl p-12 md:p-16 shadow-sm"
    >
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="mb-12"
        >
          <h1 className="text-5xl md:text-6xl font-light text-neutral-900 mb-4 tracking-tight">
            Employeurs
          </h1>
          <p className="text-xl text-neutral-600 font-light">
            Informations sur votre (vos) employeur(s)
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

        <div className="space-y-8">
          {renderEmployerForm(employer1, 1, (field, value) => updateEmployer(1, field, value))}

          <div className="flex items-center gap-4 mb-4">
            <input
              type="checkbox"
              id="hasSecondEmployer"
              checked={hasSecondEmployer}
              onChange={(e) => {
                setHasSecondEmployer(e.target.checked);
                if (!e.target.checked) {
                  setEmployer2({
                    company: "",
                    phone: "",
                    extension: "",
                    address: "",
                    position: "",
                    supervisorName: "",
                    annualSalary: "",
                    hourlyRate: "",
                    salaryType: "",
                    employmentStatus: "",
                    employedSince: "",
                  });
                }
              }}
              className="w-5 h-5 text-neutral-900 border-neutral-300 focus:ring-neutral-900 focus:ring-2"
            />
            <Label htmlFor="hasSecondEmployer" className="text-base font-light text-neutral-700 cursor-pointer">
              J'ai un deuxième employeur
            </Label>
          </div>

          <AnimatePresence>
            {hasSecondEmployer && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                {renderEmployerForm(employer2, 2, (field, value) => updateEmployer(2, field, value))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex justify-between items-center pt-12 mt-8 border-t border-neutral-100"
        >
          <AppleButton
            variant="ghost"
            onClick={() => router.push(`/apply/${applicationId}/step-3`)}
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
