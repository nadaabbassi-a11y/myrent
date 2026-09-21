"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, usePathname } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { useAuth } from "@/hooks/useAuth";
import { CheckCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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
  const pathname = usePathname();
  const { user, isLoading: authLoading } = useAuth();
  const [currentStep, setCurrentStep] = useState<string>("identity");
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Update current step when pathname changes
  useEffect(() => {
    const stepMatch = pathname.match(/step-(\d+)/);
    if (stepMatch) {
      const stepNumber = parseInt(stepMatch[1]);
      if (stepNumber >= 1 && stepNumber <= 8) {
        const stepKey = STEPS[stepNumber - 1]?.key;
        if (stepKey) {
          setCurrentStep(stepKey);
        }
      }
    }
  }, [pathname]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth/signin");
      return;
    }

    if (user && user.role !== "TENANT") {
      router.push("/");
      return;
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

  const progress = ((currentStepIndex + 1) / STEPS.length) * 100;

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-white">
        <div className="container mx-auto px-6 py-8 max-w-5xl">
          {/* Progress Bar - Apple Style */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-light text-neutral-600">
                Étape {currentStepIndex >= 0 ? currentStepIndex + 1 : 1} sur {STEPS.length}
              </h2>
              <span className="text-sm font-light text-neutral-600">
                {Math.round(progress)}%
              </span>
            </div>
            <div className="h-1 bg-neutral-100 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-neutral-900 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              />
            </div>
          </motion.div>

          {/* Progress Steps - Minimalist */}
          <div className="mb-16 overflow-x-auto pb-4 -mx-6 px-6">
            <div className="flex items-center gap-4 min-w-max">
              {STEPS.map((step, index) => {
                const isCompleted = completedSteps.includes(step.key);
                const isCurrent = step.key === currentStep;
                const isPast = index < currentStepIndex;

                return (
                  <div key={step.key} className="flex items-center gap-4">
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex flex-col items-center"
                    >
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                          isCompleted
                            ? "bg-neutral-900 text-white"
                            : isCurrent
                            ? "bg-neutral-900 text-white ring-4 ring-neutral-100"
                            : isPast
                            ? "bg-neutral-200 text-neutral-600"
                            : "bg-neutral-100 text-neutral-400"
                        }`}
                      >
                        {isCompleted ? (
                          <CheckCircle className="h-4 w-4" />
                        ) : (
                          <span className="text-xs font-light">{step.number}</span>
                        )}
                      </div>
                      <span
                        className={`text-xs mt-2 whitespace-nowrap font-light transition-colors ${
                          isCurrent
                            ? "text-neutral-900"
                            : isCompleted || isPast
                            ? "text-neutral-600"
                            : "text-neutral-400"
                        }`}
                      >
                        {step.label}
                      </span>
                    </motion.div>
                    {index < STEPS.length - 1 && (
                      <div
                        className={`h-px w-8 transition-colors ${
                          index < currentStepIndex
                            ? "bg-neutral-900"
                            : "bg-neutral-200"
                        }`}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Step Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </>
  );
}

