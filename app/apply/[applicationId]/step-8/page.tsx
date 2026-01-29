"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, CheckCircle, AlertCircle } from "lucide-react";

const CONSENT_TEXTS = {
  CREDIT_CHECK: {
    title: "Vérification de crédit",
    text: "J'autorise le propriétaire à effectuer une vérification de crédit auprès d'agences de crédit autorisées pour évaluer ma solvabilité.",
    version: "v1",
  },
  REFERENCES_CONTACT: {
    title: "Contact des références",
    text: "J'autorise le propriétaire à contacter mes références (employeur, ancien propriétaire, etc.) pour vérifier les informations fournies.",
    version: "v1",
  },
  DATA_SHARING: {
    title: "Partage de données",
    text: "J'autorise le partage de mes informations personnelles avec le propriétaire et les services nécessaires pour le traitement de ma candidature.",
    version: "v1",
  },
};

export default function Step8ConsentsPage() {
  const params = useParams();
  const router = useRouter();
  const applicationId = params.applicationId as string;

  const [consents, setConsents] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [applicationData, setApplicationData] = useState<any>(null);

  useEffect(() => {
    fetchApplication();
  }, [applicationId]);

  const fetchApplication = async () => {
    try {
      const response = await fetch(`/api/applications/${applicationId}`);
      if (!response.ok) throw new Error("Failed to fetch application");
      const data = await response.json();
      setApplicationData(data);
      
      // Load existing consents
      const existingConsents: Record<string, boolean> = {};
      data.consents?.forEach((c: any) => {
        existingConsents[c.type] = true;
      });
      setConsents(existingConsents);
    } catch (err) {
      console.error("Error fetching application:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleConsent = (type: string) => {
    setConsents((prev) => ({
      ...prev,
      [type]: !prev[type],
    }));
  };

  const handleSubmit = async () => {
    // Save consents first
    setIsSubmitting(true);
    setError(null);

    try {
      // Save consents
      for (const [type, accepted] of Object.entries(consents)) {
        if (accepted) {
          const consentText = CONSENT_TEXTS[type as keyof typeof CONSENT_TEXTS];
          await fetch(`/api/applications/${applicationId}/consents`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              type,
              textVersion: consentText.version,
            }),
          });
        }
      }

      // Save consents step
      await fetch(`/api/applications/${applicationId}/steps/consents`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: { consents } }),
      });

      // Submit application
      const submitResponse = await fetch(
        `/api/applications/${applicationId}/submit`,
        {
          method: "POST",
        }
      );

      if (!submitResponse.ok) {
        const data = await submitResponse.json();
        throw new Error(data.error || "Erreur lors de la soumission");
      }

      // Redirect to success page or appointments
      router.push(`/me/appointments?submitted=${applicationId}`);
    } catch (err: any) {
      setError(err.message || "Erreur lors de la soumission");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div className="text-center py-20">Chargement...</div>;
  }

  // Check if required consents are checked
  const hasRequiredConsents = consents.CREDIT_CHECK && consents.DATA_SHARING;

  // Check if required steps are complete
  const requiredSteps = ['identity', 'address', 'status'];
  const completedSteps = applicationData?.steps
    ?.filter((s: any) => s.isComplete)
    .map((s: any) => s.stepKey) || [];
  
  const allRequiredStepsComplete = requiredSteps.every((step) =>
    completedSteps.includes(step)
  );

  // Check if income step is required based on status
  const statusAnswer = applicationData?.answers?.find((a: any) => a.stepKey === 'status');
  const status = statusAnswer?.data?.status;
  const needsIncome = status === 'EMPLOYED' || status === 'SELF_EMPLOYED';
  const incomeStepComplete = !needsIncome || completedSteps.includes('income');

  const canSubmit = hasRequiredConsents && allRequiredStepsComplete && incomeStepComplete;

  return (
    <Card className="border-2">
      <CardHeader>
        <CardTitle className="text-2xl">Étape 8 : Consentements et révision</CardTitle>
        <p className="text-gray-600 mt-2">
          Veuillez lire et accepter les consentements requis
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 flex items-start gap-2">
            <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <div className="space-y-4">
          {Object.entries(CONSENT_TEXTS).map(([type, consent]) => (
            <div key={type} className="p-4 border rounded-lg">
              <div className="flex items-start space-x-3">
                <Checkbox
                  id={type}
                  checked={consents[type] || false}
                  onCheckedChange={() => toggleConsent(type)}
                  className="mt-1"
                />
                <div className="flex-1">
                  <Label htmlFor={type} className="font-semibold cursor-pointer">
                    {consent.title}
                    {type === "CREDIT_CHECK" || type === "DATA_SHARING" ? (
                      <span className="text-red-500 ml-1">*</span>
                    ) : null}
                  </Label>
                  <p className="text-sm text-gray-600 mt-1">{consent.text}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            <AlertCircle className="h-4 w-4 inline mr-2" />
            Les consentements marqués d'un astérisque (*) sont obligatoires pour soumettre votre candidature.
          </p>
        </div>

        <div className="flex justify-between pt-6">
          <Button
            variant="outline"
            onClick={() => router.push(`/apply/${applicationId}/step-7`)}
            disabled={isSubmitting}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Précédent
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !canSubmit}
            className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
          >
            {isSubmitting ? (
              "Soumission..."
            ) : (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Soumettre la candidature
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

