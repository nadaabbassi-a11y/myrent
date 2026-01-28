"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { CheckCircle, Circle } from "lucide-react";

const STEPS = [
  { key: "identity", number: 1, label: "Identité" },
  { key: "address", number: 2, label: "Adresse" },
  { key: "status", number: 3, label: "Statut" },
  { key: "income", number: 4, label: "Revenus" },
  { key: "occupants", number: 5, label: "Occupants" },
  { key: "references", number: 6, label: "Références" },
  { key: "documents", number: 7, label: "Documents" },
  { key: "consents", number: 8, label: "Consentements" },
];

export default function ApplicationWizardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [currentStep, setCurrentStep] = useState<string>("identity");
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth/signin");
      return;
    }

    if (user && user.role !== "TENANT") {
      router.push("/");
      return;
    }

    // Extract step from URL
    const path = window.location.pathname;
    const stepMatch = path.match(/step-(\d+)/);
    if (stepMatch) {
      const stepNumber = parseInt(stepMatch[1]);
      if (stepNumber >= 1 && stepNumber <= 8) {
        setCurrentStep(STEPS[stepNumber - 1].key);
      }
    }

    // Fetch application to get completed steps
    if (params.applicationId) {
      fetchApplication();
    }
  }, [params.applicationId, user, authLoading, router]);

  const fetchApplication = async () => {
    try {
      const response = await fetch(`/api/applications/${params.applicationId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch application");
      }
      const data = await response.json();
      setCompletedSteps(
        data.steps.filter((s: any) => s.isComplete).map((s: any) => s.stepKey)
      );
    } catch (error) {
      console.error("Error fetching application:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading || isLoading) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-gray-50 py-12">
          <div className="container mx-auto px-4">
            <div className="text-center py-20">
              <p className="text-xl text-gray-500">Chargement...</p>
            </div>
          </div>
        </main>
      </>
    );
  }

  const currentStepIndex = STEPS.findIndex((s) => s.key === currentStep);

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Progress Indicator */}
          <Card className="mb-6 border-2">
            <CardContent className="p-6">
              <div className="flex items-center justify-between overflow-x-auto pb-2">
                {STEPS.map((step, index) => {
                  const isCompleted = completedSteps.includes(step.key);
                  const isCurrent = step.key === currentStep;
                  const isPast = index < currentStepIndex;

                  return (
                    <div
                      key={step.key}
                      className="flex items-center flex-shrink-0"
                    >
                      <div className="flex flex-col items-center">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors ${
                            isCompleted
                              ? "bg-green-500 border-green-500 text-white"
                              : isCurrent
                              ? "bg-violet-500 border-violet-500 text-white"
                              : isPast
                              ? "bg-gray-300 border-gray-300 text-gray-600"
                              : "bg-white border-gray-300 text-gray-400"
                          }`}
                        >
                          {isCompleted ? (
                            <CheckCircle className="h-5 w-5" />
                          ) : (
                            <span className="text-sm font-semibold">
                              {step.number}
                            </span>
                          )}
                        </div>
                        <span
                          className={`text-xs mt-2 text-center ${
                            isCurrent ? "font-semibold text-violet-600" : "text-gray-600"
                          }`}
                        >
                          {step.label}
                        </span>
                      </div>
                      {index < STEPS.length - 1 && (
                        <div
                          className={`h-0.5 w-16 mx-2 ${
                            isCompleted || isPast
                              ? "bg-green-500"
                              : "bg-gray-300"
                          }`}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
              <div className="mt-4 text-center text-sm text-gray-600">
                Étape {currentStepIndex + 1} sur {STEPS.length}
              </div>
            </CardContent>
          </Card>

          {/* Step Content */}
          {children}
        </div>
      </main>
    </>
  );
}

