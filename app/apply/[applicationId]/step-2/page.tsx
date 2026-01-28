"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowRight, ArrowLeft } from "lucide-react";

export default function Step2AddressPage() {
  const params = useParams();
  const router = useRouter();
  const applicationId = params.applicationId as string;

  const [formData, setFormData] = useState({
    currentAddress: "",
    city: "",
    postalCode: "",
    province: "",
    yearsAtAddress: "",
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
    if (!formData.currentAddress) {
      setError("L'adresse actuelle est requise");
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
    return <div className="text-center py-20">Chargement...</div>;
  }

  return (
    <Card className="border-2">
      <CardHeader>
        <CardTitle className="text-2xl">Étape 2 : Adresse actuelle</CardTitle>
        <p className="text-gray-600 mt-2">
          Où habitez-vous actuellement ?
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        <div>
          <Label htmlFor="currentAddress">
            Adresse complète <span className="text-red-500">*</span>
          </Label>
          <Textarea
            id="currentAddress"
            value={formData.currentAddress}
            onChange={(e) =>
              setFormData({ ...formData, currentAddress: e.target.value })
            }
            placeholder="123 Rue Example, Appartement 4"
            className="mt-2"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="city">Ville</Label>
            <Input
              id="city"
              value={formData.city}
              onChange={(e) =>
                setFormData({ ...formData, city: e.target.value })
              }
              placeholder="Montréal"
              className="mt-2"
            />
          </div>
          <div>
            <Label htmlFor="postalCode">Code postal</Label>
            <Input
              id="postalCode"
              value={formData.postalCode}
              onChange={(e) =>
                setFormData({ ...formData, postalCode: e.target.value })
              }
              placeholder="H1A 1A1"
              className="mt-2"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="province">Province</Label>
            <Input
              id="province"
              value={formData.province}
              onChange={(e) =>
                setFormData({ ...formData, province: e.target.value })
              }
              placeholder="Québec"
              className="mt-2"
            />
          </div>
          <div>
            <Label htmlFor="yearsAtAddress">Années à cette adresse</Label>
            <Input
              id="yearsAtAddress"
              type="number"
              value={formData.yearsAtAddress}
              onChange={(e) =>
                setFormData({ ...formData, yearsAtAddress: e.target.value })
              }
              placeholder="2"
              className="mt-2"
            />
          </div>
        </div>

        <div className="flex justify-between pt-6">
          <Button
            variant="outline"
            onClick={() => router.push(`/apply/${applicationId}/step-1`)}
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

