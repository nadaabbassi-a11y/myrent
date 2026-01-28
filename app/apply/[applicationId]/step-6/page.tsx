"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowRight, ArrowLeft, Plus, X } from "lucide-react";

export default function Step6ReferencesPage() {
  const params = useParams();
  const router = useRouter();
  const applicationId = params.applicationId as string;

  const [references, setReferences] = useState<Array<{ name: string; phone: string; relationship: string; email?: string }>>([]);
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
      if (data.answers?.references) {
        setReferences(data.answers.references || []);
      }
    } catch (err) {
      console.error("Error fetching application:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const addReference = () => {
    setReferences([...references, { name: "", phone: "", relationship: "", email: "" }]);
  };

  const removeReference = (index: number) => {
    setReferences(references.filter((_, i) => i !== index));
  };

  const updateReference = (index: number, field: string, value: string) => {
    const updated = [...references];
    updated[index] = { ...updated[index], [field]: value };
    setReferences(updated);
  };

  const handleNext = async () => {
    setIsSaving(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/applications/${applicationId}/steps/references`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ data: { references } }),
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Erreur lors de la sauvegarde");
      }

      router.push(`/apply/${applicationId}/step-7`);
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
        <CardTitle className="text-2xl">Étape 6 : Références</CardTitle>
        <p className="text-gray-600 mt-2">
          Ajoutez des références (employeur, ancien propriétaire, etc.)
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {references.map((reference, index) => (
          <div key={index} className="p-4 border rounded-lg space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="font-semibold">Référence {index + 1}</h4>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeReference(index)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Nom</Label>
                <Input
                  value={reference.name}
                  onChange={(e) => updateReference(index, "name", e.target.value)}
                  placeholder="Nom complet"
                />
              </div>
              <div>
                <Label>Relation</Label>
                <Input
                  value={reference.relationship}
                  onChange={(e) => updateReference(index, "relationship", e.target.value)}
                  placeholder="Employeur, ancien propriétaire, etc."
                />
              </div>
              <div>
                <Label>Téléphone</Label>
                <Input
                  value={reference.phone}
                  onChange={(e) => updateReference(index, "phone", e.target.value)}
                  placeholder="514-123-4567"
                />
              </div>
              <div>
                <Label>Email (optionnel)</Label>
                <Input
                  type="email"
                  value={reference.email || ""}
                  onChange={(e) => updateReference(index, "email", e.target.value)}
                  placeholder="email@example.com"
                />
              </div>
            </div>
          </div>
        ))}

        <Button variant="outline" onClick={addReference} className="w-full">
          <Plus className="h-4 w-4 mr-2" />
          Ajouter une référence
        </Button>

        <div className="flex justify-between pt-6">
          <Button
            variant="outline"
            onClick={() => router.push(`/apply/${applicationId}/step-5`)}
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

