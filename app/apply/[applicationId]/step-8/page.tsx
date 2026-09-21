"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, CheckCircle, AlertCircle } from "lucide-react";

const CONSENT_TEXTS = {
  TRUTHFUL_INFO: {
    title: "Certification de véracité",
    text: "Je certifie que les renseignements fournis sont véridiques et complets, et que je n'ai en aucune façon déformé, falsifié ou omis des faits qui pourraient invalider ce formulaire ou influencer la décision du propriétaire. Je comprends que faire une fausse déclaration peut entraîner l'annulation du bail et peut constituer une fraude en vertu du Code criminel.",
    version: "v1",
  },
  DATA_SHARING: {
    title: "Autorisation d'obtention et d'échange d'informations",
    text: "J'autorise par les présentes le propriétaire et ses représentants à obtenir ou à échanger mes renseignements personnels avec tout agent d'information personnelle, institutions financières, employeurs, propriétaires ou autres institutions, ainsi que les institutions et personnes susmentionnées afin d'établir ma capacité financière et ma capacité à respecter mes obligations de bail.",
    version: "v1",
  },
  CORPIQ_CONSENT: {
    title: "Autorisation CORPIQ",
    text: "J'autorise CORPIQ, en tant qu'agent d'information personnelle, à recueillir et à communiquer au propriétaire ou à ses représentants tout renseignement personnel qu'il pourrait avoir sur moi conformément à un consentement préalable.",
    version: "v1",
  },
  CONSENT_VALIDITY: {
    title: "Validité du consentement",
    text: "Mon consentement à la collecte et à la communication de mes renseignements personnels est valide pendant 14 jours calendaires à compter de la date de ma signature de la demande de location. Si un bail est signé, mon consentement demeure valide pendant trois ans suivant la fin de ce bail, mais uniquement pour récupérer les arriérés de loyer ou, en conformité avec une décision judiciaire, pour recouvrer toute autre dette liée au bail.",
    version: "v1",
  },
  LEASE_COMMITMENT: {
    title: "Engagement de signature du bail",
    text: "Je m'engage par les présentes à signer un bail au plus tard dans un délai raisonnable après avoir été informé que ma demande de location a été acceptée.",
    version: "v1",
  },
  DEPOSIT: {
    title: "Dépôt pour frais de vérification",
    text: "Pour couvrir les frais de vérification, j'ai donné au propriétaire un dépôt qui ne me sera pas remboursé si je refuse de signer un bail après avoir été informé que ma demande de location a été acceptée. Le propriétaire se réserve ses droits pour tout autre dommage subi dans l'éventualité où je refuserais de signer le bail.",
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

  // Check if required consents are checked (tous obligatoires selon CORPIQ)
  const hasRequiredConsents = 
    consents.TRUTHFUL_INFO && 
    consents.DATA_SHARING && 
    consents.CORPIQ_CONSENT && 
    consents.CONSENT_VALIDITY && 
    consents.LEASE_COMMITMENT;

  // Check if required steps are complete
  const requiredSteps = ['identity', 'address', 'status'];
  const completedSteps = applicationData?.steps
    ?.filter((s: any) => s.isComplete)
    .map((s: any) => s.stepKey) || [];
  
  const allRequiredStepsComplete = requiredSteps.every((step) =>
    completedSteps.includes(step)
  );

  // Check if income step is required based on status
  // answers is an object with stepKey as keys, not an array
  const statusData = applicationData?.answers?.status;
  const status = statusData?.status;
  const needsIncome = status === 'EMPLOYED' || status === 'SELF_EMPLOYED';
  const incomeStepComplete = !needsIncome || completedSteps.includes('income');

  const canSubmit = hasRequiredConsents && allRequiredStepsComplete && incomeStepComplete;

  return (
    <Card className="border-2">
      <CardHeader>
        <CardTitle className="text-2xl">Consentements et engagements</CardTitle>
        <p className="text-gray-600 mt-2">
          Veuillez lire attentivement et accepter les consentements requis selon le format CORPIQ
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
                    {type !== "DEPOSIT" ? (
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
            Les consentements marqués d'un astérisque (*) sont obligatoires pour soumettre votre candidature selon le format CORPIQ. Votre consentement est valide pour 14 jours calendaires. Si un bail est signé, il reste valide pendant 3 ans après la fin du bail pour récupérer les arriérés de loyer uniquement.
          </p>
        </div>

        {!canSubmit && (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800 font-semibold mb-2">
              <AlertCircle className="h-4 w-4 inline mr-2" />
              Pour soumettre votre candidature, vous devez :
            </p>
            <ul className="list-disc list-inside text-sm text-blue-700 space-y-1 ml-6">
              {!hasRequiredConsents && (
                <li>Accepter tous les consentements obligatoires (Certification, Autorisation d'échange, CORPIQ, Validité, Engagement)</li>
              )}
              {!allRequiredStepsComplete && (
                <li>Compléter toutes les étapes requises (Identité, Adresse, Statut)</li>
              )}
              {!incomeStepComplete && (
                <li>Compléter l'étape Revenus (requise pour votre statut)</li>
              )}
            </ul>
          </div>
        )}

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

