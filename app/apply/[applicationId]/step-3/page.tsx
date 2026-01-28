"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowRight, ArrowLeft } from "lucide-react";

const STATUS_OPTIONS = [
  { value: "EMPLOYED", label: "Employé(e)" },
  { value: "SELF_EMPLOYED", label: "Travailleur autonome" },
  { value: "STUDENT", label: "Étudiant(e)" },
  { value: "UNEMPLOYED", label: "Sans emploi" },
  { value: "UNDER_GUARDIAN", label: "Sous tutelle" },
];

export default function Step3StatusPage() {
  const params = useParams();
  const router = useRouter();
  const applicationId = params.applicationId as string;

  const [status, setStatus] = useState<string>("");
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
      if (data.answers?.status?.status) {
        setStatus(data.answers.status.status);
      }
    } catch (err) {
      console.error("Error fetching application:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNext = async () => {
    if (!status) {
      setError("Veuillez sélectionner votre statut");
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/applications/${applicationId}/steps/status`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ data: { status } }),
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Erreur lors de la sauvegarde");
      }

      // If employed or self-employed, go to income step, otherwise skip it
      if (status === "EMPLOYED" || status === "SELF_EMPLOYED") {
        router.push(`/apply/${applicationId}/step-4`);
      } else {
        router.push(`/apply/${applicationId}/step-5`);
      }
    } catch (err: any) {
      setError(err.message || "Erreur lors de la sauvegarde");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="text-center py-20">Chargement...</div>;
  }

  return (
    <Card className="border-2">
      <CardHeader>
        <CardTitle className="text-2xl">Étape 3 : Statut d'emploi</CardTitle>
        <p className="text-gray-600 mt-2">
          Quel est votre statut d'emploi actuel ?
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        <div>
          <Label htmlFor="status">
            Statut d'emploi <span className="text-red-500">*</span>
          </Label>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger id="status" className="mt-2">
              <SelectValue placeholder="Sélectionnez votre statut" />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex justify-between pt-6">
          <Button
            variant="outline"
            onClick={() => router.push(`/apply/${applicationId}/step-2`)}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Précédent
          </Button>
          <Button
            onClick={handleNext}
            disabled={isSaving || !status}
            className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white"
          >
            Suivant
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

