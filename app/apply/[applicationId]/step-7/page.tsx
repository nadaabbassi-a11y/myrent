"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowRight, ArrowLeft, FileText } from "lucide-react";

const REQUIRED_DOCUMENTS = [
  "Pièce d'identité (permis de conduire ou passeport)",
  "Preuve de revenus (3 dernières fiches de paie ou avis d'imposition)",
  "Relevé bancaire (3 derniers mois)",
  "Lettre de recommandation d'un ancien propriétaire (si applicable)",
];

export default function Step7DocumentsPage() {
  const params = useParams();
  const router = useRouter();
  const applicationId = params.applicationId as string;

  const [documentsReady, setDocumentsReady] = useState<Record<string, boolean>>({});
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
      if (data.answers?.documents) {
        setDocumentsReady(data.answers.documents || {});
      }
    } catch (err) {
      console.error("Error fetching application:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleDocument = (doc: string) => {
    setDocumentsReady((prev) => ({
      ...prev,
      [doc]: !prev[doc],
    }));
  };

  const handleNext = async () => {
    setIsSaving(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/applications/${applicationId}/steps/documents`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ data: { documentsReady } }),
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Erreur lors de la sauvegarde");
      }

      router.push(`/apply/${applicationId}/step-8`);
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
        <CardTitle className="text-2xl">Étape 7 : Documents requis</CardTitle>
        <p className="text-gray-600 mt-2">
          Confirmez que vous avez les documents suivants prêts à être fournis
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        <div className="space-y-4">
          {REQUIRED_DOCUMENTS.map((doc) => (
            <div key={doc} className="flex items-center space-x-3 p-4 border rounded-lg">
              <Checkbox
                id={doc}
                checked={documentsReady[doc] || false}
                onCheckedChange={() => toggleDocument(doc)}
              />
              <Label htmlFor={doc} className="flex-1 cursor-pointer">
                {doc}
              </Label>
            </div>
          ))}
        </div>

        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <FileText className="h-4 w-4 inline mr-2" />
            Vous pourrez téléverser ces documents après la soumission de votre candidature.
          </p>
        </div>

        <div className="flex justify-between pt-6">
          <Button
            variant="outline"
            onClick={() => router.push(`/apply/${applicationId}/step-6`)}
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

