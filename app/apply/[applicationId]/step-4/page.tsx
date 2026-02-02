"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowRight, ArrowLeft } from "lucide-react";

export default function Step4IncomePage() {
  const params = useParams();
  const router = useRouter();
  const applicationId = params.applicationId as string;

  const [formData, setFormData] = useState({
    monthlyIncome: "",
    employerName: "",
    jobTitle: "",
    employmentStartDate: "",
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
      if (data.answers?.income) {
        setFormData(data.answers.income);
      }
      if (data.answers?.status?.status) {
        setFormData((prev) => ({ ...prev, previousStatus: data.answers.status.status }));
      }
    } catch (err) {
      console.error("Error fetching application:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNext = async () => {
    if (!formData.monthlyIncome) {
      setError("Le revenu mensuel est requis");
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
              ...formData,
              monthlyIncome: parseFloat(formData.monthlyIncome),
            }
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
    return <div className="text-center py-20">Chargement...</div>;
  }

  return (
    <Card className="border-2">
      <CardHeader>
        <CardTitle className="text-2xl">Étape 4 : Revenus</CardTitle>
        <p className="text-gray-600 mt-2">
          Informations sur vos revenus
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        <div>
          <Label htmlFor="monthlyIncome">
            Revenu mensuel (CAD) <span className="text-red-500">*</span>
          </Label>
          <Input
            id="monthlyIncome"
            type="number"
            value={formData.monthlyIncome}
            onChange={(e) =>
              setFormData({ ...formData, monthlyIncome: e.target.value })
            }
            placeholder="5000"
            className="mt-2"
            required
          />
        </div>

        <div>
          <Label htmlFor="employerName">Nom de l'employeur</Label>
          <Input
            id="employerName"
            value={formData.employerName}
            onChange={(e) =>
              setFormData({ ...formData, employerName: e.target.value })
            }
            placeholder="Nom de l'entreprise"
            className="mt-2"
          />
        </div>

        <div>
          <Label htmlFor="jobTitle">Titre du poste</Label>
          <Input
            id="jobTitle"
            value={formData.jobTitle}
            onChange={(e) =>
              setFormData({ ...formData, jobTitle: e.target.value })
            }
            placeholder="Développeur web"
            className="mt-2"
          />
        </div>

        <div>
          <Label htmlFor="employmentStartDate">Date de début d'emploi</Label>
          <Input
            id="employmentStartDate"
            type="date"
            value={formData.employmentStartDate}
            onChange={(e) =>
              setFormData({ ...formData, employmentStartDate: e.target.value })
            }
            className="mt-2"
          />
        </div>

        <div className="flex justify-between pt-6">
          <Button
            variant="outline"
            onClick={() => router.push(`/apply/${applicationId}/step-3`)}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Précédent
          </Button>
          <Button
            onClick={handleNext}
            disabled={isSaving}
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


