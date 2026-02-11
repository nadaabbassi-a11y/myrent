"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowRight, ArrowLeft, FileText } from "lucide-react";

const REQUIRED_DOCUMENTS = [
  {
    id: "photoId",
    label: "Pièce d'identité valide avec photo",
    description: "Permis de conduire, passeport ou autre pièce d'identité officielle",
  },
  {
    id: "studyWorkPermit",
    label: "Permis d'études ou permis de travail (si applicable)",
    description: "Pour les résidents temporaires",
  },
  {
    id: "signedApplication",
    label: "Formulaire complété et signé",
    description: "Ce formulaire une fois complété",
  },
  {
    id: "proofOfIncome",
    label: "Preuve de revenus",
    description: "Contrat de travail indiquant le salaire annuel ou les deux dernières fiches de paie",
  },
];

export default function Step7DocumentsPage() {
  const params = useParams();
  const router = useRouter();
  const applicationId = params.applicationId as string;

  const [documentsReady, setDocumentsReady] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<Array<{ url: string; name: string }>>([]);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    fetchApplication();
  }, [applicationId]);

  const fetchApplication = async () => {
    try {
      const response = await fetch(`/api/applications/${applicationId}`);
      if (!response.ok) throw new Error("Failed to fetch application");
      const data = await response.json();
      if (data.answers?.documents) {
        const docs = data.answers.documents;
        if (docs.documentsReady) {
          setDocumentsReady(docs.documentsReady || {});
          setUploadedFiles(docs.files || []);
        } else {
          // Ancien format (uniquement booléens)
          setDocumentsReady(docs || {});
        }
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

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setError(null);

    try {
      const newFiles: Array<{ url: string; name: string }> = [];

      for (const file of Array.from(files)) {
        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch("/api/upload-documents", {
          method: "POST",
          body: formData,
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Erreur lors de l'upload du fichier");
        }

        newFiles.push({
          url: data.url,
          name: data.originalName || file.name,
        });
      }

      setUploadedFiles((prev) => [...prev, ...newFiles]);
      // Réinitialiser l'input
      e.target.value = "";
    } catch (err: any) {
      console.error("Erreur upload document:", err);
      setError(err.message || "Erreur lors de l'upload du document");
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChangeForDoc = async (
    docLabel: string,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    setIsUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload-documents", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Erreur lors de l'upload du fichier");
      }

      setUploadedFiles((prev) => [
        ...prev,
        {
          url: data.url,
          name: `${docLabel} - ${data.originalName || file.name}`,
        },
      ]);

      e.target.value = "";
    } catch (err: any) {
      console.error("Erreur upload document:", err);
      setError(err.message || "Erreur lors de l'upload du document");
    } finally {
      setIsUploading(false);
    }
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
          body: JSON.stringify({ data: { documentsReady, files: uploadedFiles } }),
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
        <CardTitle className="text-2xl">Documents requis</CardTitle>
        <p className="text-gray-600 mt-2">
          Veuillez téléverser les documents suivants selon le format CORPIQ
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
            <div
              key={doc.id}
              className="space-y-2 p-6 border-2 border-neutral-200 rounded-2xl bg-white"
            >
              <div className="flex items-start space-x-3">
                <Checkbox
                  id={doc.id}
                  checked={documentsReady[doc.id] || false}
                  onCheckedChange={() => toggleDocument(doc.id)}
                  className="mt-1"
                />
                <div className="flex-1">
                  <Label htmlFor={doc.id} className="text-base font-light text-neutral-900 cursor-pointer block mb-1">
                    {doc.label}
                  </Label>
                  <p className="text-sm text-neutral-500 font-light">
                    {doc.description}
                  </p>
                </div>
              </div>
              <div className="pl-9">
                <p className="text-xs text-neutral-600 mb-2 font-light">
                  Téléverser ce document (PDF ou image) :
                </p>
                <input
                  type="file"
                  accept="application/pdf,image/*"
                  onChange={(e) => handleFileChangeForDoc(doc.label, e)}
                  className="text-xs"
                />
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-3">
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800 mb-2">
              <FileText className="h-4 w-4 inline mr-2" />
              Vous pouvez également ajouter d'autres documents
              complémentaires (PDF ou images). Ces fichiers seront visibles
              uniquement par le propriétaire pour l'évaluation de votre
              dossier.
            </p>
            <input
              type="file"
              multiple
              accept="application/pdf,image/*"
              onChange={handleFileChange}
              className="text-sm"
            />
            {isUploading && (
              <p className="text-xs text-blue-700 mt-1">Upload en cours...</p>
            )}
          </div>

          {uploadedFiles.length > 0 && (
            <div className="p-4 border rounded-lg bg-gray-50">
              <p className="text-sm font-semibold text-gray-800 mb-2">
                Documents téléversés
              </p>
              <ul className="text-sm space-y-1">
                {uploadedFiles.map((file, index) => (
                  <li key={index} className="flex items-center justify-between">
                    <span className="truncate mr-2">{file.name}</span>
                    <a
                      href={file.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-violet-600 text-xs underline"
                    >
                      Ouvrir
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
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

