"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowRight, ArrowLeft } from "lucide-react";

export default function Step1IdentityPage() {
  const params = useParams();
  const router = useRouter();
  const applicationId = params.applicationId as string;

  const [formData, setFormData] = useState({
    legalName: "",
    dateOfBirth: "",
    phone: "",
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
        setFormData(data.answers.identity);
      }
    } catch (err) {
      console.error("Error fetching application:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNext = async () => {
    if (!formData.legalName || !formData.dateOfBirth || !formData.phone) {
      setError("Veuillez remplir tous les champs obligatoires");
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
    return <div className="text-center py-20">Chargement...</div>;
  }

  return (
    <Card className="border-2">
      <CardHeader>
        <CardTitle className="text-2xl">Étape 1 : Identité</CardTitle>
        <p className="text-gray-600 mt-2">
          Veuillez fournir vos informations d'identité légale
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        <div>
          <Label htmlFor="legalName">
            Nom légal complet <span className="text-red-500">*</span>
          </Label>
          <Input
            id="legalName"
            value={formData.legalName}
            onChange={(e) =>
              setFormData({ ...formData, legalName: e.target.value })
            }
            placeholder="Jean Dupont"
            className="mt-2"
            required
          />
        </div>

        <div>
          <Label htmlFor="dateOfBirth">
            Date de naissance <span className="text-red-500">*</span>
          </Label>
          <Input
            id="dateOfBirth"
            type="date"
            value={formData.dateOfBirth}
            onChange={(e) =>
              setFormData({ ...formData, dateOfBirth: e.target.value })
            }
            className="mt-2"
            required
          />
        </div>

        <div>
          <Label htmlFor="phone">
            Téléphone <span className="text-red-500">*</span>
          </Label>
          <Input
            id="phone"
            type="tel"
            value={formData.phone}
            onChange={(e) =>
              setFormData({ ...formData, phone: e.target.value })
            }
            placeholder="514-123-4567"
            className="mt-2"
            required
          />
        </div>

        <div className="flex justify-between pt-6">
          <Button
            variant="outline"
            onClick={() => router.push("/me/appointments")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Annuler
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

