"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowRight, ArrowLeft, Plus, X } from "lucide-react";

export default function Step5OccupantsPage() {
  const params = useParams();
  const router = useRouter();
  const applicationId = params.applicationId as string;

  const [occupants, setOccupants] = useState<Array<{ name: string; age: string; relationship: string }>>([]);
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

  const handleNext = async () => {
    setIsSaving(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/applications/${applicationId}/steps/occupants`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ data: { occupants } }),
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Erreur lors de la sauvegarde");
      }

      router.push(`/apply/${applicationId}/step-6`);
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
        <CardTitle className="text-2xl">Étape 5 : Occupants</CardTitle>
        <p className="text-gray-600 mt-2">
          Qui habitera dans le logement avec vous ?
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {occupants.map((occupant, index) => (
          <div key={index} className="p-4 border rounded-lg space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="font-semibold">Occupant {index + 1}</h4>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeOccupant(index)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Nom</Label>
                <Input
                  value={occupant.name}
                  onChange={(e) => updateOccupant(index, "name", e.target.value)}
                  placeholder="Nom complet"
                />
              </div>
              <div>
                <Label>Âge</Label>
                <Input
                  type="number"
                  value={occupant.age}
                  onChange={(e) => updateOccupant(index, "age", e.target.value)}
                  placeholder="25"
                />
              </div>
              <div>
                <Label>Relation</Label>
                <Input
                  value={occupant.relationship}
                  onChange={(e) => updateOccupant(index, "relationship", e.target.value)}
                  placeholder="Conjoint(e), enfant, etc."
                />
              </div>
            </div>
          </div>
        ))}

        <Button variant="outline" onClick={addOccupant} className="w-full">
          <Plus className="h-4 w-4 mr-2" />
          Ajouter un occupant
        </Button>

        <div className="flex justify-between pt-6">
          <Button
            variant="outline"
            onClick={() => router.push(`/apply/${applicationId}/step-4`)}
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

